import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import { chatApi } from '@api/chat'
import type { ChatMessage, ChatSession } from '@sharedType/ai'
import { useSettingsStore } from '@/stores/settingsStore'
import { storeToRefs } from 'pinia'

export const useChatStore = defineStore('chat', () => {
  const settingsStore = useSettingsStore()
  const { AiConfig } = storeToRefs(settingsStore)
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

  // 处理会话命名逻辑
  async function handleSessionNaming(
    session: ChatSession,
    userMessage: ChatMessage,
    isFirstMessage: boolean
  ): Promise<void> {
    // 仅在会话名为'新会话'且是用户发出的第一条消息时，才更新名称
    if (session.name === '新会话' && userMessage.sender === 'user' && isFirstMessage) {
      session.name = userMessage.text.substring(0, 30)
    }
  }

  //  在数据库中创建新会话
  async function createNewSessionInDb(session: ChatSession): Promise<string> {
    try {
      const apiSession = await chatApi.createChatSession({
        id: session.id,
        name: session.name,
        startTime: session.startTime
      })

      // 如果数据库返回了新的ID，需要同步更新所有相关的本地状态
      if (apiSession.id !== session.id) {
        const oldId = session.id
        session.id = apiSession.id
        activeSessionId.value = apiSession.id // 更新当前活跃的ID

        // 更新总会话列表中的对应项
        const sessionInList = sessions.value.find((s) => s.id === oldId)
        if (sessionInList) {
          sessionInList.id = apiSession.id
        }
      }
      return apiSession.id
    } catch (error) {
      console.error('Failed to create new chat session in database:', error)
      // 抛出错误，让上层调用者决定如何处理这个关键失败
      throw error
    }
  }

  //  保存单条消息到数据库
  async function saveMessageToDb(
    sessionId: string,
    message: Omit<ChatMessage, 'isLoading'>
  ): Promise<void> {
    try {
      await chatApi.addMessageToSession({
        sessionId,
        sender: message.sender,
        text: message.text,
        isLoading: false
      })
    } catch (error) {
      // 消息保存失败通常不应阻塞UI，只记录错误即可
      console.error('Failed to add message to database:', error)
    }
  }

  //
  async function addMessageToActiveSession(message: Omit<ChatMessage, 'isLoading'>) {
    const session = activeSession.value
    // 1. 卫语句：提前检查，让代码结构更扁平
    if (!session) {
      console.warn('No active session to add a message to.')
      return
    }

    // 4. 更新本地状态：这是核心目的，应尽快执行以响应UI
    session.messages.push(message)

    const isSaveEnabled = AiConfig.value?.enableAutoSave || false
    const isFirstMessage = session.messages.length === 0

    // 2. 职责分离：将会话命名、创建、消息保存的逻辑委托给辅助函数
    await handleSessionNaming(session, message, isFirstMessage)

    // 3. 关键路径的错误处理：如果会话创建失败，则不应继续
    if (isFirstMessage && isSaveEnabled) {
      try {
        // 创建会话是关键操作，失败则后续无意义
        await createNewSessionInDb(session)
      } catch (error) {
        // 可以在这里向用户显示错误提示
        // alert('创建会话失败，请检查网络并重试');
        return // 终止函数执行
      }
    }

    // 5. 非关键路径的异步操作：保存消息
    // 对于非首条消息，或者首条消息在会话创建成功后，都需要保存
    if (isSaveEnabled) {
      // 注意：这里我们不使用 await，让消息保存成为一个“即发即忘”的后台任务
      // 这可以防止UI因为等待网络请求而卡顿。如果保存成功与否很重要，则需要保留 await
      saveMessageToDb(session.id, message)
    }

    // 6. 修复原始逻辑中的小问题并返回
    // 修正：原代码更新会话名的API调用逻辑有误，已在 handleSessionNaming 中隐含修复
    // 如果需要在非首次消息时更新名称，逻辑应加回 handleSessionNaming

    // 返回刚刚添加的消息，方便链式调用或后续处理
    return session.messages[session.messages.length - 1]
  }

  // async function addMessageToActiveSession(
  //   message: Omit<ChatMessage, 'isLoading'>
  //   // isSave: boolean
  // ) {
  //   const isSave = AiConfig.value?.enableAutoSave || false
  //   if (!activeSession.value) return

  //   let sessionId = activeSession.value.id

  //   // 检查是否是第一条消息，如果是，先将会话保存到数据库
  //   const isFirstMessage = activeSession.value.messages.length === 0
  //   // If this is the first user message, update the session name
  //   if (activeSession.value.name === '新会话' && message.sender === 'user' && isFirstMessage) {
  //     activeSession.value.name = message.text.substring(0, 30) // Use first 30 chars as name
  //     if (!isFirstMessage) {
  //       await chatApi.updateSessionName(sessionId, activeSession.value.name)
  //     }
  //   }

  //   if (isFirstMessage && isSave) {
  //     try {
  //       // 在数据库中创建会话
  //       const apiSession = await chatApi.createChatSession({
  //         id: activeSession.value.id,
  //         name: activeSession.value.name,
  //         startTime: activeSession.value.startTime
  //       })
  //       sessionId = apiSession.id

  //       // 更新本地会话ID（如果数据库返回的ID不同）
  //       if (apiSession.id !== activeSession.value.id) {
  //         activeSession.value.id = apiSession.id
  //         // 更新sessions数组中的ID
  //         const sessionIndex = sessions.value.findIndex((s) => s.id === activeSession.value?.id)
  //         if (sessionIndex !== -1) {
  //           sessions.value[sessionIndex].id = apiSession.id
  //         }
  //         activeSessionId.value = apiSession.id
  //       }
  //     } catch (error) {
  //       console.error('Failed to create new chat session in database:', error)
  //       throw error
  //     }
  //   }

  //   activeSession.value.messages.push(message)

  //   if (isSave) {
  //     try {
  //       await chatApi.addMessageToSession({
  //         sessionId: sessionId,
  //         sender: message.sender,
  //         text: message.text,
  //         isLoading: false
  //       })
  //     } catch (error) {
  //       console.error('Failed to add message to database:', error)
  //     }
  //   }

  //   return activeSession.value.messages[activeSession.value.messages.length - 1]
  // }

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
    _saveToDatabase,
    AiConfig
  }
})
