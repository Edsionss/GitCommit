import _ from 'lodash'
import { useSettingsStore } from '@/stores/settingsStore'
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'
import { message as antMessage } from 'ant-design-vue'
import type { AiConfig, ChatMessage } from '@sharedType/ai'
import { aiApi } from '@api/ai'
import { chatApi } from '@api/chat'

interface SendAiMessageParams {
  prompt: string
  history?: ChatMessage[]
  aiConfig?: AiConfig
  Stream?: boolean
  successFn?: (message: string) => void
  errorFn?: (message: string) => void
  finallyFn?: () => void
}

export function useAi() {
  const settingsStore = useSettingsStore()
  const { AiConfig } = storeToRefs(settingsStore)
  const chatStore = useChatStore()
  
  const sendAiMessage = async ({
    prompt,
    history,
    aiConfig,
    Stream = AiConfig.value?.enableStreaming,
    successFn,
    errorFn,
    finallyFn
  }: SendAiMessageParams) => {
    try {
      if (!AiConfig.value.provider || !AiConfig.value.apiKey) {
        antMessage.error('请设置AI源和API密钥')
        return
      }
      const result = await aiApi.aiChat({
        prompt,
        aiConfig: _.cloneDeep(aiConfig || AiConfig.value),
        history,
        isStream: Stream
      })
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

  // 删除会话
  const deleteConversation = async (sessionId: string) => {
    try {
      await chatStore.deleteSession(sessionId)
      antMessage.success('会话删除成功')
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      antMessage.error('删除会话失败')
    }
  }

  // 重命名会话
  const renameConversation = async (sessionId: string, newName: string) => {
    try {
      // 更新本地状态
      const session = chatStore.sessions.find((s) => s.id === sessionId)
      if (session) {
        session.name = newName
      }

      // 调用API更新数据库
      await chatApi.updateSessionName(sessionId, newName)
      antMessage.success('会话名称修改成功')
    } catch (error) {
      console.error('Failed to rename conversation:', error)
      antMessage.error('修改会话名称失败')
    }
  }

  return {
    sendAiMessage,
    onChatStreamChunk,
    deleteConversation,
    renameConversation
  }
}
