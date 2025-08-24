import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { RepoHistoryItem } from '@shared/types/dtos/git.dto'

export const useScanStore = defineStore('scan', () => {
  //扫描记录
  const localRecord: any[] = JSON.parse(localStorage.getItem('scanRecord') || '[]') as any[]
  const scanRecordList = ref<any[]>(localRecord)
  const getScanRecordList = computed(() => {
    scanRecordList.value.forEach((record) => {
      if (record.results && Array.isArray(record.results)) {
        record.results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }
    })
    return scanRecordList.value
  })
  const getFirstRecord = computed(() => {
    return scanRecordList.value?.[scanRecordList.value.length - 1] || null
  })
  const _savaScanRecord = () => {
    localStorage.removeItem('scanRecord')
    localStorage.setItem('scanRecord', JSON.stringify(scanRecordList.value))
  }
  const getScanRecordById = (id: string) => {
    return scanRecordList.value.filter((item) => item.id === id)[0]
  }
  const setScanRecordList = (item) => {
    scanRecordList.value.push({ ...item, id: uuidv4() })
    _savaScanRecord()
  }
  const setScanRecordById = (id: string, data: any) => {
    scanRecordList.value = scanRecordList.value.map((item) => {
      if (item.id === id) {
        return { ...item, ...data }
      }
      return item
    })
    _savaScanRecord()
  }

  const delScanRecordById = (id: string) => {
    const index = scanRecordList.value.findIndex((r) => r.id === id)
    if (index > -1) {
      scanRecordList.value.splice(index, 1)
      _savaScanRecord()
    }
  }

  const delAllScanRecord = () => {
    scanRecordList.value = []
    _savaScanRecord()
  }
  //本次扫描的提交记录

  const localCommits: any[] = JSON.parse(localStorage.getItem('gitCommits') || '[]') as any[]
  const gitCommits = ref<any[]>(localCommits)
  const getGitCommits = computed(() => {
    gitCommits.value.forEach((record) => {
      if (record.results && Array.isArray(record.results)) {
        record.results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }
    })
    return gitCommits.value
  })
  const _savaGitCommits = () => {
    localStorage.removeItem('gitCommits')
    localStorage.setItem('gitCommits', JSON.stringify(gitCommits.value))
  }
  const setGitCommits = (item: any) => {
    if (!item || !item.length) {
      return
    }
    gitCommits.value.push({ ...item, id: uuidv4() })
    _savaGitCommits()
  }

  //仓库里是记录
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
  const _savaGitRepos = () => {
    localStorage.removeItem('gitRepos')
    localStorage.setItem('gitRepos', JSON.stringify(gitRepos.value))
  }
  const addGitRepo = (path: string) => {
    if (!path) {
      return
    }
    gitRepos.value.push({ path, lastAccessed: new Date().toISOString() })
    _savaGitRepos()
  }

  const delGitRepo = (path: string) => {
    const index = gitRepos.value.findIndex((r) => r.path === path)
    if (index > -1) {
      gitRepos.value.splice(index, 1)
      _savaGitRepos()
    }
  }

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
    //
    localCommits,
    gitCommits,
    getGitCommits,
    setGitCommits,
    //仓库记录
    getGitRepos,
    gitRepos,
    addGitRepo,
    delGitRepo,
    delAllGitRepos
  }
})
