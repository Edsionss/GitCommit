import type { ScanHistoryItem } from '@sharedType/git'

export const scanHistoryApi = {
  // 获取所有扫描记录
  getAllScanHistories: (): Promise<ScanHistoryItem[]> => {
    return window.api.getAllScanHistories()
  },

  // 根据ID获取扫描记录
  getScanHistoryById: (id: string): Promise<ScanHistoryItem | null> => {
    return window.api.getScanHistoryById(id)
  },

  // 添加扫描记录
  addScanHistory: (scanHistory: Omit<ScanHistoryItem, 'id'>): Promise<ScanHistoryItem> => {
    return window.api.addScanHistory(scanHistory)
  },

  // 更新扫描记录
  updateScanHistory: (id: string, updates: Partial<ScanHistoryItem>): Promise<ScanHistoryItem | null> => {
    return window.api.updateScanHistory(id, updates)
  },

  // 删除扫描记录
  deleteScanHistory: (id: string): Promise<boolean> => {
    return window.api.deleteScanHistory(id)
  },

  // 删除所有扫描记录
  deleteAllScanHistories: (): Promise<boolean> => {
    return window.api.deleteAllScanHistories()
  },

  // 从localStorage迁移扫描记录到数据库
  migrateScanHistoryFromLocalStorage: (): Promise<{ success: boolean; message: string }> => {
    return window.api.migrateScanHistoryFromLocalStorage()
  }
}