import { ipcMain } from 'electron'
import { scanHistoryService } from '@services/git'
import type { ScanHistoryItem } from '@sharedType/git'

export function registerScanHistoryHandlers() {
  // 获取所有扫描记录
  ipcMain.handle('scan-history:get-all', (): ScanHistoryItem[] => {
    return scanHistoryService.getAllScanHistories()
  })

  // 根据 ID 获取扫描记录
  ipcMain.handle('scan-history:get-by-id', (_, id: string): ScanHistoryItem | null => {
    return scanHistoryService.getScanHistoryById(id)
  })

  // 添加扫描记录
  ipcMain.handle(
    'scan-history:add',
    (_, scanHistory: Omit<ScanHistoryItem, 'id'>): ScanHistoryItem => {
      return scanHistoryService.addScanHistory(scanHistory)
    }
  )

  // 更新扫描记录
  ipcMain.handle(
    'scan-history:update',
    (_, id: string, updates: Partial<ScanHistoryItem>): boolean => {
      return scanHistoryService.updateScanHistory(id, updates)
    }
  )

  // 删除扫描记录
  ipcMain.handle('scan-history:delete', (_, id: string): boolean => {
    return scanHistoryService.deleteScanHistory(id)
  })

  // 删除所有扫描记录
  ipcMain.handle('scan-history:delete-all', (): boolean => {
    return scanHistoryService.deleteAllScanHistories()
  })
}
