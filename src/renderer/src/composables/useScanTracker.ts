import { ref } from 'vue'

export function useScanTracker() {
  const scanProgress = ref(0)
  const scanStatus = ref('准备中')
  const scanning = ref(false)

  const setScanProgress = (progress: number) => {
    scanProgress.value = progress
  }

  const setScanStatus = (status: string) => {
    scanStatus.value = status
  }

  const setScanningState = (state: boolean) => {
    scanning.value = state
  }

  return {
    scanProgress,
    scanStatus,
    scanning,
    setScanProgress,
    setScanStatus,
    setScanningState
  }
}
