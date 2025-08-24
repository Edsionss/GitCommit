import _ from 'lodash'
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { storeToRefs } from 'pinia'
import { message as antMessage } from 'ant-design-vue'
import type { AiConfig, ChatMessage } from '@shared/types/dtos/ai'
import { aiApi } from '@/api/ai'

interface SendAiMessageParams {
  prompt: string
  history?: ChatMessage[]
  config?: AiConfig
  Stream?: boolean
  successFn?: (message: string) => void
  errorFn?: (message: string) => void
  finallyFn?: () => void
}

export function useAi() {
  const settingsStore = useSettingsStore()
  const { appSettings, getAiConfig } = storeToRefs(settingsStore)
  const aiConfig = computed(() => getAiConfig.value || null)
  const sendAiMessage = async ({
    prompt,
    history,
    config,
    Stream = aiConfig.value?.enableStreaming,
    successFn,
    errorFn,
    finallyFn
  }: SendAiMessageParams) => {
    try {
      if (!aiConfig.value.provider || !aiConfig.value.apiKey) {
        antMessage.error('请设置AI源和API密钥')
        return
      }
      const result = await aiApi.aiChat(
        prompt,
        _.cloneDeep(config || aiConfig.value),
        history,
        Stream
      )
      if (result.success) {
        successFn && successFn(result.message)
        return result.message
      } else {
        antMessage.error(result.error)
        throw new Error(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
      antMessage.error(errorMessage)
      errorFn && errorFn(errorMessage)
      throw new Error(errorMessage)
    } finally {
      finallyFn && finallyFn()
      return 'end'
    }
  }
  const onChatStreamChunk = (callback: (chunk: string) => void) => {
    aiApi.onChatStreamChunk(callback)
  }

  return {
    sendAiMessage,
    onChatStreamChunk
  }
}
