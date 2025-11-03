import { EventEmitter } from 'events'
import { sysLogger } from '@nodeUtils/sysLogger'
import { PacketEncoder, BasePacket, PacketType, ChatMessagePacket, BroadcastPacket } from './PacketEncoder'

/**
 * 消息处理器事件
 */
export interface MessageHandlerEvents {
  chatMessage: (packet: ChatMessagePacket) => void
  broadcast: (packet: BroadcastPacket) => void
  heartbeat: (packet: any) => void
  systemMessage: (packet: any) => void
  error: (packet: any) => void
  response: (packet: any) => void
  unknownPacket: (packet: any) => void
}

/**
 * 消息处理器配置
 */
export interface MessageHandlerOptions {
  enableLogging?: boolean // 是否启用日志
  enableValidation?: boolean // 是否验证数据包
}

/**
 * 消息统计信息
 */
export interface MessageStats {
  totalReceived: number
  totalSent: number
  lastReceived?: number
  lastSent?: number
  byType: Record<string, number>
}

/**
 * WebSocket 消息处理器
 * 负责处理消息的解析、分发、路由等功能
 */
export class MessageHandler extends EventEmitter {
  private stats: MessageStats
  private readonly options: Required<MessageHandlerOptions>
  private requestMap: Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }>

  constructor(options: MessageHandlerOptions = {}) {
    super()
    this.options = {
      enableLogging: options.enableLogging ?? true,
      enableValidation: options.enableValidation ?? true,
      ...options
    }
    this.requestMap = new Map()
    this.stats = {
      totalReceived: 0,
      totalSent: 0,
      byType: {}
    }
    this.setMaxListeners(50)
  }

  /**
   * 处理接收到的原始消息数据
   */
  public handleMessage(data: string | Buffer): void {
    try {
      // 转换为字符串
      const dataStr = typeof data === 'string' ? data : data.toString('utf8')

      // 解码数据包
      const packet = PacketEncoder.decode(dataStr)

      if (!packet) {
        sysLogger.error('Failed to decode packet')
        return
      }

      // 验证数据包
      if (this.options.enableValidation && !PacketEncoder.validatePacket(packet)) {
        sysLogger.error('Invalid packet received')
        return
      }

      // 更新统计信息
      this.updateStats('received', packet.header.type)

      // 日志记录
      if (this.options.enableLogging) {
        sysLogger.log(`[MessageHandler] Received packet: ${packet.header.type} (ID: ${packet.header.id})`)
      }

      // 分发消息
      this.dispatchPacket(packet)
    } catch (error) {
      sysLogger.error('Failed to handle message:', error)
    }
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
    try {
      const packet = PacketEncoder.createChatMessage(text, nickname, options)
      const encoded = PacketEncoder.encode(packet)

      // 更新统计信息
      this.updateStats('sent', packet.header.type)

      // 触发自定义事件
      this.emit('chatMessage', packet)

      return this.sendRaw(encoded)
    } catch (error) {
      sysLogger.error('Failed to send chat message:', error)
      return false
    }
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
    try {
      const packet = PacketEncoder.createBroadcast(text, nickname, broadcastType, options)
      const encoded = PacketEncoder.encode(packet)

      // 更新统计信息
      this.updateStats('sent', packet.header.type)

      // 触发自定义事件
      this.emit('broadcast', packet)

      return this.sendRaw(encoded)
    } catch (error) {
      sysLogger.error('Failed to send broadcast:', error)
      return false
    }
  }

  /**
   * 发送心跳
   */
  public sendHeartbeat(): boolean {
    try {
      const packet = PacketEncoder.createHeartbeat()
      const encoded = PacketEncoder.encode(packet)

      this.updateStats('sent', packet.header.type)

      return this.sendRaw(encoded)
    } catch (error) {
      sysLogger.error('Failed to send heartbeat:', error)
      return false
    }
  }

  /**
   * 发送请求并等待响应
   */
  public async sendRequest(
    packetType: PacketType,
    payload: any,
    timeout: number = 5000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const packetId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // 创建请求数据包
        const packet: BasePacket = {
          header: {
            id: packetId,
            type: packetType,
            timestamp: Date.now(),
            version: '1.0.0'
          },
          payload
        }

        const encoded = PacketEncoder.encode(packet)
        this.updateStats('sent', packetType)

        // 设置超时
        const timeoutHandle = setTimeout(() => {
          this.requestMap.delete(packetId)
          reject(new Error(`Request timeout after ${timeout}ms`))
        }, timeout)

        // 保存请求回调
        this.requestMap.set(packetId, { resolve, reject, timeout: timeoutHandle })

        // 发送请求
        this.sendRaw(encoded)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 响应请求
   */
  public sendResponse(requestId: string, success: boolean, data?: any, error?: string): boolean {
    try {
      const packet = PacketEncoder.createResponse(requestId, success, data, error)
      const encoded = PacketEncoder.encode(packet)

      this.updateStats('sent', packet.header.type)

      return this.sendRaw(encoded)
    } catch (error) {
      sysLogger.error('Failed to send response:', error)
      return false
    }
  }

  /**
   * 发送错误响应
   */
  public sendError(code: string | number, message: string, details?: any): boolean {
    try {
      const packet = PacketEncoder.createError(code, message, details)
      const encoded = PacketEncoder.encode(packet)

      this.updateStats('sent', packet.header.type)

      return this.sendRaw(encoded)
    } catch (error) {
      sysLogger.error('Failed to send error:', error)
      return false
    }
  }

  /**
   * 发送系统消息
   */
  public sendSystemMessage(message: string): boolean {
    try {
      const packet = PacketEncoder.createSystemMessage(message)
      const encoded = PacketEncoder.encode(packet)

      this.updateStats('sent', packet.header.type)

      return this.sendRaw(encoded)
    } catch (error) {
      sysLogger.error('Failed to send system message:', error)
      return false
    }
  }

  /**
   * 分发数据包到相应的事件处理器
   */
  private dispatchPacket(packet: BasePacket): void {
    const { type, payload } = packet.header

    switch (type) {
      case PacketType.CHAT_MESSAGE:
        this.emit('chatMessage', packet as ChatMessagePacket)
        break

      case PacketType.BROADCAST:
        this.emit('broadcast', packet as BroadcastPacket)
        break

      case PacketType.HEARTBEAT:
        this.emit('heartbeat', packet)
        break

      case PacketType.HEARTBEAT_RESPONSE:
        // 处理心跳响应，不需要特殊处理
        break

      case PacketType.SYSTEM_MESSAGE:
        this.emit('systemMessage', packet)
        break

      case PacketType.ERROR:
        this.emit('error', packet)
        break

      case PacketType.RESPONSE:
        // 处理响应，触发等待的 Promise
        this.handleResponse(packet as any)
        this.emit('response', packet)
        break

      default:
        sysLogger.warn(`Unknown packet type: ${type}`)
        this.emit('unknownPacket', packet)
    }
  }

  /**
   * 处理响应数据包
   */
  private handleResponse(packet: any): void {
    const { requestId, success, data, error } = packet.payload

    const pending = this.requestMap.get(requestId)
    if (pending) {
      clearTimeout(pending.timeout)
      this.requestMap.delete(requestId)

      if (success) {
        pending.resolve(data)
      } else {
        pending.reject(new Error(error || 'Request failed'))
      }
    } else {
      sysLogger.warn(`Received response for unknown request: ${requestId}`)
    }
  }

  /**
   * 发送原始数据（需要子类实现）
   */
  protected sendRaw(data: string): boolean {
    // 子类需要重写此方法来实现实际的发送逻辑
    throw new Error('Method not implemented')
  }

  /**
   * 更新统计信息
   */
  private updateStats(type: 'received' | 'sent', packetType: string): void {
    if (type === 'received') {
      this.stats.totalReceived++
      this.stats.lastReceived = Date.now()
    } else {
      this.stats.totalSent++
      this.stats.lastSent = Date.now()
    }

    this.stats.byType[packetType] = (this.stats.byType[packetType] || 0) + 1
  }

  /**
   * 获取统计信息
   */
  public getStats(): MessageStats {
    return { ...this.stats }
  }

  /**
   * 重置统计信息
   */
  public resetStats(): void {
    this.stats = {
      totalReceived: 0,
      totalSent: 0,
      byType: {}
    }
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    // 清理所有待处理的请求
    this.requestMap.forEach(({ timeout }) => {
      clearTimeout(timeout)
    })
    this.requestMap.clear()

    // 移除所有监听器
    this.removeAllListeners()
  }
}
