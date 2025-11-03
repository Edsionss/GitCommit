import { EventEmitter } from 'events'
import { sysLogger } from '@nodeUtils/sysLogger'
import { WebSocketClient, WebSocketClientEvents, WebSocketClientConfig } from './WebSocketClient'
import { CryptoManager, EncryptedData, MessageMeta } from './CryptoManager'
import { RoomManager, RoomState, RoomMember, RoomRole } from './RoomManager'
import { MessageRouter, SendMode, MessageTarget, MessageOptions } from './MessageRouter'
import { PacketType } from './PacketEncoder'

/**
 * 安全客户端事件
 */
export interface SecureClientEvents extends WebSocketClientEvents {
  // 房间事件
  roomCreated: (roomId: string, config: RoomState) => void
  roomJoined: (roomId: string, member: RoomMember) => void
  roomLeft: (roomId: string) => void
  roomDestroyed: (roomId: string, reason: string) => void
  memberJoinedRoom: (roomId: string, member: RoomMember) => void
  memberLeftRoom: (roomId: string, memberId: string) => void
  memberKicked: (roomId: string, memberId: string, reason: string) => void

  // 加密事件
  keyExchangeCompleted: (sessionKeyId: string) => void
  encryptionEnabled: () => void
  encryptionDisabled: () => void

  // 安全事件
  securityError: (error: Error) => void
  unauthorized: (action: string) => void
}

/**
 * 安全客户端配置
 */
export interface SecureClientConfig extends WebSocketClientConfig {
  crypto?: {
    enableEncryption?: boolean // 默认启用加密
    sessionKeyLength?: number
    pbkdf2Iterations?: number
    autoRotateKey?: boolean // 自动轮换密钥
    rotateInterval?: number // 轮换间隔 (毫秒)
  }
  room?: {
    enableRoom?: boolean // 默认启用房间
    maxRooms?: number
    maxMembers?: number
    roomCleanupInterval?: number
    inactivityTimeout?: number
  }
  security?: {
    enableAuthentication?: boolean
    enableAuthorization?: boolean
    maxFailedAttempts?: number
  }
}

/**
 * 安全客户端状态
 */
export interface SecureClientState {
  isConnected: boolean
  isEncrypted: boolean
  sessionKeyId?: string
  currentUserId?: string
  currentNickname?: string
  joinedRooms: Set<string>
  lastActivity?: number
}

/**
 * 发送消息选项 (扩展版)
 */
export interface SecureMessageOptions extends MessageOptions {
  encrypt?: boolean // 是否加密消息
  deliveryConfirmation?: boolean // 是否需要送达确认
}

/**
 * 安全 WebSocket 客户端
 * 集成加密、房间管理、消息路由等功能
 */
export class SecureWebSocketClient extends EventEmitter {
  private client: WebSocketClient
  private crypto: CryptoManager
  private roomManager: RoomManager
  private router: MessageRouter
  private config: Required<SecureClientConfig>
  private state: SecureClientState
  private keyRotationTimer: NodeJS.Timeout | null = null

  constructor(config: SecureClientConfig) {
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
      },
      crypto: {
        enableEncryption: true,
        sessionKeyLength: 32,
        pbkdf2Iterations: 100000,
        autoRotateKey: false,
        rotateInterval: 3600000, // 1小时
        ...config.crypto
      },
      room: {
        enableRoom: true,
        maxRooms: 1000,
        maxMembers: 100,
        roomCleanupInterval: 3600000,
        inactivityTimeout: 86400000,
        ...config.room
      },
      security: {
        enableAuthentication: false,
        enableAuthorization: true,
        maxFailedAttempts: 5,
        ...config.security
      }
    }

    // 初始化组件
    this.client = new WebSocketClient({
      url: this.config.url,
      connection: this.config.connection,
      messageHandler: this.config.messageHandler,
      autoConnect: this.config.autoConnect
    })

    this.crypto = new CryptoManager({
      sessionKeyLength: this.config.crypto.sessionKeyLength,
      pbkdf2Iterations: this.config.crypto.pbkdf2Iterations
    })

    if (this.config.room.enableRoom) {
      this.roomManager = new RoomManager({
        maxRooms: this.config.room.maxRooms,
        maxMembers: this.config.room.maxMembers,
        roomCleanupInterval: this.config.room.roomCleanupInterval,
        inactivityTimeout: this.config.room.inactivityTimeout
      })
    }

    this.router = new MessageRouter()

    // 初始化状态
    this.state = {
      isConnected: false,
      isEncrypted: this.config.crypto.enableEncryption,
      joinedRooms: new Set()
    }

    // 设置事件监听
    this.setupEventListeners()

    // 自动连接
    if (this.config.autoConnect) {
      this.connect()
    }

    this.setMaxListeners(100)
    sysLogger.log('SecureWebSocketClient initialized', {
      encryption: this.config.crypto.enableEncryption,
      rooms: this.config.room.enableRoom
    })
  }

  /**
   * 建立连接并执行握手
   */
  public async connect(): Promise<void> {
    await this.client.connect()

    if (this.config.crypto.enableEncryption) {
      await this.performHandshake()
    }
  }

  /**
   * 断开连接
   */
  public disconnect(code?: number, reason?: string): void {
    this.stopKeyRotation()
    this.client.disconnect(code, reason)
    this.state.isConnected = false
  }

  /**
   * 重新连接
   */
  public async reconnect(): Promise<void> {
    this.disconnect()
    await this.connect()
  }

  /**
   * 设置当前用户信息
   */
  public setCurrentUser(userId: string, nickname: string): void {
    this.state.currentUserId = userId
    this.state.currentNickname = nickname
    sysLogger.log('Current user set', { userId, nickname })
  }

  /**
   * 发送单播消息
   */
  public sendTo(
    recipientId: string,
    message: string,
    options: SecureMessageOptions = {}
  ): string {
    this.ensureConnected()

    const target: MessageTarget = {
      type: SendMode.UNICAST,
      recipientId
    }

    return this.queueMessage(target, message, options)
  }

  /**
   * 发送组播消息
   */
  public sendToTargets(
    recipientIds: string[],
    message: string,
    options: SecureMessageOptions = {}
  ): string {
    this.ensureConnected()

    const target: MessageTarget = {
      type: SendMode.MULTICAST,
      recipientIds
    }

    return this.queueMessage(target, message, options)
  }

  /**
   * 发送房间消息
   */
  public sendToRoom(
    roomId: string,
    message: string,
    options: SecureMessageOptions = {}
  ): string {
    this.ensureConnected()

    // 检查是否已加入房间
    if (!this.state.joinedRooms.has(roomId)) {
      throw new Error(`Not joined to room: ${roomId}`)
    }

    const target: MessageTarget = {
      type: SendMode.ROOM,
      roomId
    }

    return this.queueMessage(target, message, options)
  }

  /**
   * 发送广播消息
   */
  public broadcast(
    message: string,
    options: SecureMessageOptions & { excludeSelf?: boolean } = {}
  ): string {
    this.ensureConnected()

    const target: MessageTarget = {
      type: SendMode.BROADCAST,
      excludeSelf: options.excludeSelf ?? true
    }

    return this.queueMessage(target, message, options)
  }

  /**
   * 创建房间
   */
  public createRoom(config: {
    roomId: string
    name: string
    description?: string
    requireKey?: boolean
    roomKey?: string
    encrypted?: boolean
    maxMembers?: number
    persistent?: boolean
  }): RoomState {
    if (!this.roomManager) {
      throw new Error('Room management is not enabled')
    }

    this.ensureConnected()
    this.ensureUser()

    const roomConfig = {
      roomId: config.roomId,
      name: config.name,
      description: config.description,
      ownerId: this.state.currentUserId!,
      maxMembers: config.maxMembers,
      requireKey: config.requireKey ?? false,
      roomKey: config.roomKey,
      encrypted: config.encrypted ?? this.state.isEncrypted,
      allowJoin: true,
      persistent: config.persistent ?? false,
      permissions: {
        canSendMessage: true,
        canInvite: true,
        canKick: false,
        canUpdateConfig: true,
        requireKey: config.requireKey ?? false,
        encrypted: config.encrypted ?? this.state.isEncrypted
      }
    }

    const room = this.roomManager.createRoom(roomConfig)

    sysLogger.log('Room created', {
      roomId: config.roomId,
      name: config.name,
      encrypted: room.encrypted,
      requireKey: room.requireKey
    })

    this.emit('roomCreated', config.roomId, room)
    return room
  }

  /**
   * 加入房间
   */
  public joinRoom(roomId: string, roomKey?: string): RoomMember {
    if (!this.roomManager) {
      throw new Error('Room management is not enabled')
    }

    this.ensureConnected()
    this.ensureUser()

    const member = this.roomManager.joinRoom(
      roomId,
      this.state.currentUserId!,
      this.state.currentNickname!,
      {
        role: RoomRole.MEMBER,
        roomKey
      }
    )

    this.state.joinedRooms.add(roomId)

    sysLogger.log('Joined room', { roomId, memberId: member.memberId })

    this.emit('roomJoined', roomId, member)
    return member
  }

  /**
   * 离开房间
   */
  public leaveRoom(roomId: string): void {
    if (!this.roomManager) {
      throw new Error('Room management is not enabled')
    }

    this.ensureConnected()
    this.ensureUser()

    this.roomManager.leaveRoom(roomId, this.state.currentUserId!)
    this.state.joinedRooms.delete(roomId)

    sysLogger.log('Left room', { roomId })

    this.emit('roomLeft', roomId)
  }

  /**
   * 离开所有房间
   */
  public leaveAllRooms(): void {
    this.state.joinedRooms.forEach((roomId) => {
      try {
        this.leaveRoom(roomId)
      } catch (error) {
        sysLogger.error('Failed to leave room', { roomId, error })
      }
    })
  }

  /**
   * 销毁房间 (仅房主)
   */
  public destroyRoom(roomId: string, reason?: string): void {
    if (!this.roomManager) {
      throw new Error('Room management is not enabled')
    }

    this.ensureConnected()
    this.ensureUser()

    const room = this.roomManager.getRoom(roomId)

    if (!room) {
      throw new Error(`Room not found: ${roomId}`)
    }

    if (room.ownerId !== this.state.currentUserId) {
      throw new Error('Only room owner can destroy the room')
    }

    this.roomManager.destroyRoom(roomId, reason)
    this.state.joinedRooms.delete(roomId)

    sysLogger.log('Room destroyed', { roomId, reason })
  }

  /**
   * 踢出房间成员
   */
  public kickMember(roomId: string, targetMemberId: string, reason: string): void {
    if (!this.roomManager) {
      throw new Error('Room management is not enabled')
    }

    this.ensureConnected()
    this.ensureUser()

    this.roomManager.kickMember(roomId, targetMemberId, reason, this.state.currentUserId!)

    sysLogger.log('Member kicked', { roomId, targetMemberId, reason })
  }

  /**
   * 获取房间列表
   */
  public getRoomList(): RoomState[] {
    if (!this.roomManager) {
      return []
    }

    return this.roomManager.getAllRooms()
  }

  /**
   * 搜索房间
   */
  public searchRooms(query: string): RoomState[] {
    if (!this.roomManager) {
      return []
    }

    return this.roomManager.searchRooms(query)
  }

  /**
   * 更新房间密钥
   */
  public updateRoomKey(roomId: string, newKey: string): void {
    if (!this.roomManager) {
      throw new Error('Room management is not enabled')
    }

    this.ensureConnected()
    this.ensureUser()

    this.roomManager.updateRoomKey(roomId, newKey, this.state.currentUserId!)

    sysLogger.log('Room key updated', { roomId })
  }

  /**
   * 生成房间密钥
   */
  public generateRoomKey(roomId?: string): string {
    return this.crypto.generateRoomKey(roomId)
  }

  /**
   * 从密码派生房间密钥
   */
  public deriveRoomKeyFromPassword(password: string, salt?: string): string {
    return this.crypto.deriveKeyFromPassword(password, salt)
  }

  /**
   * 启用加密
   */
  public enableEncryption(): void {
    this.state.isEncrypted = true

    if (!this.keyRotationTimer && this.config.crypto.autoRotateKey) {
      this.startKeyRotation()
    }

    this.emit('encryptionEnabled')
    sysLogger.log('Encryption enabled')
  }

  /**
   * 禁用加密
   */
  public disableEncryption(): void {
    this.state.isEncrypted = false
    this.stopKeyRotation()

    this.emit('encryptionDisabled')
    sysLogger.log('Encryption disabled')
  }

  /**
   * 获取状态
   */
  public getState(): SecureClientState {
    return { ...this.state }
  }

  /**
   * 是否已连接
   */
  public isConnected(): boolean {
    return this.state.isConnected
  }

  /**
   * 是否已加密
   */
  public isEncrypted(): boolean {
    return this.state.isEncrypted
  }

  /**
   * 获取统计信息
   */
  public getStats() {
    return {
      client: this.client.getStatistics(),
      crypto: this.crypto.getStats(),
      rooms: this.roomManager ? this.roomManager.getStats() : null,
      router: this.router.getStats()
    }
  }

  /**
   * 执行握手
   */
  private async performHandshake(): Promise<void> {
    try {
      const handshake = this.crypto.generateHandshake()

      // 发送公钥到服务器
      await this.client.sendRequest(
        PacketType.COMMAND,
        {
          action: 'publicKeyExchange',
          publicKey: handshake.publicKey
        }
      )

      // 等待服务器返回会话密钥
      // 这里简化处理，实际应该从服务器获取加密的会话密钥
      const response = await this.client.sendRequest(
        PacketType.COMMAND,
        {
          action: 'getSessionKey',
          keyId: handshake.sessionKeyId
        },
        5000
      )

      if (response && response.sessionKey) {
        this.crypto.importSessionKey(
          handshake.sessionKeyId,
          response.sessionKey,
          handshake.expiresAt
        )

        this.state.sessionKeyId = handshake.sessionKeyId
        this.state.isEncrypted = true

        this.emit('keyExchangeCompleted', handshake.sessionKeyId)
        sysLogger.log('Handshake completed', { sessionKeyId: handshake.sessionKeyId })
      }
    } catch (error) {
      sysLogger.error('Handshake failed:', error)
      this.emit('securityError', error as Error)
      throw error
    }
  }

  /**
   * 队列消息
   */
  private queueMessage(target: MessageTarget, message: string, options: SecureMessageOptions): string {
    let data = message
    const meta: MessageMeta = {}

    // 加密消息
    if (options.encrypt !== false && this.state.isEncrypted) {
      if (target.roomId) {
        meta.roomId = target.roomId
      }
      if (this.state.sessionKeyId) {
        meta.sessionKeyId = this.state.sessionKeyId
      }

      data = JSON.stringify(this.crypto.encrypt(message, meta))
    } else {
      data = JSON.stringify({ plaintext: message, timestamp: Date.now() })
    }

    return this.router.queueMessage(
      this.state.currentUserId || 'anonymous',
      target,
      data,
      {
        requiresAck: options.deliveryConfirmation ?? false,
        ttl: options.ttl ?? 60000,
        priority: options.priority ?? 5,
        encrypted: this.state.isEncrypted,
        roomKey: options.roomKey,
        sessionKeyId: this.state.sessionKeyId,
        metadata: options.metadata
      }
    )
  }

  /**
   * 启动密钥轮换
   */
  private startKeyRotation(): void {
    if (!this.config.crypto.autoRotateKey) {
      return
    }

    this.keyRotationTimer = setInterval(() => {
      if (this.state.sessionKeyId) {
        this.crypto.rotateSessionKey(this.state.sessionKeyId)
        sysLogger.log('Session key rotated')
      }
    }, this.config.crypto.rotateInterval)
  }

  /**
   * 停止密钥轮换
   */
  private stopKeyRotation(): void {
    if (this.keyRotationTimer) {
      clearInterval(this.keyRotationTimer)
      this.keyRotationTimer = null
    }
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 连接事件
    this.client.on('connected', () => {
      this.state.isConnected = true
      this.emit('connected')
    })

    this.client.on('disconnected', () => {
      this.state.isConnected = false
      this.leaveAllRooms()
      this.emit('disconnected')
    })

    this.client.on('error', (error) => {
      this.emit('error', error)
    })

    // 房间事件
    if (this.roomManager) {
      this.roomManager.on('roomCreated', (roomId, config) => {
        this.emit('roomCreated', roomId, config)
      })

      this.roomManager.on('memberJoined', (roomId, member) => {
        this.emit('memberJoinedRoom', roomId, member)
      })

      this.roomManager.on('memberLeft', (roomId, memberId) => {
        this.emit('memberLeftRoom', roomId, memberId)
      })

      this.roomManager.on('memberKicked', (roomId, memberId, reason) => {
        this.emit('memberKicked', roomId, memberId, reason)
      })

      this.roomManager.on('roomDestroyed', (roomId, reason) => {
        this.state.joinedRooms.delete(roomId)
        this.emit('roomDestroyed', roomId, reason)
      })
    }
  }

  /**
   * 确保已连接
   */
  private ensureConnected(): void {
    if (!this.state.isConnected) {
      throw new Error('Not connected to server')
    }
  }

  /**
   * 确保已设置用户信息
   */
  private ensureUser(): void {
    if (!this.state.currentUserId || !this.state.currentNickname) {
      throw new Error('User information not set. Call setCurrentUser() first')
    }
  }

  /**
   * 销毁客户端
   */
  public destroy(): void {
    this.stopKeyRotation()
    this.disconnect()

    if (this.roomManager) {
      this.roomManager.destroy()
    }

    this.crypto.destroy()
    this.router.destroy()
    this.client.destroy()

    this.state.joinedRooms.clear()
    this.removeAllListeners()

    sysLogger.log('SecureWebSocketClient destroyed')
  }
}
