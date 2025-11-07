import { BrowserWindow, WebContents } from 'electron'
import { getMainWindow } from '../index'

let mainWindow: BrowserWindow | null = null

/**
 * 设置主窗口（在创建窗口时调用）
 */
export function setMainWindow(win: BrowserWindow) {
  mainWindow = win
}

/**
 * 向主窗口发送消息
 */
export function sendToMainWindow(channel: string, data: any) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data)
  } else {
    console.warn('[ipcSend] 主窗口未就绪或已销毁')
  }
}

/**
 * 向当前聚焦窗口发送消息
 */
export function sendToFocusedWindow(channel: string, data: any) {
  const win = BrowserWindow.getFocusedWindow()
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, data)
  } else {
    console.warn('[ipcSend] 没有聚焦窗口')
  }
}

/**
 * 缓存 sender（多任务/多窗口）
 */
const senderMap = new Map<string, WebContents>()

export function saveSender(taskId: string, sender: WebContents) {
  senderMap.set(taskId, sender)
}

/**
 * 根据任务 ID 向对应窗口发送消息
 */
export function sendToTask(taskId: string, channel: string, data: any) {
  const sender = senderMap.get(taskId)
  if (sender && !sender.isDestroyed()) {
    sender.send(channel, data)
  } else {
    console.warn(`[ipcSend] sender 不存在或已销毁: ${taskId}`)
  }
}

/**
 * 清除某任务的 sender
 */
export function clearSender(taskId: string) {
  senderMap.delete(taskId)
}
