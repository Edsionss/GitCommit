import { dbHelper } from '@features/database'

export interface ChatSession {
  id: string
  name: string
  startTime: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id?: number
  sessionId: string
  sender: 'user' | 'ai'
  text: string
  isLoading?: boolean
  createdAt: string
}

// 获取所有聊天会话
export async function getAllChatSessions(): Promise<ChatSession[]> {
  return dbHelper.query<ChatSession>('SELECT * FROM chat_sessions ORDER BY start_time DESC')
}

// 根据ID获取聊天会话
export async function getChatSessionById(id: string): Promise<ChatSession | null> {
  return dbHelper.findOne<ChatSession>('chat_sessions', { id })
}

// 创建新的聊天会话
export async function createChatSession(session: Omit<ChatSession, 'createdAt' | 'updatedAt'>): Promise<ChatSession> {
  const newSession = {
    ...session,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  dbHelper.insert('chat_sessions', newSession)
  return newSession as ChatSession
}

// 更新聊天会话
export async function updateChatSession(id: string, updates: Partial<ChatSession>): Promise<void> {
  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  dbHelper.update('chat_sessions', updateData, { id })
}

// 删除聊天会话
export async function deleteChatSession(id: string): Promise<void> {
  // 使用事务确保会话和消息都被删除
  dbHelper.transaction(() => {
    // 删除会话的所有消息（由于外键约束，这会自动级联删除）
    dbHelper.delete('chat_messages', { session_id: id })
    // 删除会话
    dbHelper.delete('chat_sessions', { id })
  })
}

// 获取会话的所有消息
export async function getMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
  return dbHelper.query<ChatMessage>(
    `SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC`,
    [sessionId]
  )
}

// 添加消息到会话
export async function addMessageToSession(message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
  const newMessage = {
    ...message,
    isLoading: message.isLoading ? 1 : 0, // 将布尔值转换为整数
    createdAt: new Date().toISOString()
  }
  
  const result = dbHelper.insert('chat_messages', newMessage)
  return {
    ...newMessage,
    isLoading: !!newMessage.isLoading, // 转换回布尔值
    id: result.lastInsertRowid as number
  } as ChatMessage
}

// 更新消息
export async function updateMessage(id: number, updates: Partial<ChatMessage>): Promise<void> {
  // 处理布尔值转换
  const processedUpdates = { ...updates }
  if (processedUpdates.isLoading !== undefined) {
    processedUpdates.isLoading = processedUpdates.isLoading ? 1 : 0
  }
  
  dbHelper.update('chat_messages', processedUpdates, { id })
}

// 删除消息
export async function deleteMessage(id: number): Promise<void> {
  dbHelper.delete('chat_messages', { id })
}

// 删除会话的所有消息
export async function deleteMessagesBySessionId(sessionId: string): Promise<void> {
  dbHelper.delete('chat_messages', { session_id: sessionId })
}

// 更新会话名称
export async function updateSessionName(sessionId: string, name: string): Promise<void> {
  updateChatSession(sessionId, { name })
}