import { ipcMain } from 'electron'
import { systemLogService } from '@services/systemLog'
import { AddSystemLogRequest, GetSystemLogsRequest } from '@sharedType/systemLog'

import { sysLogger } from '@nodeUtils/sysLogger'
/**
 * 注册与系统日志相关的 IPC 处理程序
 */
export function registerSystemLogHandlers(): void {
  // 处理添加系统日志的请求
  ipcMain.handle('systemLog:add', async (_event, logRequest: AddSystemLogRequest) => {
    try {
      return await systemLogService.addSystemLog(logRequest)
    } catch (error) {
      sysLogger.error('Failed to add system log:', error)
      // 确保错误信息是可序列化的字符串
      if (error instanceof Error) {
        return Promise.reject(error.message)
      }
      return Promise.reject(String(error))
    }
  })

  // 处理获取系统日志列表的请求 (支持分页)
  ipcMain.handle('systemLog:get', async (_event, request: GetSystemLogsRequest) => {
    try {
      return await systemLogService.getSystemLogs(request)
    } catch (error) {
      sysLogger.error('Failed to get system logs:', error)
      // 确保错误信息是可序列化的字符串
      if (error instanceof Error) {
        return Promise.reject(error.message)
      }
      return Promise.reject(String(error))
    }
  })

  // 处理删除系统日志的请求
  ipcMain.handle('systemLog:delete', async (_event, ids: number[]) => {
    try {
      return await systemLogService.deleteSystemLogs(ids)
    } catch (error) {
      sysLogger.error('Failed to delete system logs:', error)
      // 确保错误信息是可序列化的字符串
      if (error instanceof Error) {
        return Promise.reject(error.message)
      }
      return Promise.reject(String(error))
    }
  })

  // 处理清除所有系统日志的请求
  ipcMain.handle('systemLog:clear', async () => {
    try {
      return await systemLogService.clearAllSystemLogs()
    } catch (error) {
      sysLogger.error('Failed to clear system logs:', error)
      // 确保错误信息是可序列化的字符串
      if (error instanceof Error) {
        return Promise.reject(error.message)
      }
      return Promise.reject(String(error))
    }
  })
}
