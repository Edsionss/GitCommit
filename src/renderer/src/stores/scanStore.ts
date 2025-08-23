import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export const useScanStore = defineStore('scan', () => {
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
    setGitCommits
  }
})
