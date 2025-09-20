
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { systemToolsApi } from '@/api/systemToolsApi'
import { message } from 'ant-design-vue'

export const useSystemToolsStore = defineStore('systemTools', () => {
  // State
  const geminiApiKey = ref<string>('')
  const claudeApiKey = ref<string>('')
  const shutdownTargetTime = ref<number | null>(null)
  const shutdownTimerId = ref<any>(null)
  const remainingTime = ref<string>('')

  // Actions
  function formatRemainingTime(target: number) {
    const now = Date.now()
    const diff = Math.max(target - now, 0)
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return `${hours}小时 ${minutes}分钟 ${seconds}秒`
  }

  function startShutdownTimer(targetTimestamp: number) {
    shutdownTargetTime.value = targetTimestamp

    if (shutdownTimerId.value) {
      clearInterval(shutdownTimerId.value)
    }

    shutdownTimerId.value = setInterval(() => {
      remainingTime.value = formatRemainingTime(targetTimestamp)
      if (Date.now() >= targetTimestamp) {
        clearInterval(shutdownTimerId.value)
        shutdownTargetTime.value = null
      }
    }, 1000)

    remainingTime.value = formatRemainingTime(targetTimestamp) // Initial update
  }

  function clearShutdownTimer() {
    if (shutdownTimerId.value) {
      clearInterval(shutdownTimerId.value)
    }
    shutdownTargetTime.value = null
    shutdownTimerId.value = null
    remainingTime.value = ''
  }

  async function fetchEnvVars() {
    try {
      const geminiResult = await systemToolsApi.getEnvVar('GEMINI_API_KEY')
      if (geminiResult.success) {
        geminiApiKey.value = geminiResult.value || ''
      }

      const claudeResult = await systemToolsApi.getEnvVar('CLAUDE_API_KEY')
      if (claudeResult.success) {
        claudeApiKey.value = claudeResult.value || ''
      }
    } catch (error) {
      message.error('加载环境变量失败')
    }
  }

  async function saveEnvVar(key: 'GEMINI_API_KEY' | 'CLAUDE_API_KEY', value: string) {
    try {
      const result = await systemToolsApi.setEnvVar(key, value)
      if (result.success) {
        message.success(`${key} 已保存。请重启应用以使变更完全生效。`)
        // Update state after successful save
        if (key === 'GEMINI_API_KEY') {
          geminiApiKey.value = value
        } else if (key === 'CLAUDE_API_KEY') {
          claudeApiKey.value = value
        }
      } else {
        message.error(result.error || `保存 ${key} 失败`)
      }
    } catch (error) {
      message.error(`保存 ${key} 时发生未知错误`)
    }
  }

  return {
    geminiApiKey,
    claudeApiKey,
    shutdownTargetTime,
    remainingTime,
    fetchEnvVars,
    saveEnvVar,
    startShutdownTimer,
    clearShutdownTimer
  }
})
