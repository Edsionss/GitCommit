import type { WebSocket } from 'ws'
export interface ChatMessage {
  id: string // 消息的唯一ID
  text: string // 消息内容
  sender: string // 发送者标识 (这里我们先简单设为 'User')
  timestamp: number // 发送时间的时间戳
  nickname: string // 发送者的昵称
  token?: string // 新增：用于房间验证的令牌
  isMe?: boolean // 新增：标记消息是否由当前客户端发送
  originIp?: string // 新增：标记消息的原始来源IP
  broadcastType?: 'room' | 'direct' | 'global' // 新增：标记广播类型
  isBroadcast?: boolean // 新增：标记是否为广播消息
  type?: string // 消息类型
}

export interface DirectBroadcastPayload {
  targets: string[]
  message: { text: string; nickname: string }
}

// 定义房间成员信息
export interface RoomMember {
  id: string // 成员的唯一标识 (可以是 clientId)
  ws: WebSocket // 成员的 WebSocket 连接实例
  nickname: string
}
