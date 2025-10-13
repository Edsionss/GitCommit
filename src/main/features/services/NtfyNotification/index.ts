import axios from 'axios'
import { dbHelper } from '@features/database'
import type {
  NtfyMessageRequest,
  NtfyMessageResponse,
  NotificationLog,
  GetNotificationLogsRequest,
  GetNotificationLogsResponse
} from '@sharedType/NtfyNotification'

/**
 * 发送ntfy消息推送
 * @param request 推送请求参数
 * @returns 推送结果
 */
export async function sendNtfyMessage(request: NtfyMessageRequest): Promise<NtfyMessageResponse> {
  const { topic, message } = request

  try {
    // 使用axios发送POST请求到ntfy.sh
    const response = await axios.post(`https://ntfy.sh/${topic}`, message, {
      headers: {
        'Content-Type': 'text/plain'
      },
      timeout: 10000 // 10秒超时
    })

    // 记录成功的推送日志
    await logNotification({
      topic,
      message,
      status: 'success',
      error_message: null
    })

    return {
      success: true,
      message: '消息推送成功'
    }
  } catch (error) {
    // 提取错误信息
    const errorMessage = error instanceof Error ? error.message : '未知错误'

    // 记录失败的推送日志
    await logNotification({
      topic,
      message,
      status: 'failed',
      error_message: errorMessage
    })

    return {
      success: false,
      error: `消息推送失败: ${errorMessage}`
    }
  }
}

/**
 * 记录推送日志到数据库
 * @param log 日志信息
 */
async function logNotification(log: {
  topic: string
  message: string
  status: 'success' | 'failed'
  error_message: string | null
}): Promise<void> {
  try {
    await dbHelper.insert('notification_logs', {
      topic: log.topic,
      message: log.message,
      status: log.status,
      error_message: log.error_message
    })
  } catch (error) {
    console.error('记录推送日志失败:', error)
  }
}

/**
 * 获取推送日志列表
 * @param request 查询参数
 * @returns 推送日志列表
 */
export async function getNotificationLogs(
  request: GetNotificationLogsRequest = {}
): Promise<GetNotificationLogsResponse> {
  try {
    const { limit = 50, offset = 0, topic, status } = request

    // 构建查询条件
    let whereClause = ''
    const params: any[] = []

    if (topic) {
      whereClause += ' WHERE topic = ?'
      params.push(topic)
    }

    if (status) {
      whereClause += whereClause ? ' AND status = ?' : ' WHERE status = ?'
      params.push(status)
    }

    // 获取总数
    const countResults = await dbHelper.query<{ total: number }>(
      `SELECT COUNT(*) as total FROM notification_logs${whereClause}`,
      params
    )
    const total = countResults.length > 0 ? countResults[0].total : 0

    // 获取日志列表
    const logs = await dbHelper.query<NotificationLog>(
      `SELECT * FROM notification_logs${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    return {
      success: true,
      logs,
      total
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return {
      success: false,
      error: `获取推送日志失败: ${errorMessage}`
    }
  }
}
