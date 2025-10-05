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
      console.error('Failed to get audit logs:', error)
      // 向渲染进程返回一个错误对象, 使其能够捕获 Promise rejection
      return Promise.reject(error)
    }
  })

  // 处理删除审计日志的请求
  ipcMain.handle('auditLog:delete', async (_event, ids: number[]) => {
    try {
      return await auditLogService.deleteAuditLogs(ids)
    } catch (error) {
      console.error('Failed to delete audit logs:', error)
      return Promise.reject(error)
    }
  })
}
