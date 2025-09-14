import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export interface Message {
  sender: 'user' | 'ai'
  text: string
  isLoading?: boolean
}

export interface ChatSession {
  id: string
  name: string
  startTime: string
  messages: Message[]
}

const LOCAL_STORAGE_KEY = 'chat-sessions'

export const useChatStore = defineStore('chat', () => {
  // State
  const sessions = ref<ChatSession[]>([])
  const activeSessionId = ref<string | null>(null)

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
  function _saveToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions.value))
  }

  function init() {
    const savedSessions = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedSessions) {
      sessions.value = JSON.parse(savedSessions)
      if (sessions.value.length > 0) {
        // Make the most recent session active
        const sorted = [...sessions.value].sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )
        activeSessionId.value = sorted[0].id
      } else {
        createNewSession()
      }
    } else {
      createNewSession()
    }
  }

  function createNewSession() {
    const newSession: ChatSession = {
      id: uuidv4(),
      name: '新会话',
      startTime: new Date().toISOString(),
      messages: [{ sender: 'ai', text: '您好！有什么可以帮助您的吗？' }]
    }
    sessions.value.unshift(newSession) // Add to the beginning
    activeSessionId.value = newSession.id
    // _saveToLocalStorage()
    return newSession.id
  }

  function setActiveSession(sessionId: string) {
    if (sessions.value.some((s) => s.id === sessionId)) {
      activeSessionId.value = sessionId
    }
  }

  function addMessageToActiveSession(message: Omit<Message, 'isLoading'>, isSave: boolean) {
    if (!activeSession.value) return

    // If this is the first user message, update the session name
    if (activeSession.value.name === '新会话' && message.sender === 'user') {
      activeSession.value.name = message.text.substring(0, 30) // Use first 30 chars as name
    }
    activeSession.value.messages.push(message)
    isSave && _saveToLocalStorage()
    return activeSession.value.messages[activeSession.value.messages.length - 1]
  }

  function deleteSession(sessionId: string) {
    sessions.value = sessions.value.filter((s) => s.id !== sessionId)
    if (activeSessionId.value === sessionId) {
      if (sessions.value.length > 0) {
        setActiveSession(sessions.value[0].id)
      } else {
        createNewSession()
      }
    }
    _saveToLocalStorage()
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
    init,
    createNewSession,
    setActiveSession,
    addMessageToActiveSession,
    deleteSession,
    ThinkIngLoading,
    _saveToLocalStorage
  }
})
