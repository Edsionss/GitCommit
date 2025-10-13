import { ipcMain } from 'electron';
import { sendNtfyMessage, getNotificationLogs } from '@features/services/NtfyNotification';
import type {
  NtfyMessageRequest,
  NtfyMessageResponse,
  GetNotificationLogsRequest,
  GetNotificationLogsResponse
} from '@sharedType/NtfyNotification';

/**
 * 注册NtfyNotification相关的IPC处理器
 */
export function registerNtfyNotificationHandlers(): void {
  // 发送ntfy消息推送
  ipcMain.handle('ntfy:sendMessage', async (_, request: NtfyMessageRequest): Promise<NtfyMessageResponse> => {
    return await sendNtfyMessage(request);
  });
  
  // 获取推送日志列表
  ipcMain.handle('ntfy:getLogs', async (_, request: GetNotificationLogsRequest): Promise<GetNotificationLogsResponse> => {
    return await getNotificationLogs(request);
  });
}