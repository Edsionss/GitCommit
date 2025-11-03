import { EventEmitter } from 'events'
import WebSocket, { Data } from 'ws'
import { sysLogger } from '@nodeUtils/sysLogger'

/**
 * WebSocket 连接状态枚举
 */
export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  FAILED = 'FAILED'
}

/**
 * 连接管理器配置选项
 */
export interface ConnectionManagerOptions {
  url: string
  reconnectAttempts?: number // 最大重连次数，0 表示无限重连
  reconnectInterval?: number // 重连间隔（毫秒）
  heartbeatInterval?: number // 心跳间隔（毫秒）
  heartbeatTimeout?: number // 心跳超时（毫秒）
  connectTimeout?: number // 连接超时（毫秒）
}

/**
 * 连接管理器事件
 */
export interface ConnectionManagerEvents {
  connected: () => void
  disconnected: (code?: number, reason?: string) => void
  error: (error: Error) => void
  message: (data: Data) => void
  stateChanged: (state: ConnectionState) => void
  heartbeat: () => void
  heartbeatTimeout: () => void
  reconnectionAttempt: (attempt: number) => void
  maxReconnectAttemptsReached: () => void
}

/**
 * WebSocket 连接管理器
 * 提供连接管理、重连机制、心跳检测等功能
 */
export class ConnectionManager extends EventEmitter {
  private ws: WebSocket | null = null
  private state: ConnectionState = ConnectionState.DISCONNECTED
  private readonly options: Required<ConnectionManagerOptions>
  private reconnectCount = 0
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private connectTimeoutTimer: NodeJS.Timeout | null = null
  private isManuallyClosed = false

  constructor(options: ConnectionManagerOptions) {
    super()
    this.options = {
      reconnectAttempts: options.reconnectAttempts ?? 5,
      reconnectInterval: options.reconnectInterval ?? 3000,
      heartbeatInterval: options.heartbeatInterval ?? 30000,
      heartbeatTimeout: options.heartbeatTimeout ?? 10000,
      connectTimeout: options.connectTimeout ?? 5000,
      ...options
    }
    this.setMaxListeners(50) // 允许更多监听器
  }

  /**
   * 获取当前连接状态
   */
  public getState(): ConnectionState {
    return this.state
  }

  /**
   * 是否已连接
   */
  public isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * 获取底层 WebSocket 实例
   */
  public getWebSocket(): WebSocket | null {
    return this.ws
  }

  /**
   * 建立连接
   */
  public connect(): Promise<void> {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      sysLogger.log('WebSocket is already connecting or connected')
      return Promise.resolve()
    }

    this.isManuallyClosed = false
    this.updateState(ConnectionState.CONNECTING)

    return new Promise((resolve, reject) => {
      sysLogger.log(`Connecting to ${this.options.url}...`)

      this.ws = new WebSocket(this.options.url)

      // 连接超时处理
      this.connectTimeoutTimer = setTimeout(() => {
        if (this.state === ConnectionState.CONNECTING) {
          this.ws?.terminate()
          const error = new Error('Connection timeout')
          sysLogger.error(error.message)
          this.emit('error', error)
          reject(error)
        }
      }, this.options.connectTimeout)

      this.ws.on('open', () => {
        sysLogger.log('WebSocket connected successfully')
        clearTimeout(this.connectTimeoutTimer)
        this.reconnectCount = 0
        this.updateState(ConnectionState.CONNECTED)
        this.startHeartbeat()
        this.emit('connected')
        resolve()
      })

      this.ws.on('message', (data: Data) => {
        this.handleMessage(data)
      })

      this.ws.on('close', (code: number, reason: Buffer) => {
        clearTimeout(this.connectTimeoutTimer)
        this.stopHeartbeat()
        const reasonStr = reason.toString()
        sysLogger.log(`WebSocket closed (code: ${code}, reason: ${reasonStr || 'none'})`)

        this.updateState(ConnectionState.DISCONNECTED)
        this.emit('disconnected', code, reasonStr)

        if (!this.isManuallyClosed && this.shouldReconnect()) {
          this.attemptReconnect()
        }
      })

      this.ws.on('error', (error: Error) => {
        clearTimeout(this.connectTimeoutTimer)
        sysLogger.error('WebSocket error:', error.message)
        this.emit('error', error)
        reject(error)
      })
    })
  }

  /**
   * 手动关闭连接
   */
  public close(code?: number, reason?: string): void {
    this.isManuallyClosed = true
    this.clearAllTimers()
    if (this.ws) {
      this.ws.close(code, reason)
      this.ws = null
    }
    this.updateState(ConnectionState.DISCONNECTED)
  }

  /**
   * 强制重连
   */
  public reconnect(): void {
    this.close()
    this.connect()
  }

  /**
   * 发送数据
   */
  public send(data: Data): boolean {
    if (!this.isConnected()) {
      sysLogger.error('Cannot send data: WebSocket is not connected')
      return false
    }

    try {
      this.ws!.send(data)
      return true
    } catch (error) {
      sysLogger.error('Failed to send data:', error)
      return false
    }
  }

  /**
   * 发送 JSON 数据
   */
  public sendJson(data: any): boolean {
    return this.send(JSON.stringify(data))
  }

  /**
   * 开始心跳检测
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        // 发送心跳
        this.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }))
        this.emit('heartbeat')

        // 启动心跳超时检测
        setTimeout(() => {
          if (this.state === ConnectionState.CONNECTED) {
            sysLogger.warn('Heartbeat timeout - connection may be dead')
            this.emit('heartbeatTimeout')
            this.handleHeartbeatTimeout()
          }
        }, this.options.heartbeatTimeout)
      }
    }, this.options.heartbeatInterval)
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 处理心跳超时
   */
  private handleHeartbeatTimeout(): void {
    sysLogger.warn('Heartbeat timeout - closing connection')
    this.close()
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: Data): void {
    try {
      // 尝试解析为 JSON
      const str = data.toString()
      let parsed: any = null
      try {
        parsed = JSON.parse(str)
      } catch {
        // 不是 JSON，直接传递原始数据
      }

      // 如果是心跳响应，重置超时检测
      if (parsed && parsed.type === 'heartbeat-response') {
        return
      }

      this.emit('message', data)
    } catch (error) {
      sysLogger.error('Failed to handle message:', error)
      this.emit('error', error as Error)
    }
  }

  /**
   * 判断是否应该重连
   */
  private shouldReconnect(): boolean {
    return this.options.reconnectAttempts === 0 || this.reconnectCount < this.options.reconnectAttempts
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    if (!this.shouldReconnect()) {
      sysLogger.error('Max reconnection attempts reached')
      this.updateState(ConnectionState.FAILED)
      this.emit('maxReconnectAttemptsReached')
      return
    }

    this.reconnectCount++
    this.updateState(ConnectionState.RECONNECTING)
    this.emit('reconnectionAttempt', this.reconnectCount)

    sysLogger.log(`Reconnection attempt ${this.reconnectCount}/${this.options.reconnectAttempts === 0 ? 'unlimited' : this.options.reconnectAttempts}`)

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        sysLogger.error('Reconnection failed:', error)
      })
    }, this.options.reconnectInterval)
  }

  /**
   * 更新连接状态
   */
  private updateState(newState: ConnectionState): void {
    if (this.state !== newState) {
      const oldState = this.state
      this.state = newState
      sysLogger.log(`Connection state changed: ${oldState} -> ${newState}`)
      this.emit('stateChanged', newState)
    }
  }

  /**
   * 清除所有定时器
   */
  private clearAllTimers(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.connectTimeoutTimer) {
      clearTimeout(this.connectTimeoutTimer)
      this.connectTimeoutTimer = null
    }
  }

  /**
   * 销毁连接管理器
   */
  public destroy(): void {
    this.close()
    this.removeAllListeners()
  }
}
