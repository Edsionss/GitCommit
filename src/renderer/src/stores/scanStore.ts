import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { nanoid } from 'nanoid'
import type { RepoHistoryItem, GitCommit, ScanHistoryItem } from '@sharedType/git'
import { scanHistoryApi } from '@/api/scanHistory'

export const useScanStore = defineStore('scan', () => {
  //扫描记录
  const scanRecordList = ref<ScanHistoryItem[]>([])
  const isLoading = ref(false)
  const getScanRecordList = computed(() => {
    scanRecordList.value.forEach((record) => {
      if (record.results && Array.isArray(record.results)) {
        record.results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }
    })
    return scanRecordList.value
  })
  //最新扫描记录
  const getFirstRecord = computed(() => {
    return scanRecordList.value?.[scanRecordList.value.length - 1] || null
  })
  
  // 从数据库加载扫描记录
  const loadScanRecords = async () => {
    try {
      isLoading.value = true
      const records = await scanHistoryApi.getAllScanHistories()
      scanRecordList.value = records
    } catch (error) {
      console.error('Failed to load scan records:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  //获取扫描记录
  const getScanRecordById = (id: string) => {
    return scanRecordList.value.filter((item) => item.id === id)[0]
  }
  
  //添加扫描记录
  const setScanRecordList = async (item) => {
    try {
      const newRecord = { ...item, id: nanoid() }
      const savedRecord = await scanHistoryApi.addScanHistory(newRecord)
      scanRecordList.value.push(savedRecord)
    } catch (error) {
      console.error('Failed to add scan record:', error)
    }
  }
  
  //更新扫描记录
  const setScanRecordById = async (id: string, data: any) => {
    try {
      const updatedRecord = await scanHistoryApi.updateScanHistory(id, data)
      if (updatedRecord) {
        scanRecordList.value = scanRecordList.value.map((item) => {
          if (item.id === id) {
            return { ...item, ...data }
          }
          return item
        })
      }
    } catch (error) {
      console.error('Failed to update scan record:', error)
    }
  }

  //删除扫描记录
  const delScanRecordById = async (id: string) => {
    try {
      const success = await scanHistoryApi.deleteScanHistory(id)
      if (success) {
        const index = scanRecordList.value.findIndex((r) => r.id === id)
        if (index > -1) {
          scanRecordList.value.splice(index, 1)
        }
      }
    } catch (error) {
      console.error('Failed to delete scan record:', error)
    }
  }

  //删除所有扫描记录
  const delAllScanRecord = async () => {
    try {
      const success = await scanHistoryApi.deleteAllScanHistories()
      if (success) {
        scanRecordList.value = []
      }
    } catch (error) {
      console.error('Failed to delete all scan records:', error)
    }
  }
  
  // 从localStorage迁移扫描记录到数据库
  const migrateScanRecordsFromLocalStorage = async () => {
    try {
      const result = await scanHistoryApi.migrateScanHistoryFromLocalStorage()
      if (result.success) {
        await loadScanRecords()
      }
      return result
    } catch (error) {
      console.error('Failed to migrate scan records:', error)
      return { success: false, message: '迁移失败' }
    }
  }

  // 更新扫描记录的分析结果
  const updateScanRecordAnalysis = async (id: string, analysisResult: string) => {
    try {
      await scanHistoryApi.updateScanHistory(id, { analysisResult })
      // 更新本地状态
      const index = scanRecordList.value.findIndex(record => record.id === id)
      if (index !== -1) {
        scanRecordList.value[index].analysisResult = analysisResult
      }
    } catch (error) {
      console.error('更新扫描记录分析结果失败:', error)
      throw error
    }
  }

  // 从 localStorage 迁移数据到数据库
  const migrateFromLocalStorage = async () => {
    try {
      // 获取 localStorage 中的数据
      const localRecords = JSON.parse(localStorage.getItem('scanRecord') || '[]')
      
      if (localRecords.length === 0) {
        console.log('没有需要迁移的扫描记录')
        return
      }
      
      console.log(`开始迁移 ${localRecords.length} 条扫描记录到数据库`)
      
      // 将每条记录添加到数据库
      for (const record of localRecords) {
        // 转换为 ScanHistoryItem 格式
        const scanHistoryItem: ScanHistoryItem = {
          id: record.id,
          repoPath: record.repoPath,
          scanTime: record.scanTime,
          status: record.status,
          totalCommits: record.totalCommits,
          scanOptions: record.scanOptions,
          log: record.log,
          results: record.results
        }
        
        // 添加到数据库
        await scanHistoryApi.addScanHistory(scanHistoryItem)
      }
      
      // 迁移完成后，清空 localStorage
      localStorage.removeItem('scanRecord')
      
      // 重新加载数据
      await loadScanRecords()
      
      console.log('扫描记录迁移完成')
    } catch (error) {
      console.error('迁移扫描记录失败:', error)
      throw error
    }
  }

  //仓库历史记录
  const localRepos: RepoHistoryItem[] = JSON.parse(
    localStorage.getItem('gitRepos') || '[]'
  ) as RepoHistoryItem[]
  const gitRepos = ref<RepoHistoryItem[]>(localRepos)
  const getGitRepos = computed(() => {
    gitRepos.value.sort(
      (a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
    )
    return gitRepos.value
  })
  //保存仓库记录
  const _savaGitRepos = () => {
    localStorage.removeItem('gitRepos')
    localStorage.setItem('gitRepos', JSON.stringify(gitRepos.value))
  }
  //添加仓库记录
  const addGitRepo = (path: string) => {
    if (!path) {
      return
    }
    const isExist = gitRepos.value.filter((r) => r.path === path).length
    if (!isExist) {
      gitRepos.value.push({ path, lastAccessed: new Date().toISOString() })
      _savaGitRepos()
    }
  }

  //删除仓库记录
  const delGitRepo = (path: string) => {
    const index = gitRepos.value.findIndex((r) => r.path === path)
    if (index > -1) {
      gitRepos.value.splice(index, 1)
      _savaGitRepos()
    }
  }

  //删除所有仓库记录
  const delAllGitRepos = () => {
    gitRepos.value = []
    _savaGitRepos()
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadScanRecords()
  })

  return {
    scanRecordList,
    isLoading,
    getScanRecordList,
    getFirstRecord,
    getScanRecordById,
    setScanRecordList,
    setScanRecordById,
    delScanRecordById,
    delAllScanRecord,
    loadScanRecords,
    migrateScanRecordsFromLocalStorage,
    migrateFromLocalStorage,
    updateScanRecordAnalysis,
    //仓库记录
    getGitRepos,
    gitRepos,
    addGitRepo,
    delGitRepo,
    delAllGitRepos
  }
})
