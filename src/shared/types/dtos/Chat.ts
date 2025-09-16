export interface ChatMessage {
  id: string // 消息的唯一ID
  text: string // 消息内容
  sender: string // 发送者标识 (这里我们先简单设为 'User')
  timestamp: number // 发送时间的时间戳
  nickname: string // 发送者的昵称
  token?: string // 新增：用于房间验证的令牌
  isMe?: boolean // 新增：标记消息是否由当前客户端发送
}
