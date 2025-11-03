/**
 * WebSocket 核心工具库 (wsCore)
 * 提供 WebSocket 连接的底层封装和管理功能
 *
 * @author CognitoOcean Team
 * @version 1.0.0
 */

// ====================
// 导出核心类
// ====================

export { ConnectionManager } from './ConnectionManager'
export { MessageHandler } from './MessageHandler'
export { PacketEncoder } from './PacketEncoder'
export { WebSocketClient } from './WebSocketClient'

// 安全增强组件
export { CryptoManager } from './CryptoManager'
export { RoomManager } from './RoomManager'
export { MessageRouter } from './MessageRouter'
export { SecureWebSocketClient } from './SecureWebSocketClient'

// ====================
// 导出类型定义
// ====================

// ConnectionManager 相关类型
export {
  ConnectionState,
  ConnectionManagerOptions,
  ConnectionManagerEvents
} from './ConnectionManager'

// MessageHandler 相关类型
export {
  MessageHandlerEvents,
  MessageHandlerOptions,
  MessageStats
} from './MessageHandler'

// PacketEncoder 相关类型
export {
  PacketType,
  PacketHeader,
  BasePacket,
  ChatMessagePacket,
  BroadcastPacket,
  HeartbeatPacket,
  ResponsePacket,
  ErrorPacket
} from './PacketEncoder'

// WebSocketClient 相关类型
export {
  WebSocketClientEvents,
  WebSocketClientConfig,
  ClientState,
  ClientStatistics
} from './WebSocketClient'

// CryptoManager 相关类型
export {
  EncryptedData,
  DecryptedMessage,
  MessageMeta,
  HandshakeResult,
  KeyConfig,
  CRYPTO_ALGORITHMS
} from './CryptoManager'

// RoomManager 相关类型
export {
  RoomMember,
  RoomRole,
  RoomPermissions,
  RoomConfig,
  RoomState,
  RoomEvents,
  RoomManagerOptions
} from './RoomManager'

// MessageRouter 相关类型
export {
  SendMode,
  MessageTarget,
  MessageOptions,
  MessageQueueItem,
  MessageRouterEvents,
  MessageStats
} from './MessageRouter'

// SecureWebSocketClient 相关类型
export {
  SecureClientEvents,
  SecureClientConfig,
  SecureClientState,
  SecureMessageOptions
} from './SecureWebSocketClient'

// ====================
// 导出工具函数
// ====================

import { WebSocketClient, WebSocketClientConfig } from './WebSocketClient'
import { SecureWebSocketClient, SecureClientConfig } from './SecureWebSocketClient'
import { CryptoManager } from './CryptoManager'
import { RoomManager } from './RoomManager'
import { MessageRouter } from './MessageRouter'

/**
 * 创建 WebSocket 客户端实例的便捷函数
 */
export function createClient(config: WebSocketClientConfig): WebSocketClient {
  return new WebSocketClient(config)
}

/**
 * 创建快速客户端（使用默认配置）
 */
export function createQuickClient(url: string): WebSocketClient {
  return new WebSocketClient({
    url,
    autoConnect: true,
    connection: {
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      heartbeatInterval: 30000,
      heartbeatTimeout: 10000,
      connectTimeout: 5000
    },
    messageHandler: {
      enableLogging: true,
      enableValidation: true
    },
    enableStatistics: true
  })
}

/**
 * 创建本地客户端（连接到 localhost）
 */
export function createLocalClient(port: number = 8888): WebSocketClient {
  return new WebSocketClient({
    url: `ws://localhost:${port}`,
    autoConnect: true
  })
}

/**
 * 创建安全 WebSocket 客户端
 */
export function createSecureClient(config: SecureClientConfig): SecureWebSocketClient {
  return new SecureWebSocketClient(config)
}

/**
 * 创建快速安全客户端（使用默认配置）
 */
export function createSecureQuickClient(url: string): SecureWebSocketClient {
  return new SecureWebSocketClient({
    url,
    autoConnect: true,
    connection: {
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      heartbeatInterval: 30000,
      heartbeatTimeout: 10000,
      connectTimeout: 5000
    },
    crypto: {
      enableEncryption: true,
      autoRotateKey: false
    },
    room: {
      enableRoom: true
    }
  })
}

/**
 * 创建加密管理器
 */
export function createCryptoManager(config?: any): CryptoManager {
  return new CryptoManager(config)
}

/**
 * 创建房间管理器
 */
export function createRoomManager(config?: any): RoomManager {
  return new RoomManager(config)
}

/**
 * 创建消息路由器
 */
export function createMessageRouter(): MessageRouter {
  return new MessageRouter()
}

// ====================
// 导出示例代码
// ====================

export * from './examples'

// ====================
// 库信息
// ====================

export const WSCORE_VERSION = '2.0.0'
export const WSCORE_NAME = 'wsCore - WebSocket Core Library'

/**
 * 库信息
 */
export const libraryInfo = {
  name: WSCORE_NAME,
  version: WSCORE_VERSION,
  description: 'A powerful WebSocket client library with security, room management, encryption, and more',
  features: [
    'Connection Management',
    'Automatic Reconnection',
    'Message Encoding/Decoding',
    'Heartbeat Detection',
    'Request-Response Pattern',
    'Statistics & Monitoring',
    'Room-based Chat Support',
    'End-to-End Encryption (AES-256-GCM)',
    'HMAC Signature Verification',
    'RSA Key Exchange',
    'Message Routing (Unicast/Multicast/Broadcast/Room)',
    'Room Management (Create/Join/Leave/Destroy)',
    'Message Queue & Delivery Confirmation',
    'TypeScript Support'
  ]
}
