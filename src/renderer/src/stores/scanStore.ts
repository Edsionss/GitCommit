import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import type { RepoHistoryItem, GitCommit, ScanHistoryItem } from '@sharedType/git'

export const useScanStore = defineStore('scan', () => {
  //扫描记录
  const localRecord: any[] = JSON.parse(localStorage.getItem('scanRecord') || '[]') as any[]
  const scanRecordList = ref<ScanHistoryItem[]>(localRecord)
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
  //保存扫描记录
  const _savaScanRecord = () => {
    localStorage.removeItem('scanRecord')
    localStorage.setItem('scanRecord', JSON.stringify(scanRecordList.value))
  }
  //获取扫描记录
  const getScanRecordById = (id: string) => {
    return scanRecordList.value.filter((item) => item.id === id)[0]
  }
  //添加扫描记录
  const setScanRecordList = (item) => {
    scanRecordList.value.push({ ...item, id: nanoid() })
    _savaScanRecord()
  }
  //更新扫描记录
  const setScanRecordById = (id: string, data: any) => {
    scanRecordList.value = scanRecordList.value.map((item) => {
      if (item.id === id) {
        return { ...item, ...data }
      }
      return item
    })
    _savaScanRecord()
  }

  //删除扫描记录
  const delScanRecordById = (id: string) => {
    const index = scanRecordList.value.findIndex((r) => r.id === id)
    if (index > -1) {
      scanRecordList.value.splice(index, 1)
      _savaScanRecord()
    }
  }

  //删除所有扫描记录
  const delAllScanRecord = () => {
    scanRecordList.value = []
    _savaScanRecord()
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

  return {
    scanRecordList,
    getScanRecordList,
    getFirstRecord,
    getScanRecordById,
    setScanRecordList,
    setScanRecordById,
    delScanRecordById,
    delAllScanRecord,
    //仓库记录
    getGitRepos,
    gitRepos,
    addGitRepo,
    delGitRepo,
    delAllGitRepos
  }
})
