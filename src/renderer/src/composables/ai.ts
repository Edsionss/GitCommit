import _ from 'lodash'
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { storeToRefs } from 'pinia'
import { message as antMessage } from 'ant-design-vue'

export function useAi() {
  const settingsStore = useSettingsStore()
  const { appSettings } = storeToRefs(settingsStore)
  const aiConfig = computed(() => appSettings.value.ai || null)

  const sendAiMessage = async (prompt: string) => {
    try {
      if (!aiConfig.value.provider || !aiConfig.value.apiKey) {
        antMessage.error('请设置AI源和API密钥')
        return
      }
      const result = await window.api.aiChat(prompt, _.cloneDeep(aiConfig.value))
      if (result.success) {
        return result.message
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
      antMessage.error(errorMessage)
    }
  }

  return {
    sendAiMessage
  }
}
