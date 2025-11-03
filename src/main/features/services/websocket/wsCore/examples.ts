import { WebSocketClient } from './WebSocketClient'
import { PacketType } from './PacketEncoder'
import { ConnectionState } from './ConnectionManager'
import { sysLogger } from '@nodeUtils/sysLogger'

/**
 * 基本使用示例
 */
export async function basicUsageExample() {
  const client = new WebSocketClient({
    url: 'ws://localhost:8888',
    autoConnect: true
  })

  // 监听连接事件
  client.on('connected', () => {
    sysLogger.log('客户端已连接')
  })

  client.on('disconnected', () => {
    sysLogger.log('客户端已断开')
  })

  client.on('error', (error) => {
    sysLogger.error('连接错误:', error.message)
  })

  // 监听消息事件
  client.on('chatMessage', (packet) => {
    sysLogger.log(`收到聊天消息: ${packet.payload.nickname}: ${packet.payload.text}`)
  })

  client.on('broadcast', (packet) => {
    sysLogger.log(`收到广播消息: ${packet.payload.text}`)
  })

  // 等待连接
  await client.connect()

  // 发送聊天消息
  client.sendChatMessage('Hello World', 'User1')

  // 发送广播消息
  client.sendBroadcast('这是一条全局广播', 'User1', 'global')

  // 清理资源
  client.destroy()
}

/**
 * 带重连功能的示例
 */
export async function reconnectExample() {
  const client = new WebSocketClient({
    url: 'ws://localhost:8888',
    connection: {
      reconnectAttempts: 10, // 最多重连 10 次
      reconnectInterval: 5000 // 每 5 秒重连一次
    },
    autoConnect: true
  })

  // 监听重连事件
  client.on('reconnectionAttempt', (attempt) => {
    sysLogger.log(`重连尝试 ${attempt}`)
  })

  client.on('maxReconnectAttemptsReached', () => {
    sysLogger.error('达到最大重连次数，停止重连')
  })

  await client.connect()

  // 获取连接状态
  const state = client.getState()
  sysLogger.log('当前状态:', state)

  // 等待连接稳定
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // 发送消息
  client.sendChatMessage('测试消息', 'TestUser')

  client.destroy()
}

/**
 * 请求-响应模式示例
 */
export async function requestResponseExample() {
  const client = new WebSocketClient({
    url: 'ws://localhost:8888',
    autoConnect: true
  })

  await client.connect()

  try {
    // 发送请求并等待响应
    const response = await client.sendRequest(
      PacketType.COMMAND,
      {
        action: 'getServerInfo'
      },
      5000
    )

    sysLogger.log('收到响应:', response)
  } catch (error) {
    sysLogger.error('请求失败:', error)
  }

  client.destroy()
}

/**
 * 统计信息监控示例
 */
export async function statisticsMonitoringExample() {
  const client = new WebSocketClient({
    url: 'ws://localhost:8888',
    enableStatistics: true,
    autoConnect: true
  })

  await client.connect()

  // 定期输出统计信息
  const interval = setInterval(() => {
    const stats = client.getStatistics()
    const messageStats = client.getMessageStats()

    sysLogger.log('=== 客户端统计信息 ===')
    sysLogger.log(`运行时间: ${stats.uptime}ms`)
    sysLogger.log(`总连接次数: ${stats.totalConnections}`)
    sysLogger.log(`总重连次数: ${stats.totalReconnections}`)
    sysLogger.log(`总接收消息: ${stats.totalMessagesReceived}`)
    sysLogger.log(`总发送消息: ${stats.totalMessagesSent}`)
    sysLogger.log(`平均延迟: ${stats.averageLatency?.toFixed(2)}ms`)
    sysLogger.log('=== 消息统计 ===')
    sysLogger.log('按类型统计:', messageStats.byType)
  }, 10000)

  // 发送一些测试消息
  setInterval(() => {
    client.sendChatMessage(`测试消息 ${Date.now()}`, 'Bot')
  }, 5000)

  // 30 秒后清理
  setTimeout(() => {
    clearInterval(interval)
    client.destroy()
  }, 30000)
}

/**
 * 房间聊天示例
 */
export async function roomChatExample() {
  const client = new WebSocketClient({
    url: 'ws://localhost:8888',
    autoConnect: true
  })

  await client.connect()

  // 加入房间
  client.sendChatMessage('', 'User1', { roomId: 'room-001' })

  // 监听房间消息
  client.on('chatMessage', (packet) => {
    if (packet.payload.roomId) {
      sysLogger.log(`[房间 ${packet.payload.roomId}] ${packet.payload.nickname}: ${packet.payload.text}`)
    }
  })

  // 在房间内聊天
  client.sendChatMessage('大家好！', 'User1', { roomId: 'room-001' })

  await new Promise((resolve) => setTimeout(resolve, 1000))
  client.sendChatMessage('你好！', 'User2', { roomId: 'room-001' })

  client.destroy()
}

/**
 * 心跳检测示例
 */
export async function heartbeatExample() {
  const client = new WebSocketClient({
    url: 'ws://localhost:8888',
    connection: {
      heartbeatInterval: 10000, // 每 10 秒发送一次心跳
      heartbeatTimeout: 5000 // 5 秒无响应则视为超时
    },
    autoConnect: true
  })

  await client.connect()

  // 监听心跳事件
  client.on('heartbeat', () => {
    sysLogger.log('发送心跳')
  })

  client.on('heartbeatTimeout', () => {
    sysLogger.warn('心跳超时，可能连接已断开')
  })

  // 等待一段时间
  await new Promise((resolve) => setTimeout(resolve, 30000))

  client.destroy()
}

/**
 * 批量发送消息示例
 */
export async function batchMessageExample() {
  const client = new WebSocketClient({
    url: 'ws://localhost:8888',
    autoConnect: true
  })

  await client.connect()

  // 批量发送消息
  const promises = []
  for (let i = 0; i < 10; i++) {
    promises.push(
      client.sendChatMessage(`消息 ${i + 1}`, `User${i + 1}`, { roomId: 'batch-room' })
    )
  }

  const results = await Promise.all(promises)
  sysLogger.log(`批量发送完成，成功 ${results.filter(r => r).length} 条`)

  client.destroy()
}

/**
 * 错误处理示例
 */
export async function errorHandlingExample() {
  const client = new WebSocketClient({
    url: 'ws://localhost:9999', // 错误的端口
    connection: {
      reconnectAttempts: 3
    }
  })

  // 监听各种错误事件
  client.on('error', (error) => {
    sysLogger.error('客户端错误:', error.message)
  })

  client.on('stateChanged', (state) => {
    sysLogger.log('连接状态变更:', state)
  })

  try {
    await client.connect()
  } catch (error) {
    sysLogger.error('连接失败:', error)
  }

  client.destroy()
}
