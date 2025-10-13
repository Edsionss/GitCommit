import type {
  NtfyMessageRequest,
  NtfyMessageResponse,
  GetNotificationLogsRequest,
  GetNotificationLogsResponse,
  NotificationLog
} from '@sharedType/NtfyNotification';

/**
 * 发送ntfy消息推送
 * @param request 推送请求参数
 * @returns 推送结果
 */
export async function sendNtfyMessage(request: NtfyMessageRequest): Promise<NtfyMessageResponse> {
  return await window.api.sendNtfyMessage(request);
}

/**
 * 获取推送日志列表
 * @param request 查询参数
 * @returns 推送日志列表
 */
export async function getNotificationLogs(request?: GetNotificationLogsRequest): Promise<GetNotificationLogsResponse> {
  return await window.api.getNotificationLogs(request);
}