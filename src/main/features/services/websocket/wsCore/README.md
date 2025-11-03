# WebSocket 核心工具库 (wsCore) v2.0

## 概述

wsCore 是一个功能强大的 WebSocket 客户端库，提供连接管理、消息处理、心跳检测、重连机制等底层功能的二次封装。同时提供了**端到端加密**、**房间管理**、**消息路由**等高级功能。它简化了 WebSocket 的使用，提供了更加友好的 API 和强大的功能。

## 特性

### 基础功能
- ✅ **连接管理**: 自动管理 WebSocket 连接状态
- ✅ **自动重连**: 支持自定义重连策略和次数限制
- ✅ **心跳检测**: 内置心跳机制检测连接健康状态
- ✅ **消息编码/解码**: 标准化的数据包格式和序列化
- ✅ **请求-响应模式**: 支持异步请求和响应处理
- ✅ **统计监控**: 内置消息统计和延迟监控

### 安全增强 (新增)
- ✅ **端到端加密**: AES-256-GCM 加密算法
- ✅ **HMAC 签名**: 消息完整性验证
- ✅ **RSA 密钥交换**: 安全的密钥分发
- ✅ **会话密钥管理**: 自动生成和轮换
- ✅ **房间密钥**: 每个房间独立密钥
- ✅ **密码派生**: PBKDF2 安全密钥派生

### 房间管理 (新增)
- ✅ **房间创建**: 支持配置房间属性和权限
- ✅ **成员管理**: 加入/离开/踢出成员
- ✅ **房间权限**: 房主/管理员/成员角色
- ✅ **房间密钥**: 可选的房间密码保护
- ✅ **房间搜索**: 快速查找可用房间

### 消息路由 (新增)
- ✅ **单播**: 发送给指定用户
- ✅ **组播**: 发送给多个指定用户
- ✅ **广播**: 发送给所有用户
- ✅ **房间消息**: 发送给房间内所有成员
- ✅ **消息队列**: 优先级队列管理
- ✅ **投递确认**: 消息送达确认机制
- ✅ **消息重试**: 失败消息自动重试

### 开发体验
- ✅ **TypeScript 支持**: 完整的类型定义
- ✅ **事件驱动**: 丰富的事件系统
- ✅ **统计信息**: 实时监控各项指标

## 目录结构

```
wsCore/
├── ConnectionManager.ts      # 连接管理器
├── MessageHandler.ts         # 消息处理器
├── PacketEncoder.ts          # 数据包编码/解码器
├── WebSocketClient.ts        # WebSocket 客户端
├── CryptoManager.ts          # 加密管理器 (新增)
├── RoomManager.ts            # 房间管理器 (新增)
├── MessageRouter.ts          # 消息路由器 (新增)
├── SecureWebSocketClient.ts  # 安全WebSocket客户端 (新增)
├── index.ts                 # 统一导出
├── examples.ts              # 使用示例
└── README.md                # 说明文档
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

### 安全功能使用 (新增)

```typescript
import { SecureWebSocketClient } from '@features/services/websocket/wsCore'

// 创建安全客户端
const secureClient = new SecureWebSocketClient({
  url: 'ws://localhost:8888',
  crypto: {
    enableEncryption: true,     // 启用加密
    autoRotateKey: true         // 自动轮换密钥
  },
  room: {
    enableRoom: true            // 启用房间功能
  }
})

// 设置用户信息
secureClient.setCurrentUser('user123', 'Alice')

// 连接并握手
await secureClient.connect()

// 创建加密房间
const room = secureClient.createRoom({
  roomId: 'room-001',
  name: 'Private Room',
  requireKey: true,        // 需要房间密钥
  encrypted: true          // 启用加密
})

// 生成房间密钥
const roomKey = secureClient.generateRoomKey('room-001')

// 或从密码派生
const derivedKey = secureClient.deriveRoomKeyFromPassword('myPassword')

// 加入房间
const member = secureClient.joinRoom('room-001', roomKey)

// 指定发送消息 (单播)
secureClient.sendTo('user456', 'Secret message', {
  encrypt: true,
  deliveryConfirmation: true
})

// 发送房间消息
secureClient.sendToRoom('room-001', 'Hello everyone!', {
  encrypt: true
})

// 广播消息
secureClient.broadcast('Public announcement', {
  encrypt: false
})

// 清理资源
secureClient.destroy()
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

### 5. CryptoManager (新增)

负责消息加密、解密、密钥管理等功能。

```typescript
import { CryptoManager } from '@features/services/websocket/wsCore'

const crypto = new CryptoManager({
  sessionKeyLength: 32,
  pbkdf2Iterations: 100000,
  sessionKeyTTL: 3600000 // 1小时
})

// 执行握手
const handshake = crypto.generateHandshake()

// 加密消息
const encrypted = crypto.encrypt('Secret message', {
  senderId: 'user123',
  roomId: 'room-001',
  sessionKeyId: handshake.sessionKeyId
})

// 解密消息
const decrypted = crypto.decrypt(encrypted, {
  roomId: 'room-001',
  sessionKeyId: handshake.sessionKeyId
})

// 生成房间密钥
crypto.setRoomKey('room-001', 'generated-key')

// 从密码派生密钥
const derivedKey = crypto.deriveKeyFromPassword('myPassword')
```

### 6. RoomManager (新增)

负责房间的创建、成员管理、权限控制。

```typescript
import { RoomManager, RoomRole } from '@features/services/websocket/wsCore'

const roomManager = new RoomManager({
  maxRooms: 1000,
  maxMembers: 100
})

// 创建房间
const room = roomManager.createRoom({
  roomId: 'room-001',
  name: 'Private Room',
  ownerId: 'user123',
  requireKey: true,
  encrypted: true,
  persistent: true
})

// 加入房间
const member = roomManager.joinRoom('room-001', 'user456', 'Alice', {
  role: RoomRole.MEMBER,
  roomKey: 'room-key'
})

// 踢出成员
roomManager.kickMember('room-001', 'user789', 'Violation', 'user123')

// 更新房间配置
roomManager.updateRoomConfig('room-001', 'user123', {
  name: 'Updated Room Name',
  maxMembers: 50
})

// 获取房间成员
const members = roomManager.getRoomMembers('room-001')

// 销毁房间
roomManager.destroyRoom('room-001', 'Room no longer needed')
```

### 7. MessageRouter (新增)

负责消息的路由、队列管理、投递确认。

```typescript
import { MessageRouter, SendMode } from '@features/services/websocket/wsCore'

const router = new MessageRouter()

// 队列单播消息
const messageId = router.queueMessage(
  'sender123',
  {
    type: SendMode.UNICAST,
    recipientId: 'recipient456'
  },
  'Hello',
  {
    requiresAck: true,
    ttl: 60000,
    priority: 5
  }
)

// 队列组播消息
router.queueMessage(
  'sender123',
  {
    type: SendMode.MULTICAST,
    recipientIds: ['user1', 'user2', 'user3']
  },
  'Group message'
)

// 队列房间消息
router.queueMessage(
  'sender123',
  {
    type: SendMode.ROOM,
    roomId: 'room-001'
  },
  'Room message'
)

// 确认消息送达
router.acknowledge(messageId, 'recipient456')

// 获取待发送消息
const pending = router.getPendingMessages('recipient456', 'room-001')
```

### 8. SecureWebSocketClient (新增)

整合所有功能的安全 WebSocket 客户端。

```typescript
import { SecureWebSocketClient } from '@features/services/websocket/wsCore'

const secureClient = new SecureWebSocketClient({
  url: 'ws://localhost:8888',
  crypto: {
    enableEncryption: true,
    autoRotateKey: true,
    rotateInterval: 3600000
  },
  room: {
    enableRoom: true,
    maxRooms: 1000
  }
})

// 设置用户
secureClient.setCurrentUser('user123', 'Alice')

// 连接
await secureClient.connect()

// 创建房间
const room = secureClient.createRoom({
  roomId: 'room-001',
  name: 'Secure Room',
  requireKey: true,
  encrypted: true
})

// 加入房间
secureClient.joinRoom('room-001', 'room-key')

// 发送消息
secureClient.sendTo('user456', 'Private message', {
  encrypt: true,
  deliveryConfirmation: true
})

secureClient.sendToRoom('room-001', 'Room message', {
  encrypt: true
})

secureClient.broadcast('Announcement', {
  encrypt: false
})

// 获取统计
const stats = secureClient.getStats()
console.log('加密统计:', stats.crypto)
console.log('房间统计:', stats.rooms)
console.log('路由统计:', stats.router)
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

### createSecureClient (新增)

创建安全 WebSocket 客户端。

```typescript
import { createSecureClient } from '@features/services/websocket/wsCore'

const secureClient = createSecureClient({
  url: 'ws://localhost:8888',
  crypto: {
    enableEncryption: true
  },
  room: {
    enableRoom: true
  }
})
```

### createSecureQuickClient (新增)

使用默认配置快速创建安全客户端。

```typescript
import { createSecureQuickClient } from '@features/services/websocket/wsCore'

const secureClient = createSecureQuickClient('ws://localhost:8888')
```

### createCryptoManager (新增)

创建加密管理器实例。

```typescript
import { createCryptoManager } from '@features/services/websocket/wsCore'

const crypto = createCryptoManager({
  sessionKeyLength: 32,
  pbkdf2Iterations: 100000
})
```

### createRoomManager (新增)

创建房间管理器实例。

```typescript
import { createRoomManager } from '@features/services/websocket/wsCore'

const roomManager = createRoomManager({
  maxRooms: 1000,
  maxMembers: 100
})
```

### createMessageRouter (新增)

创建消息路由器实例。

```typescript
import { createMessageRouter } from '@features/services/websocket/wsCore'

const router = createMessageRouter()
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

### SecureWebSocketClient 事件 (新增)

#### 房间事件
- `roomCreated(roomId, config)`: 房间创建
- `roomJoined(roomId, member)`: 加入房间
- `roomLeft(roomId)`: 离开房间
- `roomDestroyed(roomId, reason)`: 房间销毁
- `memberJoinedRoom(roomId, member)`: 成员加入房间
- `memberLeftRoom(roomId, memberId)`: 成员离开房间
- `memberKicked(roomId, memberId, reason)`: 成员被踢出

#### 加密事件
- `keyExchangeCompleted(sessionKeyId)`: 密钥交换完成
- `encryptionEnabled()`: 加密已启用
- `encryptionDisabled()`: 加密已禁用

#### 安全事件
- `securityError(error)`: 安全错误
- `unauthorized(action)`: 未授权操作

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

### 端到端加密 (新增)

```typescript
const secureClient = new SecureWebSocketClient({
  url: 'ws://localhost:8888',
  crypto: {
    enableEncryption: true,
    autoRotateKey: true,        // 自动轮换密钥
    rotateInterval: 3600000     // 每小时轮换
  }
})

await secureClient.connect()

// 启用/禁用加密
secureClient.enableEncryption()
secureClient.disableEncryption()

// 发送加密消息
secureClient.sendTo('user456', 'Secret message', {
  encrypt: true,
  deliveryConfirmation: true
})
```

### 房间密钥管理 (新增)

```typescript
// 创建需要密钥的房间
const room = secureClient.createRoom({
  roomId: 'private-room',
  name: 'Private Room',
  requireKey: true,
  encrypted: true
})

// 生成随机密钥
const randomKey = secureClient.generateRoomKey('private-room')

// 从密码派生密钥
const derivedKey = secureClient.deriveRoomKeyFromPassword('myPassword')

// 其他用户加入房间时需要提供密钥
secureClient.joinRoom('private-room', derivedKey)

// 更新房间密钥 (仅房主)
secureClient.updateRoomKey('private-room', 'new-key')
```

### 消息路由 (新增)

```typescript
// 单播 - 发送给指定用户
const messageId1 = secureClient.sendTo('user456', 'Private message')

// 组播 - 发送给多个用户
const messageId2 = secureClient.sendToTargets(
  ['user1', 'user2', 'user3'],
  'Group message'
)

// 广播 - 发送给所有用户
const messageId3 = secureClient.broadcast('Announcement', {
  excludeSelf: true
})

// 房间消息 - 发送给房间内所有成员
const messageId4 = secureClient.sendToRoom('room-001', 'Room message')

// 所有发送方法都支持投递确认
secureClient.sendTo('user456', 'Important message', {
  deliveryConfirmation: true
})
```

## 示例代码

详细示例请参考 [examples.ts](examples.ts) 文件，包含：

### 基础示例
1. **基本使用示例** - 基础连接和消息发送
2. **重连示例** - 自动重连功能演示
3. **请求-响应示例** - 异步请求处理
4. **统计监控示例** - 实时统计信息展示
5. **房间聊天示例** - 多用户房间功能
6. **心跳检测示例** - 连接健康检测
7. **批量消息示例** - 高频消息发送
8. **错误处理示例** - 完善的错误处理机制

### 安全增强示例 (新增)
9. **加密通信示例** - 端到端加密通信
10. **房间密钥示例** - 房间密码保护
11. **消息路由示例** - 单播、组播、广播
12. **安全握手示例** - RSA 密钥交换
13. **完整安全聊天示例** - 综合使用所有安全功能

## 注意事项

### 基础使用
1. **资源清理**: 使用完毕后调用 `destroy()` 方法清理资源
2. **错误处理**: 建议监听 `error` 事件进行错误处理
3. **重连策略**: 根据网络情况调整重连参数
4. **消息频率**: 避免高频发送消息导致性能问题
5. **类型安全**: 所有 API 都有完整的 TypeScript 类型支持

### 安全增强 (新增)
6. **加密安全**:
   - 使用 `enableEncryption: true` 启用加密
   - 定期轮换会话密钥提高安全性
   - 重要消息建议启用 `deliveryConfirmation`
7. **房间安全**:
   - 创建私密房间时设置 `requireKey: true`
   - 通过安全通道分享房间密钥
   - 房主可随时更新房间密钥
8. **密钥管理**:
   - 不要在日志中泄露密钥信息
   - 使用 PBKDF2 从密码派生密钥更安全
   - 定期更换房间密钥和会话密钥
9. **性能考虑**:
   - 加密会增加 CPU 开销，合理设置消息批量发送
   - 自动密钥轮换会增加网络开销，根据需要调整频率
   - 大量房间时注意内存使用，及时清理不活跃房间

## 许可证

本项目遵循 MIT 许可证。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个工具库。

## 更新日志

### v2.0.0 (2024-11-03)

#### 新增功能
- **安全增强**:
  - 实现 AES-256-GCM 端到端加密
  - 添加 HMAC 签名验证
  - 支持 RSA 密钥交换
  - 会话密钥管理和自动轮换
  - PBKDF2 密码派生

- **房间管理**:
  - 房间创建和销毁
  - 成员加入/离开/踢出
  - 房间权限控制 (房主/管理员/成员)
  - 房间密钥保护
  - 房间搜索功能

- **消息路由**:
  - 单播 (指定用户)
  - 组播 (多个指定用户)
  - 广播 (所有用户)
  - 房间消息
  - 消息队列和优先级
  - 投递确认机制
  - 消息重试

- **安全客户端**:
  - `SecureWebSocketClient` 整合所有功能
  - 自动密钥交换和轮换
  - 房间管理集成
  - 消息加密发送

#### API 变更
- 新增 `createSecureClient()` 等便捷函数
- 新增 `CryptoManager`、`RoomManager`、`MessageRouter` 组件
- 扩展消息选项支持加密和确认

#### 性能优化
- 优化消息队列处理
- 改进内存管理
- 减少不必要的对象创建

#### 文档更新
- 完善 API 文档
- 添加安全使用指南
- 新增示例代码

### v1.0.0

- 初始版本发布
- 实现连接管理、消息处理、数据包编码等核心功能
- 支持自动重连、心跳检测、请求-响应等高级特性
