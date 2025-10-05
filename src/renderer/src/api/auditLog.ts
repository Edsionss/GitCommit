/**
 * @description 审计日志模块 API
 */

/**
 * 分页获取审计日志
 * @param page - 当前页码
 * @param pageSize - 每页数量
 * @returns 日志数据和总数
 */
export const getAuditLogsApi = (page: number, pageSize: number) => {
  return window.api.auditLogGet(page, pageSize)
}

/**
 * 删除审计日志
 * @param ids - 要删除的日志 ID 数组
 * @returns 删除结果
 */
export const deleteAuditLogsApi = (ids: number[]) => {
  return window.api.auditLogDelete(ids)
}
