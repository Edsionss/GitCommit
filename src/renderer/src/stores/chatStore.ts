import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import {
  chatApi,
  type ChatSession as ApiChatSession,
  type ChatMessage as ApiChatMessage
} from '@api/chat'
import type { ChatMessage, ChatSession } from '@sharedType/ai'

export const useChatStore = defineStore('chat', () => {
  // State
  const sessions = ref<ChatSession[]>([])
  const activeSessionId = ref<string | null>(null)
  const isLoading = ref(false)

  // Getters
  const activeSession = computed(() => {
    if (!activeSessionId.value) return null
    return sessions.value.find((s) => s.id === activeSessionId.value) || null
  })

  const sessionHistory = computed(() => {
    return sessions.value
      .map(({ id, name, startTime }) => ({ id, name, startTime }))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  })

  // Actions
  async function _saveToDatabase() {
    if (!activeSession.value) return

    try {
      // 更新会话信息
      await chatApi.updateChatSession(activeSession.value.id, {
        name: activeSession.value.name,
        startTime: activeSession.value.startTime
      })

      // 删除该会话的所有消息，然后重新添加
      await chatApi.deleteMessagesBySessionId(activeSession.value.id)

      // 添加所有消息
      for (const message of activeSession.value.messages) {
        await chatApi.addMessageToSession({
          sessionId: activeSession.value.id,
          sender: message.sender,
          text: message.text,
          isLoading: message.isLoading || false
        })
      }
    } catch (error) {
      console.error('Failed to save chat session to database:', error)
    }
  }

  async function init() {
    isLoading.value = true
    try {
      // 从数据库获取所有会话
      const apiSessions = await chatApi.getAllChatSessions()

      if (apiSessions.length > 0) {
        // 转换API会话格式为本地格式
        sessions.value = []

        for (const apiSession of apiSessions) {
          // 获取会话的所有消息
          const apiMessages = await chatApi.getMessagesBySessionId(apiSession.id)

          // 转换API消息格式为本地格式
          const messages: ChatMessage[] = apiMessages.map((msg) => ({
            sender: msg.sender,
            text: msg.text,
            isLoading: msg.isLoading
          }))

          sessions.value.push({
            id: apiSession.id,
            name: apiSession.name,
            startTime: apiSession.startTime,
            messages
          })
        }

        // 设置最近的活动会话
        const sorted = [...sessions.value].sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )
        activeSessionId.value = sorted[0].id
      } else {
        // 如果没有会话，创建一个新会话
        await createNewSession()
      }
    } catch (error) {
      console.error('Failed to initialize chat store:', error)
      // 如果数据库初始化失败，创建一个新会话
      await createNewSession()
    } finally {
      isLoading.value = false
    }
  }

  async function createNewSession() {
    const newSessionId = nanoid()
    const newSessionData = {
      id: newSessionId,
      name: '新会话',
      startTime: new Date().toISOString()
    }

    // 只在前端创建会话，不保存到数据库
    const newSession: ChatSession = {
      id: newSessionId,
      name: newSessionData.name,
      startTime: newSessionData.startTime,
      messages: [] // 空消息数组
    }

    sessions.value.unshift(newSession) // Add to the beginning
    activeSessionId.value = newSession.id

    return newSession.id
  }

  function setActiveSession(sessionId: string) {
    if (sessions.value.some((s) => s.id === sessionId)) {
      activeSessionId.value = sessionId
    }
  }

  async function addMessageToActiveSession(
    message: Omit<ChatMessage, 'isLoading'>,
    isSave: boolean
  ) {
    if (!activeSession.value) return

    // 检查是否是第一条消息，如果是，先将会话保存到数据库
    const isFirstMessage = activeSession.value.messages.length === 0
    let sessionId = activeSession.value.id

    if (isFirstMessage) {
      try {
        // 在数据库中创建会话
        const apiSession = await chatApi.createChatSession({
          id: activeSession.value.id,
          name: activeSession.value.name,
          startTime: activeSession.value.startTime
        })
        sessionId = apiSession.id
        
        // 更新本地会话ID（如果数据库返回的ID不同）
        if (apiSession.id !== activeSession.value.id) {
          activeSession.value.id = apiSession.id
          // 更新sessions数组中的ID
          const sessionIndex = sessions.value.findIndex(s => s.id === activeSession.value?.id)
          if (sessionIndex !== -1) {
            sessions.value[sessionIndex].id = apiSession.id
          }
          activeSessionId.value = apiSession.id
        }
      } catch (error) {
        console.error('Failed to create new chat session in database:', error)
        throw error
      }
    }

    // If this is the first user message, update the session name
    if (activeSession.value.name === '新会话' && message.sender === 'user') {
      activeSession.value.name = message.text.substring(0, 30) // Use first 30 chars as name
      if (!isFirstMessage) {
        await chatApi.updateSessionName(sessionId, activeSession.value.name)
      }
    }

    activeSession.value.messages.push(message)

    if (isSave) {
      try {
        await chatApi.addMessageToSession({
          sessionId: sessionId,
          sender: message.sender,
          text: message.text,
          isLoading: false
        })
      } catch (error) {
        console.error('Failed to add message to database:', error)
      }
    }

    return activeSession.value.messages[activeSession.value.messages.length - 1]
  }

  async function deleteSession(sessionId: string) {
    try {
      // 检查会话是否存在于数据库中
      const session = sessions.value.find((s) => s.id === sessionId)
      if (session) {
        // 尝试从数据库中删除会话（如果存在）
        try {
          await chatApi.deleteChatSession(sessionId)
        } catch (error) {
          // 如果会话不在数据库中，忽略错误
          console.log('Session not found in database, might be a local-only session:', error)
        }
      }

      // 从本地状态中删除会话
      sessions.value = sessions.value.filter((s) => s.id !== sessionId)

      if (activeSessionId.value === sessionId) {
        if (sessions.value.length > 0) {
          setActiveSession(sessions.value[0].id)
        } else {
          await createNewSession()
        }
      }
    } catch (error) {
      console.error('Failed to delete chat session:', error)
      throw error
    }
  }

  function ThinkIngLoading(isLoading: boolean) {
    if (!activeSession.value) return
    if (isLoading) {
      activeSession.value.messages.push({ sender: 'ai' as const, text: '', isLoading: true })
    } else {
      activeSession.value.messages = activeSession.value.messages.filter(
        (item) => item.isLoading !== true
      )
    }
  }

  // Initial load
  init()

  return {
    sessions,
    activeSessionId,
    activeSession,
    sessionHistory,
    isLoading,
    init,
    createNewSession,
    setActiveSession,
    addMessageToActiveSession,
    deleteSession,
    ThinkIngLoading,
    _saveToDatabase
  }
})
