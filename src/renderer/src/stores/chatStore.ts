import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import { chatApi } from '@api/chat'
import type { ChatMessage, ChatSession } from '@sharedType/ai'
import { useSettingsStore } from '@/stores/settingsStore'
import { storeToRefs } from 'pinia'

export const useChatStore = defineStore('chat', () => {
  const settingsStore = useSettingsStore()
  const chatModel = ref<string | null>('fc')
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

  // Actions 保存到数据
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

  //  向当前活动会话添加一条消息并且保存到数据库
  async function addMessageToActiveSession(
    message: Omit<ChatMessage, 'isLoading'>,
    updateLocal = true
  ) {
    const session = activeSession.value
    // 1. 卫语句：提前检查，让代码结构更扁平
    if (!session) {
      console.warn('No active session to add a message to.')
      return
    }

    // 4. 更新本地状态：这是核心目的，应尽快执行以响应UI （仅当updateLocal为true时）
    updateLocal && session.messages.push(message)

    const isSaveEnabled = AiConfig.value?.enableAutoSave || false
    const isFirstMessage = session.messages.length === 1

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

  // 从数据库中删除会话
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

  // 设置当前会话的思考状态
  /**
   * 1. 开始AI思考，向消息列表添加一个加载占位符
   */
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
  function getLastMessage() {
    if (!activeSession.value) return
    return activeSession.value.messages.at(-1)
  }
  /**
   * 2. (核心) 接收流式数据块，并追加到加载中的消息上
   */
  function appendStreamChunk(chunk: string) {
    if (!activeSession.value) return
    const lastMessage = getLastMessage()
    ThinkIngLoading(false)
    if (lastMessage && !lastMessage.streaming) {
      activeSession.value.messages.push({
        sender: 'ai',
        text: chunk,
        streaming: true
      })
    } else if (lastMessage && lastMessage.streaming) {
      lastMessage.text += chunk
    }
  }

  /**
   * 3. 流式传输结束，将最后一条消息标记为完成
   * @param finalResponse 可选，如果API在最后会返回完整消息，可用它来覆盖，保证数据一致性
   */
  function finalizeStream(finalResponse?: string) {
    const lastMessage = getLastMessage()
    if (lastMessage && lastMessage.streaming) {
      if (finalResponse) {
        lastMessage.text = finalResponse // 用最终完整数据覆盖，防止丢块
      }
      lastMessage.streaming = false
      addMessageToActiveSession(lastMessage, false)
    }
  }

  /**
   * 处理错误情况
   */
  function handleStreamError(errorMessage: string) {
    const lastMessage = getLastMessage()
    if (lastMessage && lastMessage.streaming) {
      lastMessage.text = errorMessage // 在占位符上显示错误
      addMessageToActiveSession({ sender: 'ai', text: errorMessage }, false)
    } else {
      // 如果没有加载占位符，就新增一条错误消息
      addMessageToActiveSession({ sender: 'ai', text: errorMessage })
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
    handleStreamError,
    appendStreamChunk,
    finalizeStream,
    _saveToDatabase,
    AiConfig,
    chatModel
  }
})
