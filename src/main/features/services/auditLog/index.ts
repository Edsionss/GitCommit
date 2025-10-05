import { dbHelper } from '@features/database'

import { AuditLog } from '@sharedType/auditLog'
// 定义审计日志的数据结构 (与数据库 schema 对应, 使用驼峰式)

/**
 * 审计日志服务类
 * 负责处理与审计日志相关的业务逻辑
 */
class AuditLogService {
  private static readonly TABLE_NAME = 'audit_logs'

  /**
   * 分页获取审计日志
   * @param page - 当前页码 (从 1 开始)
   * @param pageSize - 每页的记录数
   * @returns 返回包含日志记录和总数的对象
   */
  public async getAuditLogs(
    page: number,
    pageSize: number
  ): Promise<{ records: AuditLog[]; total: number }> {
    try {
      // 计算偏移量
      const offset = (page - 1) * pageSize

      // 查询总记录数
      const countResult = dbHelper.query<{ total: number }>(
        `SELECT COUNT(*) as total FROM ${AuditLogService.TABLE_NAME}`
      )
      const total = countResult.length > 0 ? countResult[0].total : 0

      // 分页查询日志记录, 按时间戳降序排列
      const records = dbHelper.query<AuditLog>(
        `SELECT * FROM ${AuditLogService.TABLE_NAME} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
        [pageSize, offset]
      )

      return { records, total }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      // 在实际应用中, 可能需要更复杂的错误处理
      return { records: [], total: 0 }
    }
  }

  /**
   * 根据 ID 数组删除审计日志
   * @param ids - 要删除的日志 ID 数组
   * @returns 返回成功删除的记录数
   */
  public async deleteAuditLogs(ids: number[]): Promise<{ changes: number }> {
    if (!ids || ids.length === 0) {
      return { changes: 0 }
    }

    try {
      // 构建占位符, 例如: (?, ?, ?)
      const placeholders = ids.map(() => '?').join(', ')
      const sql = `DELETE FROM ${AuditLogService.TABLE_NAME} WHERE id IN (${placeholders})`

      // 使用 dbHelper.execute 执行删除操作
      const result = dbHelper.execute(sql, ids)
      return result
    } catch (error) {
      console.error('Error deleting audit logs:', error)
      return { changes: 0 }
    }
  }
}

// 导出服务实例
export const auditLogService = new AuditLogService()
