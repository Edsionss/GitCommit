import { sysLogger } from '@nodeUtils/sysLogger'
import { dbHelper } from '@features/database'
import { nanoid } from 'nanoid'
import type { ScanHistoryItem, GitCommit } from '@sharedType/git'

export class ScanHistoryService {
  // 获取所有扫描记录
  getAllScanHistories(): ScanHistoryItem[] {
    try {
      return dbHelper.find('scan_histories', {}).map((history: any) => ({
        ...history,
        scanOptions: JSON.parse(history.scanOptions || '{}'),
        log: JSON.parse(history.log || '[]'),
        results: dbHelper.find('git_commits', { scanHistoryId: history.id })
      } as ScanHistoryItem))
    } catch (error) {
      sysLogger.error('Error getting scan histories:', error)
      return []
    }
  }

  // 根据 ID 获取扫描记录
  getScanHistoryById(id: string): ScanHistoryItem | null {
    try {
      const history: any = dbHelper.findOne('scan_histories', { id })
      if (!history) return null

      return {
        ...history,
        scanOptions: JSON.parse(history.scanOptions || '{}'),
        log: JSON.parse(history.log || '[]'),
        results: dbHelper.find('git_commits', { scanHistoryId: id })
      } as ScanHistoryItem
    } catch (error) {
      sysLogger.error(`Error getting scan history by id ${id}:`, error)
      return null
    }
  }

  // 添加扫描记录
  addScanHistory(scanHistory: Omit<ScanHistoryItem, 'id'>): ScanHistoryItem {
    try {
      const id = nanoid()
      
      // 准备扫描历史数据
      const historyData = {
        id,
        ...scanHistory,
        scanOptions: JSON.stringify(scanHistory.scanOptions),
        log: JSON.stringify(scanHistory.log)
      }

      // 插入扫描历史
      dbHelper.insert('scan_histories', historyData)

      // 如果有提交记录，批量插入
      if (scanHistory.results?.length) {
        const commitsData = scanHistory.results.map((commit) => ({
          scanHistoryId: id,
          ...commit,
          body: commit.body || null,
          branch: commit.branch || null
        }))

        dbHelper.insertMany('git_commits', commitsData)
      }

      return this.getScanHistoryById(id)!
    } catch (error) {
      sysLogger.error('Error adding scan history:', error)
      throw error
    }
  }

  // 更新扫描记录
  updateScanHistory(id: string, updates: Partial<ScanHistoryItem>): boolean {
    try {
      // 准备更新数据
      const updateData: any = {
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.analysisResult !== undefined && { analysisResult: updates.analysisResult }),
        ...(updates.totalCommits !== undefined && { totalCommits: updates.totalCommits }),
        ...(updates.scanOptions !== undefined && { scanOptions: JSON.stringify(updates.scanOptions) }),
        ...(updates.log !== undefined && { log: JSON.stringify(updates.log) })
      }

      // 更新扫描历史
      const result = dbHelper.update('scan_histories', updateData, { id })
      if (result.changes === 0) return false

      // 如果有提交记录更新，先删除旧的再插入新的
      if (updates.results) {
        dbHelper.delete('git_commits', { scanHistoryId: id })

        if (updates.results.length) {
          const commitsData = updates.results.map((commit) => ({
            scanHistoryId: id,
            ...commit,
            body: commit.body || null,
            branch: commit.branch || null
          }))

          dbHelper.insertMany('git_commits', commitsData)
        }
      }

      return true
    } catch (error) {
      sysLogger.error(`Error updating scan history ${id}:`, error)
      return false
    }
  }

  // 删除扫描记录
  deleteScanHistory(id: string): boolean {
    try {
      return dbHelper.delete('scan_histories', { id }).changes > 0
    } catch (error) {
      sysLogger.error(`Error deleting scan history ${id}:`, error)
      return false
    }
  }

  // 删除所有扫描记录
  deleteAllScanHistories(): boolean {
    try {
      dbHelper.clearTable('git_commits')
      dbHelper.clearTable('scan_histories')
      return true
    } catch (error) {
      sysLogger.error('Error deleting all scan histories:', error)
      return false
    }
  }
}

export const scanHistoryService = new ScanHistoryService()
