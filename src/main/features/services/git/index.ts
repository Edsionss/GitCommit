import { dbHelper } from '@features/database'
import type { ScanHistoryItem, GitCommit } from '@sharedType/git'

export class ScanHistoryService {
  // 获取所有扫描记录
  getAllScanHistories(): ScanHistoryItem[] {
    try {
      const scanHistories = dbHelper.find('scan_histories', {})

      // 为每个扫描历史获取相关的提交记录
      return scanHistories.map((history) => {
        const commits = dbHelper.find('git_commits', { scanHistoryId: history.id })
        return {
          ...history,
          scanOptions: JSON.parse(history.scanOptions || '{}'),
          log: JSON.parse(history.log || '[]'),
          results: commits
        }
      })
    } catch (error) {
      console.error('Error getting scan histories:', error)
      return []
    }
  }

  // 根据 ID 获取扫描记录
  getScanHistoryById(id: string): ScanHistoryItem | null {
    try {
      const history = dbHelper.findOne('scan_histories', { id })
      if (!history) return null

      const commits = dbHelper.find('git_commits', { scanHistoryId: id })
      return {
        ...history,
        scanOptions: JSON.parse(history.scanOptions || '{}'),
        log: JSON.parse(history.log || '[]'),
        results: commits
      }
    } catch (error) {
      console.error(`Error getting scan history by id ${id}:`, error)
      return null
    }
  }

  // 添加扫描记录
  addScanHistory(scanHistory: Omit<ScanHistoryItem, 'id'>): ScanHistoryItem {
    try {
      // 生成唯一ID
      const id = require('nanoid').nanoid()

      // 准备扫描历史数据
      const historyData = {
        id,
        status: scanHistory.status,
        scanTime: scanHistory.scanTime,
        repoPath: scanHistory.repoPath,
        totalCommits: scanHistory.totalCommits,
        analysisResult: scanHistory.analysisResult,
        scanOptions: JSON.stringify(scanHistory.scanOptions),
        log: JSON.stringify(scanHistory.log)
      }

      // 插入扫描历史
      dbHelper.insert('scan_histories', historyData)

      // 如果有提交记录，批量插入
      if (scanHistory.results && scanHistory.results.length > 0) {
        const commitsData = scanHistory.results.map((commit) => ({
          scanHistoryId: id,
          commitId: commit.commitId,
          shortHash: commit.shortHash,
          author: commit.author,
          email: commit.email,
          date: commit.date,
          message: commit.message,
          body: commit.body || null,
          filesChanged: commit.filesChanged,
          insertions: commit.insertions,
          deletions: commit.deletions,
          branch: commit.branch || null,
          repository: commit.repository,
          repoPath: commit.repoPath
        }))

        dbHelper.insertMany('git_commits', commitsData)
      }

      return this.getScanHistoryById(id)!
    } catch (error) {
      console.error('Error adding scan history:', error)
      throw error
    }
  }

  // 更新扫描记录
  updateScanHistory(id: string, updates: Partial<ScanHistoryItem>): boolean {
    try {
      // 准备更新数据
      const updateData: any = {}

      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.analysisResult !== undefined) updateData.analysisResult = updates.analysisResult
      if (updates.totalCommits !== undefined) updateData.totalCommits = updates.totalCommits
      if (updates.scanOptions !== undefined)
        updateData.scanOptions = JSON.stringify(updates.scanOptions)
      if (updates.log !== undefined) updateData.log = JSON.stringify(updates.log)

      // 更新扫描历史
      const result = dbHelper.update('scan_histories', updateData, { id })

      if (result.changes === 0) return false

      // 如果有提交记录更新，先删除旧的再插入新的
      if (updates.results) {
        dbHelper.delete('git_commits', { scanHistoryId: id })

        if (updates.results.length > 0) {
          const commitsData = updates.results.map((commit) => ({
            scanHistoryId: id,
            commitId: commit.commitId,
            shortHash: commit.shortHash,
            author: commit.author,
            email: commit.email,
            date: commit.date,
            message: commit.message,
            body: commit.body || null,
            filesChanged: commit.filesChanged,
            insertions: commit.insertions,
            deletions: commit.deletions,
            branch: commit.branch || null,
            repository: commit.repository,
            repoPath: commit.repoPath
          }))

          dbHelper.insertMany('git_commits', commitsData)
        }
      }

      return true
    } catch (error) {
      console.error(`Error updating scan history ${id}:`, error)
      return false
    }
  }

  // 删除扫描记录
  deleteScanHistory(id: string): boolean {
    try {
      // 删除提交记录（由于外键约束和级联删除，这会自动删除相关的提交记录）
      const result = dbHelper.delete('scan_histories', { id })
      return result.changes > 0
    } catch (error) {
      console.error(`Error deleting scan history ${id}:`, error)
      return false
    }
  }

  // 删除所有扫描记录
  deleteAllScanHistories(): boolean {
    try {
      // 清空两个表
      dbHelper.clearTable('git_commits')
      dbHelper.clearTable('scan_histories')
      return true
    } catch (error) {
      console.error('Error deleting all scan histories:', error)
      return false
    }
  }
}

export const scanHistoryService = new ScanHistoryService()
