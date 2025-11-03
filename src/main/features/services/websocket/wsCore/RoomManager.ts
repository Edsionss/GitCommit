import { EventEmitter } from 'events'
import { sysLogger } from '@nodeUtils/sysLogger'

/**
 * 房间成员信息
 */
export interface RoomMember {
  memberId: string
  nickname: string
  joinedAt: number
  lastActivity: number
  role: RoomRole
  socketId?: string // WebSocket 连接 ID (可选)
}

/**
 * 房间角色
 */
export enum RoomRole {
  OWNER = 'owner',    // 房主
  ADMIN = 'admin',    // 管理员
  MEMBER = 'member',  // 成员
  GUEST = 'guest'     // 访客
}

/**
 * 房间权限
 */
export interface RoomPermissions {
  canSendMessage: boolean      // 可以发送消息
  canInvite: boolean           // 可以邀请成员
  canKick: boolean             // 可以踢人
  canUpdateConfig: boolean     // 可以修改房间配置
  requireKey: boolean          // 加入时需要密钥
  encrypted: boolean           // 房间加密
}

/**
 * 房间配置
 */
export interface RoomConfig {
  roomId: string
  name: string
  description?: string
  ownerId: string
  maxMembers?: number         // 最大成员数 (默认 100)
  requireKey: boolean         // 是否需要密钥才能加入
  roomKey?: string           // 房间密钥 (可选)
  encrypted: boolean         // 是否启用加密
  allowJoin: boolean        // 是否允许加入
  persistent: boolean       // 是否持久化 (房主离开后房间是否保留)
  permissions: RoomPermissions
}

/**
 * 房间状态
 */
export interface RoomState extends RoomConfig {
  members: Map<string, RoomMember>
  createdAt: number
  lastActivity: number
  messageCount: number
}

/**
 * 房间事件
 */
export interface RoomEvents {
  memberJoined: (roomId: string, member: RoomMember) => void
  memberLeft: (roomId: string, memberId: string) => void
  memberKicked: (roomId: string, memberId: string, reason: string) => void
  roomCreated: (roomId: string, config: RoomConfig) => void
  roomDestroyed: (roomId: string, reason: string) => void
  roomUpdated: (roomId: string, oldConfig: RoomConfig, newConfig: RoomConfig) => void
  keyChanged: (roomId: string, changedBy: string) => void
  permissionDenied: (roomId: string, memberId: string, action: string) => void
}

/**
 * 房间管理选项
 */
export interface RoomManagerOptions {
  maxRooms?: number        // 最大房间数 (默认 1000)
  maxMembers?: number      // 每个房间最大成员数 (默认 100)
  roomCleanupInterval?: number // 房间清理间隔 (默认 1小时)
  inactivityTimeout?: number   // 房间不活跃超时 (默认 24小时)
}

/**
 * 房间管理器
 * 负责房间的创建、成员管理、权限控制等
 */
export class RoomManager extends EventEmitter {
  private rooms: Map<string, RoomState> = new Map()
  private memberRooms: Map<string, Set<string>> = new Map() // memberId -> Set of roomIds
  private options: Required<RoomManagerOptions>
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(options: RoomManagerOptions = {}) {
    super()

    this.options = {
      maxRooms: options.maxRooms ?? 1000,
      maxMembers: options.maxMembers ?? 100,
      roomCleanupInterval: options.roomCleanupInterval ?? 3600000,
      inactivityTimeout: options.inactivityTimeout ?? 86400000,
      ...options
    }

    // 启动定期清理
    this.startCleanupTimer()

    this.setMaxListeners(100)
    sysLogger.log('RoomManager initialized', this.options)
  }

  /**
   * 创建房间
   */
  public createRoom(config: Omit<RoomConfig, 'createdAt' | 'lastActivity' | 'messageCount'> & { members?: Map<string, RoomMember> }): RoomState {
    // 验证房间数限制
    if (this.rooms.size >= this.options.maxRooms) {
      throw new Error(`Maximum number of rooms reached: ${this.options.maxRooms}`)
    }

    // 验证房间ID是否已存在
    if (this.rooms.has(config.roomId)) {
      throw new Error(`Room already exists: ${config.roomId}`)
    }

    // 验证密钥
    if (config.requireKey && !config.roomKey) {
      throw new Error('Room requires a key but none provided')
    }

    // 默认权限
    const defaultPermissions: RoomPermissions = {
      canSendMessage: true,
      canInvite: config.role === RoomRole.OWNER || config.role === RoomRole.ADMIN,
      canKick: config.role === RoomRole.OWNER || config.role === RoomRole.ADMIN,
      canUpdateConfig: config.role === RoomRole.OWNER,
      requireKey: config.requireKey,
      encrypted: config.encrypted
    }

    const roomState: RoomState = {
      ...config,
      permissions: { ...defaultPermissions, ...config.permissions },
      members: config.members || new Map(),
      createdAt: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0
    }

    this.rooms.set(config.roomId, roomState)

    // 如果创建时就有成员，建立映射
    roomState.members.forEach((member) => {
      this.addMemberToMapping(member.memberId, config.roomId)
    })

    sysLogger.log('Room created', {
      roomId: config.roomId,
      name: config.name,
      ownerId: config.ownerId,
      memberCount: roomState.members.size,
      encrypted: config.encrypted,
      requireKey: config.requireKey
    })

    this.emit('roomCreated', config.roomId, roomState)
    return roomState
  }

  /**
   * 加入房间
   */
  public joinRoom(
    roomId: string,
    memberId: string,
    nickname: string,
    options: {
      role?: RoomRole
      roomKey?: string
      socketId?: string
    } = {}
  ): RoomMember {
    const room = this.rooms.get(roomId)

    if (!room) {
      throw new Error(`Room not found: ${roomId}`)
    }

    // 检查房间是否允许加入
    if (!room.allowJoin) {
      this.emit('permissionDenied', roomId, memberId, 'join')
      throw new Error('Room does not allow joining')
    }

    // 检查成员数限制
    if (room.members.size >= (room.maxMembers || this.options.maxMembers)) {
      throw new Error('Room is full')
    }

    // 检查成员是否已存在
    if (room.members.has(memberId)) {
      // 更新成员信息
      const existingMember = room.members.get(memberId)!
      existingMember.nickname = nickname
      existingMember.lastActivity = Date.now()
      existingMember.socketId = options.socketId || existingMember.socketId

      sysLogger.log('Member re-joined', { roomId, memberId, nickname })
      return existingMember
    }

    // 验证房间密钥
    if (room.requireKey) {
      if (!options.roomKey || options.roomKey !== room.roomKey) {
        this.emit('permissionDenied', roomId, memberId, 'join-with-key')
        throw new Error('Invalid room key')
      }
    }

    // 创建成员
    const member: RoomMember = {
      memberId,
      nickname,
      role: options.role || RoomRole.MEMBER,
      joinedAt: Date.now(),
      lastActivity: Date.now(),
      socketId: options.socketId
    }

    // 房主权限
    if (memberId === room.ownerId) {
      member.role = RoomRole.OWNER
      room.permissions.canUpdateConfig = true
    }

    room.members.set(memberId, member)
    room.lastActivity = Date.now()

    // 建立成员-房间映射
    this.addMemberToMapping(memberId, roomId)

    sysLogger.log('Member joined', {
      roomId,
      memberId,
      nickname,
      role: member.role,
      totalMembers: room.members.size
    })

    this.emit('memberJoined', roomId, member)
    return member
  }

  /**
   * 离开房间
   */
  public leaveRoom(roomId: string, memberId: string): boolean {
    const room = this.rooms.get(roomId)

    if (!room) {
      return false
    }

    const member = room.members.get(memberId)

    if (!member) {
      return false
    }

    room.members.delete(memberId)
    room.lastActivity = Date.now()

    // 移除成员-房间映射
    this.removeMemberFromMapping(memberId, roomId)

    // 如果是房主离开且房间不持久化，则销毁房间
    if (memberId === room.ownerId && !room.persistent) {
      this.destroyRoom(roomId, 'Owner left and room is not persistent')
      return true
    }

    sysLogger.log('Member left', {
      roomId,
      memberId,
      memberCount: room.members.size
    })

    this.emit('memberLeft', roomId, memberId)
    return true
  }

  /**
   * 踢出成员
   */
  public kickMember(roomId: string, targetMemberId: string, reason: string, byMemberId: string): void {
    const room = this.rooms.get(roomId)

    if (!room) {
      throw new Error(`Room not found: ${roomId}`)
    }

    const byMember = room.members.get(byMemberId)
    const targetMember = room.members.get(targetMemberId)

    if (!byMember) {
      throw new Error(`Member not found: ${byMemberId}`)
    }

    if (!targetMember) {
      throw new Error(`Member not found: ${targetMemberId}`)
    }

    // 检查权限
    if (!this.hasPermission(byMember, room, 'canKick')) {
      this.emit('permissionDenied', roomId, byMemberId, 'kick')
      throw new Error('You do not have permission to kick members')
    }

    room.members.delete(targetMemberId)
    this.removeMemberFromMapping(targetMemberId, roomId)
    room.lastActivity = Date.now()

    sysLogger.log('Member kicked', {
      roomId,
      targetMemberId,
      byMemberId,
      reason,
      memberCount: room.members.size
    })

    this.emit('memberKicked', roomId, targetMemberId, reason)
  }

  /**
   * 销毁房间
   */
  public destroyRoom(roomId: string, reason: string = 'Manual destruction'): void {
    const room = this.rooms.get(roomId)

    if (!room) {
      throw new Error(`Room not found: ${roomId}`)
    }

    // 通知所有成员
    room.members.forEach((member) => {
      this.emit('memberLeft', roomId, member.memberId)
    })

    this.rooms.delete(roomId)

    // 清理成员-房间映射
    room.members.forEach((member) => {
      this.removeMemberFromMapping(member.memberId, roomId)
    })

    sysLogger.log('Room destroyed', {
      roomId,
      reason,
      formerMemberCount: room.members.size
    })

    this.emit('roomDestroyed', roomId, reason)
  }

  /**
   * 更新房间配置
   */
  public updateRoomConfig(roomId: string, updaterId: string, updates: Partial<RoomConfig>): RoomConfig {
    const room = this.rooms.get(roomId)

    if (!room) {
      throw new Error(`Room not found: ${roomId}`)
    }

    const updater = room.members.get(updaterId)

    if (!updater) {
      throw new Error(`Member not found: ${updaterId}`)
    }

    // 检查权限
    if (!this.hasPermission(updater, room, 'canUpdateConfig')) {
      this.emit('permissionDenied', roomId, updaterId, 'update-config')
      throw new Error('You do not have permission to update room config')
    }

    const oldConfig = { ...room }

    // 应用更新
    const allowedFields: (keyof RoomConfig)[] = [
      'name',
      'description',
      'maxMembers',
      'allowJoin',
      'persistent',
      'roomKey'
    ]

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        (room as any)[field] = updates[field]
      }
    })

    // 更新权限
    if (updates.permissions) {
      room.permissions = { ...room.permissions, ...updates.permissions }
    }

    room.lastActivity = Date.now()

    sysLogger.log('Room config updated', {
      roomId,
      updaterId,
      changes: Object.keys(updates)
    })

    this.emit('roomUpdated', roomId, oldConfig, room)
    return room
  }

  /**
   * 更新房间密钥
   */
  public updateRoomKey(roomId: string, newKey: string, byMemberId: string): void {
    const room = this.rooms.get(roomId)

    if (!room) {
      throw new Error(`Room not found: ${roomId}`)
    }

    const byMember = room.members.get(byMemberId)

    if (!byMember) {
      throw new Error(`Member not found: ${byMemberId}`)
    }

    if (!this.hasPermission(byMember, room, 'canUpdateConfig')) {
      throw new Error('You do not have permission to update room key')
    }

    room.roomKey = newKey
    room.lastActivity = Date.now()

    sysLogger.log('Room key updated', { roomId, byMemberId })

    this.emit('keyChanged', roomId, byMemberId)
  }

  /**
   * 获取房间
   */
  public getRoom(roomId: string): RoomState | null {
    return this.rooms.get(roomId) || null
  }

  /**
   * 获取所有房间
   */
  public getAllRooms(): RoomState[] {
    return Array.from(this.rooms.values())
  }

  /**
   * 获取成员所在的房间
   */
  public getMemberRooms(memberId: string): RoomState[] {
    const roomIds = this.memberRooms.get(memberId)
    if (!roomIds) {
      return []
    }

    return Array.from(roomIds)
      .map((roomId) => this.rooms.get(roomId))
      .filter((room): room is RoomState => room !== undefined)
  }

  /**
   * 获取房间成员列表
   */
  public getRoomMembers(roomId: string): RoomMember[] {
    const room = this.rooms.get(roomId)
    return room ? Array.from(room.members.values()) : []
  }

  /**
   * 检查成员是否有权限
   */
  public hasPermission(member: RoomMember, room: RoomState, permission: keyof RoomPermissions): boolean {
    // 房主拥有所有权限
    if (member.role === RoomRole.OWNER) {
      return true
    }

    return room.permissions[permission] || false
  }

  /**
   * 搜索房间
   */
  public searchRooms(query: string): RoomState[] {
    const searchTerm = query.toLowerCase()
    return this.getAllRooms().filter(
      (room) =>
        room.name.toLowerCase().includes(searchTerm) ||
        room.roomId.toLowerCase().includes(searchTerm) ||
        (room.description && room.description.toLowerCase().includes(searchTerm))
    )
  }

  /**
   * 添加成员到映射
   */
  private addMemberToMapping(memberId: string, roomId: string): void {
    if (!this.memberRooms.has(memberId)) {
      this.memberRooms.set(memberId, new Set())
    }
    this.memberRooms.get(memberId)!.add(roomId)
  }

  /**
   * 从映射中移除成员
   */
  private removeMemberFromMapping(memberId: string, roomId: string): void {
    const rooms = this.memberRooms.get(memberId)
    if (rooms) {
      rooms.delete(roomId)
      if (rooms.size === 0) {
        this.memberRooms.delete(memberId)
      }
    }
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupInactiveRooms()
    }, this.options.roomCleanupInterval)

    sysLogger.log('Room cleanup timer started', {
      interval: this.options.roomCleanupInterval
    })
  }

  /**
   * 清理不活跃房间
   */
  private cleanupInactiveRooms(): void {
    const now = Date.now()
    const inactiveRooms: string[] = []

    this.rooms.forEach((room, roomId) => {
      // 检查不活跃超时
      if (now - room.lastActivity > this.options.inactivityTimeout) {
        inactiveRooms.push(roomId)
      }
      // 检查成员空房间 (除非是持久化的)
      else if (room.members.size === 0 && !room.persistent) {
        inactiveRooms.push(roomId)
      }
    })

    inactiveRooms.forEach((roomId) => {
      this.destroyRoom(roomId, 'Inactive room cleanup')
    })

    if (inactiveRooms.length > 0) {
      sysLogger.log('Cleaned up inactive rooms', { count: inactiveRooms.length })
    }
  }

  /**
   * 获取统计信息
   */
  public getStats() {
    return {
      totalRooms: this.rooms.size,
      totalMembers: this.memberRooms.size,
      activeRooms: Array.from(this.rooms.values()).filter(
        (room) => room.members.size > 0
      ).length,
      totalRoomMembers: Array.from(this.rooms.values()).reduce(
        (sum, room) => sum + room.members.size,
        0
      ),
      options: this.options
    }
  }

  /**
   * 销毁房间管理器
   */
  public destroy(): void {
    // 清理定时器
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    // 销毁所有房间
    this.rooms.forEach((room, roomId) => {
      this.destroyRoom(roomId, 'Manager destroyed')
    })

    this.rooms.clear()
    this.memberRooms.clear()
    this.removeAllListeners()

    sysLogger.log('RoomManager destroyed')
  }
}
