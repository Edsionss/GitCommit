import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDataStore = defineStore('data', () => {
  // State
  const scanResultList = ref<any[]>([])
  const scanId = ref<string>('')
  // Getters
  const getScanResultList = computed(() => scanResultList.value)
  const getScanId = computed(() => scanId.value)
  // Actions
  function setScanResultList(val: any) {
    scanResultList.value = val
  }
  function setScanId(val: any) {
    scanId.value = val
  }

  const delScanResultList = () => {
    scanResultList.value = []
    scanId.value = ''
  }

  // Initial load

  return {
    //state
    scanResultList,
    scanId,
    //getters
    getScanResultList,
    getScanId,
    //actions
    setScanResultList,
    setScanId,
    delScanResultList
  }
})
