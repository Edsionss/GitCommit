import { EventEmitter } from 'events'
import { sysLogger } from '@nodeUtils/sysLogger'
import { ConnectionManager, ConnectionState, ConnectionManagerOptions, ConnectionManagerEvents } from './ConnectionManager'
import { MessageHandler, MessageHandlerOptions, MessageHandlerEvents } from './MessageHandler'
import { PacketType } from './PacketEncoder'

/**
 * WebSocket 客户端事件
 */
export interface WebSocketClientEvents extends ConnectionManagerEvents, MessageHandlerEvents {
  // 继承所有连接管理和消息处理事件
}

/**
 * WebSocket 客户端配置
 */
export interface WebSocketClientConfig {
  url: string
  connection?: Partial<ConnectionManagerOptions>
  messageHandler?: Partial<MessageHandlerOptions>
  autoConnect?: boolean // 是否自动连接
  enableStatistics?: boolean // 是否启用统计
}

/**
 * WebSocket 客户端状态
 */
export interface ClientState {
  connection: ConnectionState
  connectedAt?: number
  disconnectedAt?: number
  reconnectCount: number
  lastMessageAt?: number
}

/**
 * WebSocket 客户端统计信息
 */
export interface ClientStatistics {
  uptime: number // 运行时间（毫秒）
  totalConnections: number // 总连接次数
  totalReconnections: number // 总重连次数
  totalMessagesReceived: number // 总接收消息数
  totalMessagesSent: number // 总发送消息数
  averageLatency?: number // 平均延迟（毫秒）
  lastPingTime?: number // 最后一次 ping 时间
}

/**
 * WebSocket 客户端
 * 整合连接管理、消息处理等功能，提供简洁的 API
 */
export class WebSocketClient extends EventEmitter {
  private connectionManager: ConnectionManager
  private messageHandler: MessageHandler
  private config: Required<WebSocketClientConfig>
  private clientState: ClientState
  private statistics: ClientStatistics
  private latencyHistory: number[]
  private pingInterval: NodeJS.Timeout | null = null

  constructor(config: WebSocketClientConfig) {
    super()

    // 验证配置
    if (!config.url) {
      throw new Error('WebSocket URL is required')
    }

    this.config = {
      url: config.url,
      autoConnect: config.autoConnect ?? true,
      enableStatistics: config.enableStatistics ?? true,
      connection: {
        reconnectAttempts: 5,
        reconnectInterval: 3000,
        heartbeatInterval: 30000,
        heartbeatTimeout: 10000,
        connectTimeout: 5000,
        ...config.connection
      },
      messageHandler: {
        enableLogging: true,
        enableValidation: true,
        ...config.messageHandler
      }
    }

    // 初始化组件
    this.connectionManager = new ConnectionManager({
      url: this.config.url,
      ...this.config.connection
    })

    this.messageHandler = new MessageHandler(this.config.messageHandler)

    // 初始化状态
    this.clientState = {
      connection: ConnectionState.DISCONNECTED,
      reconnectCount: 0
    }

    this.statistics = {
      uptime: 0,
      totalConnections: 0,
      totalReconnections: 0,
      totalMessagesReceived: 0,
      totalMessagesSent: 0
    }

    this.latencyHistory = []

    // 设置事件监听
    this.setupEventListeners()

    // 自动连接
    if (this.config.autoConnect) {
      this.connect()
    }

    this.setMaxListeners(50)
  }

  /**
   * 建立连接
   */
  public async connect(): Promise<void> {
    try {
      this.statistics.totalConnections++
      await this.connectionManager.connect()
      this.clientState.connectedAt = Date.now()
    } catch (error) {
      sysLogger.error('Failed to connect:', error)
      throw error
    }
  }

  /**
   * 断开连接
   */
  public disconnect(code?: number, reason?: string): void {
    this.stopPing()
    this.connectionManager.close(code, reason)
    this.clientState.disconnectedAt = Date.now()
  }

  /**
   * 重连
   */
  public async reconnect(): Promise<void> {
    this.disconnect()
    await this.connect()
  }

  /**
   * 获取连接状态
   */
  public getState(): ClientState {
    return { ...this.clientState }
  }

  /**
   * 是否已连接
   */
  public isConnected(): boolean {
    return this.connectionManager.isConnected()
  }

  /**
   * 发送聊天消息
   */
  public sendChatMessage(
    text: string,
    nickname: string,
    options: {
      roomId?: string
      senderId?: string
    } = {}
  ): boolean {
    const success = this.messageHandler.sendChatMessage(text, nickname, options)
    if (success) {
      this.statistics.totalMessagesSent++
    }
    return success
  }

  /**
   * 发送广播消息
   */
  public sendBroadcast(
    text: string,
    nickname: string,
    broadcastType: 'global' | 'local' | 'room',
    options: {
      originIp?: string
      roomId?: string
    } = {}
  ): boolean {
    const success = this.messageHandler.sendBroadcast(text, nickname, broadcastType, options)
    if (success) {
      this.statistics.totalMessagesSent++
    }
    return success
  }

  /**
   * 发送系统消息
   */
  public sendSystemMessage(message: string): boolean {
    const success = this.messageHandler.sendSystemMessage(message)
    if (success) {
      this.statistics.totalMessagesSent++
    }
    return success
  }

  /**
   * 发送请求
   */
  public async sendRequest(
    packetType: PacketType,
    payload: any,
    timeout: number = 5000
  ): Promise<any> {
    return this.messageHandler.sendRequest(packetType, payload, timeout)
  }

  /**
   * 发送心跳
   */
  public sendHeartbeat(): boolean {
    const success = this.messageHandler.sendHeartbeat()
    if (success) {
      this.statistics.totalMessagesSent++
    }
    return success
  }

  /**
   * 启动 ping/pong 延迟检测
   */
  private startPing(): void {
    this.stopPing()

    this.pingInterval = setInterval(async () => {
      if (!this.isConnected()) return

      const start = Date.now()
      try {
        await this.sendRequest(PacketType.HEARTBEAT, { startTime: start }, 3000)
        const latency = Date.now() - start
        this.latencyHistory.push(latency)

        // 保持最近 100 次记录
        if (this.latencyHistory.length > 100) {
          this.latencyHistory.shift()
        }

        this.statistics.lastPingTime = latency
        this.statistics.averageLatency = this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length
      } catch (error) {
        sysLogger.warn('Ping failed:', error)
      }
    }, 30000) // 每 30 秒 ping 一次
  }

  /**
   * 停止 ping/pong 检测
   */
  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  /**
   * 获取统计信息
   */
  public getStatistics(): ClientStatistics {
    const now = Date.now()
    return {
      ...this.statistics,
      uptime: this.clientState.connectedAt ? now - this.clientState.connectedAt : 0
    }
  }

  /**
   * 获取消息统计
   */
  public getMessageStats() {
    return this.messageHandler.getStats()
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 连接管理事件
    this.connectionManager.on('connected', () => {
      this.clientState.connection = ConnectionState.CONNECTED
      this.clientState.reconnectCount = 0
      this.startPing()
      this.emit('connected')
      sysLogger.log('WebSocket client connected')
    })

    this.connectionManager.on('disconnected', (code?: number, reason?: string) => {
      this.clientState.connection = ConnectionState.DISCONNECTED
      this.clientState.disconnectedAt = Date.now()
      this.stopPing()
      this.emit('disconnected', code, reason)
      sysLogger.log('WebSocket client disconnected')
    })

    this.connectionManager.on('error', (error: Error) => {
      this.emit('error', error)
      sysLogger.error('WebSocket client error:', error.message)
    })

    this.connectionManager.on('stateChanged', (state: ConnectionState) => {
      this.clientState.connection = state
      this.emit('stateChanged', state)
    })

    this.connectionManager.on('reconnectionAttempt', (attempt: number) => {
      this.clientState.reconnectCount = attempt
      this.statistics.totalReconnections++
      this.emit('reconnectionAttempt', attempt)
      sysLogger.log(`Reconnection attempt ${attempt}`)
    })

    this.connectionManager.on('maxReconnectAttemptsReached', () => {
      this.emit('maxReconnectAttemptsReached')
      sysLogger.error('Max reconnection attempts reached')
    })

    this.connectionManager.on('heartbeatTimeout', () => {
      this.emit('heartbeatTimeout')
      sysLogger.warn('Heartbeat timeout')
    })

    // 消息处理事件
    this.connectionManager.on('message', (data: any) => {
      this.clientState.lastMessageAt = Date.now()
      this.messageHandler.handleMessage(data)
      this.statistics.totalMessagesReceived++
    })

    // 透传消息处理事件
    const messageEvents: (keyof MessageHandlerEvents)[] = [
      'chatMessage',
      'broadcast',
      'heartbeat',
      'systemMessage',
      'error',
      'response',
      'unknownPacket'
    ]

    messageEvents.forEach((event) => {
      this.messageHandler.on(event, (data: any) => {
        this.emit(event, data)
      })
    })
  }

  /**
   * 销毁客户端
   */
  public destroy(): void {
    this.stopPing()
    this.disconnect()
    this.connectionManager.destroy()
    this.messageHandler.destroy()
    this.removeAllListeners()
    sysLogger.log('WebSocket client destroyed')
  }
}
