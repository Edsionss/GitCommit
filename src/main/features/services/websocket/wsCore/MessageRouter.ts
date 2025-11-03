import { EventEmitter } from 'events'
import { sysLogger } from '@nodeUtils/sysLogger'
import { EncryptedData } from './CryptoManager'
import { RoomState, RoomMember } from './RoomManager'

/**
 * 发送模式枚举
 */
export enum SendMode {
  UNICAST = 'unicast',   // 单播：发送给一个接收者
  MULTICAST = 'multicast', // 组播：发送给多个接收者
  BROADCAST = 'broadcast', // 广播：发送给所有接收者
  ROOM = 'room'         // 房间：发送给房间内所有成员
}

/**
 * 消息目标
 */
export interface MessageTarget {
  type: SendMode
  recipientId?: string      // 单播目标
  recipientIds?: string[]   // 组播目标
  roomId?: string          // 房间ID
  excludeSelf?: boolean     // 是否排除发送者本人 (用于广播)
}

/**
 * 消息选项
 */
export interface MessageOptions {
  requiresAck?: boolean    // 是否需要确认
  ttl?: number            // 消息生存时间 (毫秒)
  priority?: number       // 消息优先级 (1-10, 10最高)
  encrypted?: boolean     // 是否加密
  roomKey?: string       // 房间密钥
  sessionKeyId?: string  // 会话密钥ID
  metadata?: Record<string, any> // 元数据
}

/**
 * 消息队列项
 */
export interface MessageQueueItem {
  messageId: string
  target: MessageTarget
  data: any
  options: Required<MessageOptions>
  createdAt: number
  attempts: number
  nextRetryAt?: number
  senderId: string
}

/**
 * 消息路由事件
 */
export interface MessageRouterEvents {
  messageQueued: (item: MessageQueueItem) => void
  messageSent: (messageId: string, target: MessageTarget) => void
  messageDelivered: (messageId: string, recipientId: string) => void
  messageFailed: (messageId: string, error: Error) => void
  messageExpired: (messageId: string) => void
  ackReceived: (messageId: string, recipientId: string) => void
  queueOverflow: (droppedCount: number) => void
}

/**
 * 消息统计
 */
export interface MessageStats {
  totalQueued: number
  totalSent: number
  totalDelivered: number
  totalFailed: number
  totalExpired: number
  currentQueueSize: number
  averageDeliveryTime: number // 平均投递时间 (毫秒)
  byMode: Record<SendMode, number>
}

/**
 * 消息路由器
 * 负责消息的路由、队列管理、投递确认等功能
 */
export class MessageRouter extends EventEmitter {
  private messageQueue: MessageQueueItem[] = []
  private inFlightMessages: Map<string, MessageQueueItem> = new Map()
  private deliveredMessages: Map<string, Set<string>> = new Map() // messageId -> Set of recipientIds
  private pendingAcks: Map<string, Map<string, NodeJS.Timeout>> = new Map() // messageId -> (recipientId -> timeout)
  private stats: MessageStats
  private queueTimer: NodeJS.Timeout | null = null
  private cleanupTimer: NodeJS.Timeout | null = null

  // 配置选项
  private readonly options = {
    maxQueueSize: 10000,        // 最大队列长度
    maxAttempts: 3,             // 最大重试次数
    retryDelay: 1000,           // 重试延迟 (毫秒)
    ackTimeout: 5000,           // 确认超时 (毫秒)
    processInterval: 100,       // 队列处理间隔 (毫秒)
    cleanupInterval: 60000      // 清理间隔 (毫秒)
  }

  constructor() {
    super()
    this.stats = {
      totalQueued: 0,
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalExpired: 0,
      currentQueueSize: 0,
      averageDeliveryTime: 0,
      byMode: {
        [SendMode.UNICAST]: 0,
        [SendMode.MULTICAST]: 0,
        [SendMode.BROADCAST]: 0,
        [SendMode.ROOM]: 0
      }
    }

    // 启动队列处理器
    this.startQueueProcessor()

    // 启动清理定时器
    this.startCleanupTimer()

    this.setMaxListeners(100)
    sysLogger.log('MessageRouter initialized')
  }

  /**
   * 队列消息
   */
  public queueMessage(
    senderId: string,
    target: MessageTarget,
    data: any,
    options: MessageOptions = {}
  ): string {
    const messageId = this.generateMessageId()

    const queueItem: MessageQueueItem = {
      messageId,
      target,
      data,
      options: {
        requiresAck: options.requiresAck ?? false,
        ttl: options.ttl ?? 60000,
        priority: options.priority ?? 5,
        encrypted: options.encrypted ?? false,
        roomKey: options.roomKey,
        sessionKeyId: options.sessionKeyId,
        metadata: options.metadata || {}
      },
      createdAt: Date.now(),
      attempts: 0,
      senderId
    }

    // 检查队列大小
    if (this.messageQueue.length >= this.options.maxQueueSize) {
      // 丢弃低优先级消息
      const dropped = this.dropLowPriorityMessages()
      this.emit('queueOverflow', dropped)
    }

    // 按优先级插入队列
    this.insertByPriority(queueItem)

    // 更新统计
    this.stats.totalQueued++
    this.stats.currentQueueSize++
    this.stats.byMode[target.type]++

    sysLogger.log('Message queued', {
      messageId,
      senderId,
      targetType: target.type,
      targetId: this.getTargetIdString(target),
      priority: queueItem.options.priority,
      queueSize: this.messageQueue.length
    })

    this.emit('messageQueued', queueItem)
    return messageId
  }

  /**
   * 发送消息 (同步发送)
   */
  public sendMessage(
    senderId: string,
    target: MessageTarget,
    data: any,
    options: MessageOptions = {}
  ): Promise<{ success: boolean; errors?: Error[] }> {
    return new Promise((resolve) => {
      const messageId = this.queueMessage(senderId, target, data, options)

      // 等待发送结果
      const checkResult = setInterval(() => {
        if (!this.inFlightMessages.has(messageId)) {
          clearInterval(checkResult)
          const delivered = this.deliveredMessages.get(messageId)
          const success = delivered && delivered.size > 0
          resolve({ success })
        }
      }, 100)

      // 超时处理
      setTimeout(() => {
        clearInterval(checkResult)
        resolve({ success: false })
      }, options.ttl || 60000)
    })
  }

  /**
   * 确认消息已送达
   */
  public acknowledge(messageId: string, recipientId: string): void {
    // 记录投递
    if (!this.deliveredMessages.has(messageId)) {
      this.deliveredMessages.set(messageId, new Set())
    }
    this.deliveredMessages.get(messageId)!.add(recipientId)

    this.stats.totalDelivered++

    // 清理待确认记录
    const pending = this.pendingAcks.get(messageId)
    if (pending?.has(recipientId)) {
      clearTimeout(pending.get(recipientId)!)
      pending.delete(recipientId)
    }

    // 移除进行中的消息
    this.inFlightMessages.delete(messageId)

    this.emit('ackReceived', messageId, recipientId)
    this.emit('messageDelivered', messageId, recipientId)

    sysLogger.log('Message acknowledged', { messageId, recipientId })
  }

  /**
   * 获取待发送给指定接收者的消息
   */
  public getPendingMessages(recipientId: string, roomId?: string): MessageQueueItem[] {
    return this.inFlightMessages.values().filter((item) => {
      const target = item.target

      // 单播匹配
      if (target.type === SendMode.UNICAST && target.recipientId === recipientId) {
        return true
      }

      // 组播匹配
      if (target.type === SendMode.MULTICAST && target.recipientIds?.includes(recipientId)) {
        return true
      }

      // 房间匹配
      if (target.type === SendMode.ROOM && target.roomId === roomId && !target.excludeSelf) {
        return true
      }

      // 广播匹配
      if (target.type === SendMode.BROADCAST && !target.excludeSelf) {
        return true
      }

      return false
    }).map(item => ({ ...item, data: { ...item.data } }))
  }

  /**
   * 验证消息目标
   */
  public validateTarget(target: MessageTarget): boolean {
    switch (target.type) {
      case SendMode.UNICAST:
        return !!target.recipientId

      case SendMode.MULTICAST:
        return !!(target.recipientIds && target.recipientIds.length > 0)

      case SendMode.ROOM:
        return !!target.roomId

      case SendMode.BROADCAST:
        return true

      default:
        return false
    }
  }

  /**
   * 获取目标接收者列表
   */
  public getTargetRecipients(target: MessageTarget, allRecipients: Map<string, RoomMember>): string[] {
    const recipients: string[] = []

    switch (target.type) {
      case SendMode.UNICAST:
        if (target.recipientId) {
          recipients.push(target.recipientId)
        }
        break

      case SendMode.MULTICAST:
        if (target.recipientIds) {
          recipients.push(...target.recipientIds.filter((id) => allRecipients.has(id)))
        }
        break

      case SendMode.ROOM:
        if (target.roomId) {
          // 房间内所有成员
          allRecipients.forEach((member) => {
            recipients.push(member.memberId)
          })
        }
        break

      case SendMode.BROADCAST:
        // 所有接收者
        allRecipients.forEach((member) => {
          recipients.push(member.memberId)
        })
        break
    }

    return recipients
  }

  /**
   * 取消消息
   */
  public cancelMessage(messageId: string): boolean {
    // 从队列中移除
    const queueIndex = this.messageQueue.findIndex((item) => item.messageId === messageId)
    if (queueIndex !== -1) {
      this.messageQueue.splice(queueIndex, 1)
      this.stats.currentQueueSize--
      sysLogger.log('Message cancelled from queue', { messageId })
      return true
    }

    // 从进行中移除
    if (this.inFlightMessages.has(messageId)) {
      this.inFlightMessages.delete(messageId)
      sysLogger.log('Message cancelled from in-flight', { messageId })
      return true
    }

    return false
  }

  /**
   * 清空队列
   */
  public clearQueue(): void {
    this.messageQueue = []
    this.stats.currentQueueSize = 0
    sysLogger.log('Queue cleared')
  }

  /**
   * 启动队列处理器
   */
  private startQueueProcessor(): void {
    this.queueTimer = setInterval(() => {
      this.processQueue()
    }, this.options.processInterval)
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredMessages()
    }, this.options.cleanupInterval)
  }

  /**
   * 处理队列
   */
  private processQueue(): void {
    if (this.messageQueue.length === 0) {
      return
    }

    // 获取最高优先级的消息
    const item = this.messageQueue.shift()!
    this.stats.currentQueueSize--

    // 检查是否超时
    if (Date.now() - item.createdAt > item.options.ttl) {
      this.stats.totalExpired++
      this.emit('messageExpired', item.messageId)
      sysLogger.log('Message expired', { messageId: item.messageId })
      return
    }

    // 移动到进行中
    this.inFlightMessages.set(item.messageId, item)

    // 发送消息 (模拟发送)
    this.simulateSend(item)

    sysLogger.log('Message processing', {
      messageId: item.messageId,
      targetType: item.target.type,
      attempts: item.attempts
    })
  }

  /**
   * 模拟发送消息 (实际实现时需要集成到 WebSocket)
   */
  private simulateSend(item: MessageQueueItem): void {
    this.stats.totalSent++

    // 触发发送事件，实际应用中这里会调用 WebSocket 发送
    this.emit('messageSent', item.messageId, item.target)

    // 如果需要确认，设置超时
    if (item.options.requiresAck) {
      this.setupAckTimeout(item.messageId)
    } else {
      // 无需确认的消息立即标记为完成
      this.inFlightMessages.delete(item.messageId)
    }
  }

  /**
   * 设置确认超时
   */
  private setupAckTimeout(messageId: string): void {
    if (!this.pendingAcks.has(messageId)) {
      this.pendingAcks.set(messageId, new Map())
    }

    const timeout = setTimeout(() => {
      this.handleAckTimeout(messageId)
    }, this.options.ackTimeout)

    this.pendingAcks.get(messageId)!.set('global', timeout)
  }

  /**
   * 处理确认超时
   */
  private handleAckTimeout(messageId: string): void {
    const item = this.inFlightMessages.get(messageId)

    if (!item) {
      return
    }

    item.attempts++

    if (item.attempts >= this.options.maxAttempts) {
      // 重试次数已用完
      this.inFlightMessages.delete(messageId)
      this.stats.totalFailed++
      this.emit('messageFailed', messageId, new Error('Max retry attempts reached'))
      sysLogger.error('Message failed after max attempts', { messageId })
    } else {
      // 重试
      item.nextRetryAt = Date.now() + this.options.retryDelay
      this.messageQueue.push(item)
      this.stats.currentQueueSize++
    }
  }

  /**
   * 清理过期消息
   */
  private cleanupExpiredMessages(): void {
    const now = Date.now()
    let cleaned = 0

    // 清理已投递消息的记录
    Array.from(this.deliveredMessages.entries()).forEach(([messageId, recipients]) => {
      // 保留最近 1000 条记录
      if (recipients.size > 1000) {
        this.deliveredMessages.delete(messageId)
        cleaned++
      }
    })

    // 清理待确认记录
    Array.from(this.pendingAcks.entries()).forEach(([messageId, timeouts]) => {
      if (!this.inFlightMessages.has(messageId)) {
        timeouts.forEach((timeout) => clearTimeout(timeout))
        this.pendingAcks.delete(messageId)
      }
    })

    if (cleaned > 0) {
      sysLogger.log('Cleanup completed', { cleaned })
    }
  }

  /**
   * 丢弃低优先级消息
   */
  private dropLowPriorityMessages(): number {
    let dropped = 0

    // 从最低优先级开始丢弃，直到有空间
    while (this.messageQueue.length >= this.options.maxQueueSize) {
      // 找到最低优先级的消息
      let minPriorityIndex = 0
      let minPriority = this.messageQueue[0].options.priority

      for (let i = 1; i < this.messageQueue.length; i++) {
        if (this.messageQueue[i].options.priority < minPriority) {
          minPriority = this.messageQueue[i].options.priority
          minPriorityIndex = i
        }
      }

      // 丢弃
      this.messageQueue.splice(minPriorityIndex, 1)
      dropped++
      this.stats.currentQueueSize--
    }

    return dropped
  }

  /**
   * 按优先级插入队列
   */
  private insertByPriority(item: MessageQueueItem): void {
    let inserted = false

    for (let i = 0; i < this.messageQueue.length; i++) {
      if (this.messageQueue[i].options.priority < item.options.priority) {
        this.messageQueue.splice(i, 0, item)
        inserted = true
        break
      }
    }

    if (!inserted) {
      this.messageQueue.push(item)
    }
  }

  /**
   * 生成消息ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取目标ID字符串
   */
  private getTargetIdString(target: MessageTarget): string {
    switch (target.type) {
      case SendMode.UNICAST:
        return target.recipientId || ''
      case SendMode.MULTICAST:
        return target.recipientIds?.join(',') || ''
      case SendMode.ROOM:
        return target.roomId || ''
      case SendMode.BROADCAST:
        return 'all'
      default:
        return ''
    }
  }

  /**
   * 获取统计信息
   */
  public getStats(): MessageStats {
    return { ...this.stats }
  }

  /**
   * 销毁路由器
   */
  public destroy(): void {
    if (this.queueTimer) {
      clearInterval(this.queueTimer)
      this.queueTimer = null
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    // 清理所有待确认定时器
    this.pendingAcks.forEach((timeouts) => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    })

    this.messageQueue = []
    this.inFlightMessages.clear()
    this.deliveredMessages.clear()
    this.pendingAcks.clear()

    this.removeAllListeners()

    sysLogger.log('MessageRouter destroyed')
  }
}
