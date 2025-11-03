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

// ====================
// 导出工具函数
// ====================

/**
 * 创建 WebSocket 客户端实例的便捷函数
 */
import { WebSocketClient } from './WebSocketClient'
import type { WebSocketClientConfig } from './WebSocketClient'

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

// ====================
// 导出示例代码
// ====================

export * from './examples'

// ====================
// 库信息
// ====================

export const WSCORE_VERSION = '1.0.0'
export const WSCORE_NAME = 'wsCore - WebSocket Core Library'

/**
 * 库信息
 */
export const libraryInfo = {
  name: WSCORE_NAME,
  version: WSCORE_VERSION,
  description: 'A powerful WebSocket client library with connection management, message handling, and more',
  features: [
    'Connection Management',
    'Automatic Reconnection',
    'Message Encoding/Decoding',
    'Heartbeat Detection',
    'Request-Response Pattern',
    'Statistics & Monitoring',
    'Room-based Chat Support',
    'TypeScript Support'
  ]
}
