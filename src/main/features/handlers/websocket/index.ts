import { ipcMain } from 'electron'
import {
  handleGetWsAddress,
  startWebSocketServer,
  findAppHosts,
  handleSendRoomBroadcast,
  handleSendDirectBroadcast,
  handleSendGlobalBroadcast
} from '@services/websocket'

export function initializeWebSocket() {
  // 注册 IPC 处理器
  ipcMain.handle('get-ws-address', handleGetWsAddress)
  ipcMain.handle('start-ws-server', startWebSocketServer)
  ipcMain.handle('network:scan', async (_event, port: number) => {
    try {
      const ips = await findAppHosts(port)
      return { success: true, ips }
    } catch (error) {
      console.error('Failed to scan network:', error)
      return { success: false, error: (error as Error).message }
    }
  })
  // 用于向当前主机的所有连接客户端广播（房间内广播）
  ipcMain.on('send-room-broadcast', handleSendRoomBroadcast)
  // 用于向指定IP地址发送一次性广播
  ipcMain.on('send-direct-broadcast', handleSendDirectBroadcast)
  // 用于向所有扫描到的IP地址发送一次性广播
  ipcMain.on('send-global-broadcast', handleSendGlobalBroadcast)
}
