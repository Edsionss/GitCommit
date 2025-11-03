# WebSocket 核心工具库 (wsCore)

## 概述

wsCore 是一个功能强大的 WebSocket 客户端库，提供连接管理、消息处理、心跳检测、重连机制等底层功能的二次封装。它简化了 WebSocket 的使用，提供了更加友好的 API 和强大的功能。

## 特性

- ✅ **连接管理**: 自动管理 WebSocket 连接状态
- ✅ **自动重连**: 支持自定义重连策略和次数限制
- ✅ **心跳检测**: 内置心跳机制检测连接健康状态
- ✅ **消息编码/解码**: 标准化的数据包格式和序列化
- ✅ **请求-响应模式**: 支持异步请求和响应处理
- ✅ **统计监控**: 内置消息统计和延迟监控
- ✅ **房间支持**: 支持聊天室等多用户场景
- ✅ **TypeScript 支持**: 完整的类型定义

## 目录结构

```
wsCore/
├── ConnectionManager.ts    # 连接管理器
├── MessageHandler.ts       # 消息处理器
├── PacketEncoder.ts        # 数据包编码/解码器
├── WebSocketClient.ts      # WebSocket 客户端
├── index.ts               # 统一导出
├── examples.ts            # 使用示例
└── README.md              # 说明文档
```

## 快速开始

### 安装依赖

```bash
pnpm install ws
```

### 基本使用

```typescript
import { WebSocketClient } from '@features/services/websocket/wsCore'

// 创建客户端
const client = new WebSocketClient({
  url: 'ws://localhost:8888',
  autoConnect: true
})

// 监听连接事件
client.on('connected', () => {
  console.log('已连接')
})

client.on('disconnected', () => {
  console.log('已断开')
})

// 监听消息
client.on('chatMessage', (packet) => {
  console.log(`收到消息: ${packet.payload.text}`)
})

// 发送消息
client.sendChatMessage('Hello World', 'User1')

// 清理资源
client.destroy()
```

## 核心类

### 1. ConnectionManager

负责 WebSocket 连接的建立、管理和重连。

```typescript
import { ConnectionManager } from '@features/services/websocket/wsCore'

const manager = new ConnectionManager({
  url: 'ws://localhost:8888',
  reconnectAttempts: 5,      // 最大重连次数
  reconnectInterval: 3000,   // 重连间隔（毫秒）
  heartbeatInterval: 30000,  // 心跳间隔（毫秒）
  heartbeatTimeout: 10000,   // 心跳超时（毫秒）
  connectTimeout: 5000       // 连接超时（毫秒）
})

// 建立连接
await manager.connect()

// 发送数据
manager.send('Hello')

// 关闭连接
manager.close()
```

### 2. MessageHandler

负责消息的编码、解码、处理和分发。

```typescript
import { MessageHandler } from '@features/services/websocket/wsCore'

const handler = new MessageHandler({
  enableLogging: true,      // 启用日志
  enableValidation: true    // 启用数据包验证
})

// 处理消息
handler.on('chatMessage', (packet) => {
  console.log('收到消息:', packet.payload)
})

// 发送消息
handler.sendChatMessage('Hello', 'User1')
handler.sendBroadcast('Broadcast', 'User1', 'global')

// 发送请求并等待响应
const response = await handler.sendRequest(
  PacketType.COMMAND,
  { action: 'getInfo' },
  5000
)
```

### 3. PacketEncoder

负责数据包的编码、解码和验证。

```typescript
import { PacketEncoder, PacketType } from '@features/services/websocket/wsCore'

// 编码数据包
const packet = PacketEncoder.createChatMessage(
  'Hello',
  'User1',
  { roomId: 'room-001' }
)
const encoded = PacketEncoder.encode(packet)

// 解码数据包
const decoded = PacketEncoder.decode(encoded)
if (decoded) {
  console.log('消息:', decoded.payload.text)
}

// 验证数据包
const isValid = PacketEncoder.validatePacket(decoded)
```

### 4. WebSocketClient

整合 ConnectionManager 和 MessageHandler，提供完整的客户端功能。

```typescript
import { WebSocketClient } from '@features/services/websocket/wsCore'

const client = new WebSocketClient({
  url: 'ws://localhost:8888',
  autoConnect: true,
  enableStatistics: true
})

// 监听事件
client.on('connected', () => {})
client.on('disconnected', () => {})
client.on('chatMessage', (packet) => {})
client.on('broadcast', (packet) => {})

// 发送消息
client.sendChatMessage('Hello', 'User1')
client.sendBroadcast('Hello All', 'User1', 'global')

// 获取统计信息
const stats = client.getStatistics()
console.log('连接次数:', stats.totalConnections)
console.log('消息统计:', client.getMessageStats())
```

## 便捷函数

### createClient

创建自定义配置的客户端。

```typescript
import { createClient } from '@features/services/websocket/wsCore'

const client = createClient({
  url: 'ws://localhost:8888',
  autoConnect: true
})
```

### createQuickClient

使用默认配置快速创建客户端。

```typescript
import { createQuickClient } from '@features/services/websocket/wsCore'

const client = createQuickClient('ws://localhost:8888')
```

### createLocalClient

创建连接到 localhost 的客户端。

```typescript
import { createLocalClient } from '@features/services/websocket/wsCore'

const client = createLocalClient(8888) // 连接到 ws://localhost:8888
```

## 数据包类型

### 聊天消息 (CHAT_MESSAGE)

```typescript
{
  header: {
    id: 'unique-id',
    type: 'chat_message',
    timestamp: 1234567890,
    version: '1.0.0'
  },
  payload: {
    text: '消息内容',
    nickname: '用户昵称',
    roomId?: '房间ID',
    senderId?: '发送者ID'
  }
}
```

### 广播消息 (BROADCAST)

```typescript
{
  header: {
    id: 'unique-id',
    type: 'broadcast',
    timestamp: 1234567890,
    version: '1.0.0'
  },
  payload: {
    text: '广播内容',
    nickname: '发送者',
    broadcastType: 'global' | 'local' | 'room',
    originIp?: '源IP',
    roomId?: '房间ID'
  }
}
```

### 心跳 (HEARTBEAT)

```typescript
{
  header: {
    id: 'unique-id',
    type: 'heartbeat',
    timestamp: 1234567890,
    version: '1.0.0'
  },
  payload: {
    serverTime: 1234567890
  }
}
```

### 响应 (RESPONSE)

```typescript
{
  header: {
    id: 'unique-id',
    type: 'response',
    timestamp: 1234567890,
    version: '1.0.0'
  },
  payload: {
    requestId: '请求ID',
    success: true,
    data?: any,
    error?: string
  }
}
```

## 事件说明

### ConnectionManager 事件

- `connected`: 连接建立
- `disconnected(code, reason)`: 连接断开
- `error(error)`: 连接错误
- `stateChanged(state)`: 状态变更
- `heartbeat`: 发送心跳
- `heartbeatTimeout`: 心跳超时
- `reconnectionAttempt(attempt)`: 重连尝试
- `maxReconnectAttemptsReached`: 达到最大重连次数

### MessageHandler 事件

- `chatMessage(packet)`: 收到聊天消息
- `broadcast(packet)`: 收到广播消息
- `heartbeat(packet)`: 收到心跳
- `systemMessage(packet)`: 收到系统消息
- `error(packet)`: 收到错误包
- `response(packet)`: 收到响应
- `unknownPacket(packet)`: 收到未知类型数据包

### WebSocketClient 事件

继承所有 ConnectionManager 和 MessageHandler 的事件。

## 高级功能

### 自动重连

```typescript
const client = new WebSocketClient({
  url: 'ws://localhost:8888',
  connection: {
    reconnectAttempts: 10,      // 最多重连 10 次（0 表示无限重连）
    reconnectInterval: 5000     // 每 5 秒重连一次
  }
})
```

### 请求-响应模式

```typescript
// 发送请求
const response = await client.sendRequest(
  PacketType.COMMAND,
  { action: 'getUserInfo', userId: 123 },
  5000 // 5 秒超时
)

console.log('响应数据:', response)
```

### 统计监控

```typescript
// 获取统计信息
const stats = client.getStatistics()
console.log('总连接次数:', stats.totalConnections)
console.log('总消息数:', stats.totalMessagesReceived + stats.totalMessagesSent)
console.log('平均延迟:', stats.averageLatency)

// 获取消息统计
const msgStats = client.getMessageStats()
console.log('按类型统计:', msgStats.byType)
```

### 房间聊天

```typescript
// 发送房间消息
client.sendChatMessage('Hello', 'User1', { roomId: 'room-001' })

// 监听房间消息
client.on('chatMessage', (packet) => {
  if (packet.payload.roomId) {
    console.log(`房间 ${packet.payload.roomId}: ${packet.payload.text}`)
  }
})
```

## 示例代码

详细示例请参考 [examples.ts](examples.ts) 文件，包含：

1. **基本使用示例** - 基础连接和消息发送
2. **重连示例** - 自动重连功能演示
3. **请求-响应示例** - 异步请求处理
4. **统计监控示例** - 实时统计信息展示
5. **房间聊天示例** - 多用户房间功能
6. **心跳检测示例** - 连接健康检测
7. **批量消息示例** - 高频消息发送
8. **错误处理示例** - 完善的错误处理机制

## 注意事项

1. **资源清理**: 使用完毕后调用 `destroy()` 方法清理资源
2. **错误处理**: 建议监听 `error` 事件进行错误处理
3. **重连策略**: 根据网络情况调整重连参数
4. **消息频率**: 避免高频发送消息导致性能问题
5. **类型安全**: 所有 API 都有完整的 TypeScript 类型支持

## 许可证

本项目遵循 MIT 许可证。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个工具库。

## 更新日志

### v1.0.0

- 初始版本发布
- 实现连接管理、消息处理、数据包编码等核心功能
- 支持自动重连、心跳检测、请求-响应等高级特性
