import { ipcMain } from 'electron'
import {
  getAllChatSessions,
  getChatSessionById,
  createChatSession,
  updateChatSession,
  deleteChatSession,
  getMessagesBySessionId,
  addMessageToSession,
  updateMessage,
  deleteMessage,
  deleteMessagesBySessionId,
  updateSessionName
} from '@services/chat/chat'

export function registerChatHandlers() {
  // 会话相关操作
  ipcMain.handle('chat:getAllSessions', getAllChatSessions)
  ipcMain.handle('chat:getSessionById', (_, id: string) => getChatSessionById(id))
  ipcMain.handle('chat:createSession', (_, session) => createChatSession(session))
  ipcMain.handle('chat:updateSession', (_, id: string, updates) => updateChatSession(id, updates))
  ipcMain.handle('chat:deleteSession', (_, id: string) => deleteChatSession(id))
  ipcMain.handle('chat:updateSessionName', (_, sessionId: string, name: string) => updateSessionName(sessionId, name))
  
  // 消息相关操作
  ipcMain.handle('chat:getMessagesBySessionId', (_, sessionId: string) => getMessagesBySessionId(sessionId))
  ipcMain.handle('chat:addMessageToSession', (_, message) => addMessageToSession(message))
  ipcMain.handle('chat:updateMessage', (_, id: number, updates) => updateMessage(id, updates))
  ipcMain.handle('chat:deleteMessage', (_, id: number) => deleteMessage(id))
  ipcMain.handle('chat:deleteMessagesBySessionId', (_, sessionId: string) => deleteMessagesBySessionId(sessionId))
}