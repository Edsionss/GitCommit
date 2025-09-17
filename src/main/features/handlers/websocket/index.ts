import type { WebSocket } from 'ws'
import type { ChatMessage } from '@sharedType/WebSocket'
import { ipcMain } from 'electron'
import {
  handleGetWsAddress,
  startWebSocketServer,
  handleSendRoomBroadcast,
  handleSendDirectBroadcast,
  findAppHosts
} from '@services/websocket'
/**
 * 处理从客户端接收到的消息
 * @param message - 从客户端收到的原始消息字符串
 * @returns - 经过处理、准备广播的 ChatMessage 对象
 */
export function handleMessage(message: string, clientId: string): ChatMessage {
  // 客户端现在会发送 { text: '...', nickname: '...', token: '...' }
  const incomingData = JSON.parse(message)

  if (!incomingData.text || !incomingData.nickname) {
    throw new Error('Invalid message payload. "text" and "nickname" are required.')
  }

  const processedMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: incomingData.text,
    sender: clientId, // 使用一个唯一标识符来代表发送者
    nickname: incomingData.nickname, // 使用客户端传来的昵称
    timestamp: Date.now(),
    token: incomingData.token // 将 token 传递下去
  }

  console.log('Processed message:', processedMessage)
  return processedMessage
}

export function initializeWebSocket() {
  // 注册 IPC 处理器
  ipcMain.handle('get-ws-address', handleGetWsAddress)
  ipcMain.handle('start-ws-server', startWebSocketServer)
  // 重命名：用于向当前主机的所有连接客户端广播（房间内广播）
  ipcMain.on('send-room-broadcast', handleSendRoomBroadcast)
  // 新增：用于向指定IP地址发送一次性广播
  ipcMain.on('send-direct-broadcast', handleSendDirectBroadcast)

  ipcMain.handle('network:scan', async (_event, port: number) => {
    try {
      const ips = await findAppHosts(port)
      return { success: true, ips }
    } catch (error) {
      console.error('Failed to scan network:', error)
      return { success: false, error: (error as Error).message }
    }
  })
}
