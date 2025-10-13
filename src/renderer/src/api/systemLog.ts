/**
 * @description 系统日志模块 API
 */

/**
 * 分页获取系统日志
 * @param page - 当前页码
 * @param pageSize - 每页数量
 * @returns 日志数据和总数
 */
export const getSystemLogsApi = (page: number, pageSize: number) => {
  return window.api.systemLogGet(page, pageSize)
}

/**
 * 添加系统日志
 * @param logRequest - 日志请求对象
 * @returns 添加结果
 */
export const addSystemLogApi = (logRequest: { content: string; level: 'log' | 'warn' | 'error' }) => {
  return window.api.systemLogAdd(logRequest)
}

/**
 * 删除系统日志
 * @param ids - 要删除的日志 ID 数组
 * @returns 删除结果
 */
export const deleteSystemLogsApi = (ids: number[]) => {
  return window.api.systemLogDelete(ids)
}

/**
 * 清除所有系统日志
 * @returns 删除结果
 */
export const clearSystemLogsApi = () => {
  return window.api.systemLogClear()
}