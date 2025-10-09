import { defineStore } from 'pinia'
import { onAppMetricsUpdate } from '@/api/windowApi'

export const useAppStore = defineStore('app', {
  state: () => ({
    cpuUsage: 0,
    memoryUsage: 0,
    isListenerInitialized: false,
    // 可以在这里添加更多应用级别的状态
  }),

  actions: {
    setAppMetrics(metrics: { cpu: number; memory: number }) {
      this.cpuUsage = metrics.cpu
      this.memoryUsage = metrics.memory
    },
    listenForAppMetrics() {
      if (this.isListenerInitialized) {
        return
      }
      onAppMetricsUpdate((metrics) => {
        this.setAppMetrics(metrics)
      })
      this.isListenerInitialized = true
    },
  },
})
