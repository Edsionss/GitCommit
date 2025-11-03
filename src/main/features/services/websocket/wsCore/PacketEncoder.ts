import { sysLogger } from '@nodeUtils/sysLogger'

/**
 * 数据包类型枚举
 */
export enum PacketType {
  HEARTBEAT = 'heartbeat',
  HEARTBEAT_RESPONSE = 'heartbeat-response',
  CHAT_MESSAGE = 'chat_message',
  BROADCAST = 'broadcast',
  DIRECT_MESSAGE = 'direct_message',
  SYSTEM_MESSAGE = 'system_message',
  COMMAND = 'command',
  RESPONSE = 'response',
  ERROR = 'error',
  DATA = 'data'
}

/**
 * 数据包头部信息
 */
export interface PacketHeader {
  id: string // 数据包唯一ID
  type: PacketType // 数据包类型
  timestamp: number // 时间戳
  version: string // 协议版本
  compress?: boolean // 是否压缩
  encrypt?: boolean // 是否加密
}

/**
 * 基础数据包接口
 */
export interface BasePacket {
  header: PacketHeader
  payload: any
}

/**
 * 聊天消息数据包
 */
export interface ChatMessagePacket extends BasePacket {
  header: PacketHeader & { type: PacketType.CHAT_MESSAGE }
  payload: {
    text: string
    nickname: string
    roomId?: string
    senderId?: string
  }
}

/**
 * 广播数据包
 */
export interface BroadcastPacket extends BasePacket {
  header: PacketHeader & { type: PacketType.BROADCAST }
  payload: {
    text: string
    nickname: string
    broadcastType: 'global' | 'local' | 'room'
    originIp?: string
    roomId?: string
  }
}

/**
 * 心跳数据包
 */
export interface HeartbeatPacket extends BasePacket {
  header: PacketHeader & { type: PacketType.HEARTBEAT }
  payload: {
    serverTime: number
  }
}

/**
 * 响应数据包
 */
export interface ResponsePacket extends BasePacket {
  header: PacketHeader & { type: PacketType.RESPONSE }
  payload: {
    requestId: string
    success: boolean
    data?: any
    error?: string
  }
}

/**
 * 错误数据包
 */
export interface ErrorPacket extends BasePacket {
  header: PacketHeader & { type: PacketType.ERROR }
  payload: {
    code: string | number
    message: string
    details?: any
  }
}

/**
 * 数据包编码器/解码器
 * 提供数据包的序列化、反序列化、压缩、加密等功能
 */
export class PacketEncoder {
  private static readonly VERSION = '1.0.0'
  private static readonly COMPRESSION_THRESHOLD = 1024 // 1KB 以上启用压缩

  /**
   * 编码数据包为 JSON 字符串
   */
  public static encode(packet: BasePacket): string {
    try {
      // 添加版本信息
      packet.header.version = this.VERSION

      // 序列化为 JSON
      const json = JSON.stringify(packet)

      // 检查是否需要压缩（当前版本未实现压缩，为扩展预留）
      // const compressed = this.compress(json)

      return json
    } catch (error) {
      sysLogger.error('Failed to encode packet:', error)
      throw new Error('Packet encoding failed')
    }
  }

  /**
   * 解码 JSON 字符串为数据包对象
   */
  public static decode(data: string): BasePacket | null {
    try {
      const packet = JSON.parse(data) as BasePacket

      // 验证必要字段
      if (!packet.header || !packet.header.id || !packet.header.type) {
        sysLogger.error('Invalid packet structure: missing header fields')
        return null
      }

      // 验证版本兼容性
      if (packet.header.version && packet.header.version !== this.VERSION) {
        sysLogger.warn(`Packet version mismatch: expected ${this.VERSION}, got ${packet.header.version}`)
      }

      return packet
    } catch (error) {
      sysLogger.error('Failed to decode packet:', error)
      return null
    }
  }

  /**
   * 创建聊天消息数据包
   */
  public static createChatMessage(
    text: string,
    nickname: string,
    options: {
      roomId?: string
      senderId?: string
      compress?: boolean
    } = {}
  ): ChatMessagePacket {
    return {
      header: {
        id: this.generateId(),
        type: PacketType.CHAT_MESSAGE,
        timestamp: Date.now(),
        version: this.VERSION,
        compress: options.compress
      },
      payload: {
        text,
        nickname,
        roomId: options.roomId,
        senderId: options.senderId
      }
    }
  }

  /**
   * 创建广播数据包
   */
  public static createBroadcast(
    text: string,
    nickname: string,
    broadcastType: 'global' | 'local' | 'room',
    options: {
      originIp?: string
      roomId?: string
      compress?: boolean
    } = {}
  ): BroadcastPacket {
    return {
      header: {
        id: this.generateId(),
        type: PacketType.BROADCAST,
        timestamp: Date.now(),
        version: this.VERSION,
        compress: options.compress
      },
      payload: {
        text,
        nickname,
        broadcastType,
        originIp: options.originIp,
        roomId: options.roomId
      }
    }
  }

  /**
   * 创建心跳数据包
   */
  public static createHeartbeat(serverTime?: number): HeartbeatPacket {
    return {
      header: {
        id: this.generateId(),
        type: PacketType.HEARTBEAT,
        timestamp: Date.now(),
        version: this.VERSION
      },
      payload: {
        serverTime: serverTime || Date.now()
      }
    }
  }

  /**
   * 创建心跳响应数据包
   */
  public static createHeartbeatResponse(requestId: string): BasePacket {
    return {
      header: {
        id: this.generateId(),
        type: PacketType.HEARTBEAT_RESPONSE,
        timestamp: Date.now(),
        version: this.VERSION
      },
      payload: {
        requestId
      }
    }
  }

  /**
   * 创建响应数据包
   */
  public static createResponse(
    requestId: string,
    success: boolean,
    data?: any,
    error?: string
  ): ResponsePacket {
    return {
      header: {
        id: this.generateId(),
        type: PacketType.RESPONSE,
        timestamp: Date.now(),
        version: this.VERSION
      },
      payload: {
        requestId,
        success,
        data,
        error
      }
    }
  }

  /**
   * 创建错误数据包
   */
  public static createError(
    code: string | number,
    message: string,
    details?: any
  ): ErrorPacket {
    return {
      header: {
        id: this.generateId(),
        type: PacketType.ERROR,
        timestamp: Date.now(),
        version: this.VERSION
      },
      payload: {
        code,
        message,
        details
      }
    }
  }

  /**
   * 创建系统消息数据包
   */
  public static createSystemMessage(message: string): BasePacket {
    return {
      header: {
        id: this.generateId(),
        type: PacketType.SYSTEM_MESSAGE,
        timestamp: Date.now(),
        version: this.VERSION
      },
      payload: {
        message
      }
    }
  }

  /**
   * 验证数据包格式
   */
  public static validatePacket(packet: any): boolean {
    if (!packet || typeof packet !== 'object') {
      return false
    }

    const header = packet.header
    if (!header || typeof header !== 'object') {
      return false
    }

    // 检查必要字段
    const requiredFields = ['id', 'type', 'timestamp']
    for (const field of requiredFields) {
      if (!(field in header)) {
        sysLogger.error(`Missing required field in packet header: ${field}`)
        return false
      }
    }

    // 验证类型
    if (typeof header.id !== 'string' || header.id.length === 0) {
      return false
    }

    if (typeof header.timestamp !== 'number') {
      return false
    }

    if (!Object.values(PacketType).includes(header.type)) {
      sysLogger.error(`Invalid packet type: ${header.type}`)
      return false
    }

    return true
  }

  /**
   * 获取数据包大小（字节）
   */
  public static getPacketSize(packet: BasePacket): number {
    try {
      const encoded = this.encode(packet)
      return Buffer.byteLength(encoded, 'utf8')
    } catch {
      return 0
    }
  }

  /**
   * 压缩数据（预留方法）
   */
  private static compress(data: string): string {
    // TODO: 实现 gzip 或其他压缩算法
    // 当前版本直接返回原数据
    return data
  }

  /**
   * 解压缩数据（预留方法）
   */
  private static decompress(data: string): string {
    // TODO: 实现对应的解压缩算法
    // 当前版本直接返回原数据
    return data
  }

  /**
   * 生成唯一 ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
