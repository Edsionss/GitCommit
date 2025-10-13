// Ntfy消息推送功能相关的类型定义

export interface NtfyMessageRequest {
  topic: string;
  message: string;
}

export interface NtfyMessageResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface NotificationLog {
  id: number;
  topic: string;
  message: string;
  status: 'success' | 'failed';
  error_message?: string;
  created_at: string;
}

export interface GetNotificationLogsRequest {
  limit?: number;
  offset?: number;
  topic?: string;
  status?: 'success' | 'failed';
}

export interface GetNotificationLogsResponse {
  success: boolean;
  logs?: NotificationLog[];
  total?: number;
  error?: string;
}