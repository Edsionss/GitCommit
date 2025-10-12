import { dbHelper } from '@features/database'

import {
  SystemLog,
  AddSystemLogRequest,
  GetSystemLogsRequest,
  GetSystemLogsResponse
} from '@sharedType/systemLog'

// import { console } from '@nodeUtils/console'
/**
 * 系统日志服务类
 * 负责处理与系统日志相关的业务逻辑
 */
export class SystemLogService {
  private static readonly TABLE_NAME = 'system_logs'

  /**
   * 添加系统日志
   * @param logRequest - 日志请求对象
   * @returns 返回添加的日志记录
   */
  public async addSystemLog(logRequest: AddSystemLogRequest): Promise<SystemLog> {
    try {
      const { content, level } = logRequest

      // 插入日志记录
      const result = dbHelper.execute(
        `INSERT INTO ${SystemLogService.TABLE_NAME} (content, level) VALUES (?, ?)`,
        [content, level]
      )

      // 获取插入的记录
      const insertedRecord = dbHelper.query<SystemLog>(
        `SELECT * FROM ${SystemLogService.TABLE_NAME} WHERE id = ?`,
        [result.lastID]
      )

      return insertedRecord[0]
    } catch (error) {
      console.error('Error adding system log:', error)
      throw new Error(`添加系统日志失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 分页获取系统日志
   * @param request - 分页请求对象
   * @returns 返回包含日志记录和总数的对象
   */
  public async getSystemLogs(request: GetSystemLogsRequest): Promise<GetSystemLogsResponse> {
    try {
      const { page, pageSize } = request
      const offset = (page - 1) * pageSize

      // 查询总记录数
      const countResult = dbHelper.query<{ total: number }>(
        `SELECT COUNT(*) as total FROM ${SystemLogService.TABLE_NAME}`
      )
      const total = countResult.length > 0 ? countResult[0].total : 0

      // 分页查询日志记录, 按时间戳降序排列
      const records = dbHelper.query<SystemLog>(
        `SELECT * FROM ${SystemLogService.TABLE_NAME} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
        [pageSize, offset]
      )

      return { records, total }
    } catch (error) {
      console.error('Error fetching system logs:', error)
      return { records: [], total: 0 }
    }
  }

  /**
   * 根据 ID 数组删除系统日志
   * @param ids - 要删除的日志 ID 数组
   * @returns 返回成功删除的记录数
   */
  public async deleteSystemLogs(ids: number[]): Promise<{ changes: number }> {
    if (!ids || ids.length === 0) {
      return { changes: 0 }
    }

    try {
      // 构建占位符, 例如: (?, ?, ?)
      const placeholders = ids.map(() => '?').join(', ')
      const sql = `DELETE FROM ${SystemLogService.TABLE_NAME} WHERE id IN (${placeholders})`

      // 使用 dbHelper.execute 执行删除操作
      const result = dbHelper.execute(sql, ids)
      return result
    } catch (error) {
      console.error('Error deleting system logs:', error)
      throw new Error(`删除系统日志失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 清除所有系统日志
   * @returns 返回成功删除的记录数
   */
  public async clearAllSystemLogs(): Promise<{ changes: number }> {
    try {
      const result = await dbHelper.clearTable(SystemLogService.TABLE_NAME)
      return result
    } catch (error) {
      console.error('Error clearing system logs:', error)
      return { changes: 0 }
    }
  }
}

// 导出服务实例
export const systemLogService = new SystemLogService()
