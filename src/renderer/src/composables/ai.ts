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
  successAfter?: (message: string) => void
  errorFn?: (message: string) => void
  finallyFn?: () => void
}

interface OnChatStreamChunkParams {
  callback?: (chunk: string) => void
  callAfter?: (chunk: string) => void
}

export function useAi() {
  const settingsStore = useSettingsStore()
  const { AiConfig } = storeToRefs(settingsStore)
  const chatStore = useChatStore()
  const { activeSession } = storeToRefs(chatStore)

  const sendAiMessage = async ({
    prompt,
    aiConfig,
    Stream = AiConfig.value?.enableStreaming,
    successFn,
    errorFn,
    finallyFn,
    successAfter
  }: SendAiMessageParams) => {
    try {
      if (!AiConfig.value.provider || !AiConfig.value.apiKey) {
        antMessage.error('请设置AI源和API密钥')
        return
      }
      if (!activeSession.value) {
        antMessage.error('请先创建一个会话')
        return
      }
      let history: Array<{ sender: 'user' | 'ai'; text: string }> = []
      if (AiConfig.value.enableAiHistory) {
        history = activeSession.value.messages
          .filter((msg) => !msg.isLoading) // 过滤掉加载中的消息
          .slice(0, -1) // 排除当前用户输入
          .map((msg) => ({ sender: msg.sender, text: msg.text }))
      }
      chatStore.ThinkIngLoading(true)
      const result = await aiApi.aiChat({
        prompt,
        aiConfig: _.cloneDeep(aiConfig || AiConfig.value),
        history,
        isStream: Stream
      })
      if (result.success) {
        successFn && successFn(result.message)
        successFn || chatStore.finalizeStream(result.message)
        successAfter && successAfter(result.message)
        return result.message
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
      antMessage.error(errorMessage)
      errorFn && errorFn(errorMessage)
      errorFn || chatStore.handleStreamError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      chatStore.ThinkIngLoading(false)
      finallyFn && finallyFn()
      return 'end'
    }
  }

  const onChatStreamChunk = ({ callback, callAfter }: OnChatStreamChunkParams) => {
    chatStore.ThinkIngLoading(false)
    if (callback) {
      aiApi.onChatStreamChunk(callback)
    } else {
      aiApi.onChatStreamChunk((chunk) => {
        chatStore.appendStreamChunk(chunk)
      })
    }
    if (callAfter) {
      aiApi.onChatStreamChunk(callAfter)
    }
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
