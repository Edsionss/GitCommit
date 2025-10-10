// 聊天会话和消息的API接口

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

export const chatApi = {
  // 会话相关操作
  getAllChatSessions: (): Promise<ChatSession[]> => window.api.getAllChatSessions(),
  getChatSessionById: (id: string): Promise<ChatSession | null> => window.api.getChatSessionById(id),
  createChatSession: (session: Omit<ChatSession, 'createdAt' | 'updatedAt'>): Promise<ChatSession> =>
    window.api.createChatSession(session),
  updateChatSession: (id: string, updates: Partial<ChatSession>): Promise<void> =>
    window.api.updateChatSession(id, updates),
  deleteChatSession: (id: string): Promise<void> => window.api.deleteChatSession(id),
  updateSessionName: (sessionId: string, name: string): Promise<void> =>
    window.api.updateSessionName(sessionId, name),
  
  // 消息相关操作
  getMessagesBySessionId: (sessionId: string): Promise<ChatMessage[]> =>
    window.api.getMessagesBySessionId(sessionId),
  addMessageToSession: (message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> =>
    window.api.addMessageToSession(message),
  updateMessage: (id: number, updates: Partial<ChatMessage>): Promise<void> =>
    window.api.updateMessage(id, updates),
  deleteMessage: (id: number): Promise<void> => window.api.deleteMessage(id),
  deleteMessagesBySessionId: (sessionId: string): Promise<void> =>
    window.api.deleteMessagesBySessionId(sessionId)
}