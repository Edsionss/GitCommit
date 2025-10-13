import { sysLogger } from '@nodeUtils/sysLogger'
import { ipcMain } from 'electron'
import { auditLogService } from '@services/auditLog'

/**
 * 注册与审计日志相关的 IPC 处理程序
 */
export function registerAuditLogHandlers(): void {
  // 处理获取审计日志列表的请求 (支持分页)
  ipcMain.handle('auditLog:get', async (_event, page: number, pageSize: number) => {
    try {
      return await auditLogService.getAuditLogs(page, pageSize)
    } catch (error) {
      sysLogger.error('Failed to get audit logs:', error)
      // 确保错误信息是可序列化的字符串
      if (error instanceof Error) {
        return Promise.reject(error.message)
      }
      return Promise.reject(String(error))
    }
  })

  // 处理删除审计日志的请求
  ipcMain.handle('auditLog:delete', async (_event, ids: number[]) => {
    try {
      return await auditLogService.deleteAuditLogs(ids)
    } catch (error) {
      sysLogger.error('Failed to delete audit logs:', error)
      // 确保错误信息是可序列化的字符串
      if (error instanceof Error) {
        return Promise.reject(error.message)
      }
      return Promise.reject(String(error))
    }
  })

  // 处理清除所有审计日志的请求
  ipcMain.handle('auditLog:clear', async () => {
    try {
      return await auditLogService.clearAllAuditLogs()
    } catch (error) {
      sysLogger.error('Failed to clear audit logs:', error)
      // 确保错误信息是可序列化的字符串
      if (error instanceof Error) {
        return Promise.reject(error.message)
      }
      return Promise.reject(String(error))
    }
  })
}
