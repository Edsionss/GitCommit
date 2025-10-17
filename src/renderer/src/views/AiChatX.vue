<script setup lang="ts">
import type { ConversationsProps } from 'ant-design-x-vue'
import { useXAgent, useXChat } from 'ant-design-x-vue'
import { computed, ref, watch, onMounted } from 'vue'
import { theme } from 'ant-design-vue'
import { message as antMessage } from 'ant-design-vue'
import { useChatStore } from '@/stores/chatStore'
// import { chatApi } from '@api/chat'
import { useAi } from '@/composables/ai'
import {
  ConversationListComponent,
  MessageListComponent,
  SenderComponent,
  PromptsComponent,
  TopToolbarComponent
} from '@components/AiChatX'
import { storeToRefs } from 'pinia'

const { token } = theme.useToken()

// 只保留需要动态计算的样式
const dynamicStyles = computed(() => {
  return {
    layout: {
      borderRadius: `${token.value.borderRadius}px`,
      background: `${token.value.colorBgContainer}`,
      fontFamily: `AlibabaPuHuiTi, ${token.value.fontFamily}, sans-serif`
    },
    chat: {
      padding: `${token.value.paddingLG}px`
    },
    messagesContainer: {
      '&::-webkit-scrollbar-thumb': {
        'background-color': 'rgba(0, 0, 0, 0.2)',
        'border-radius': '3px'
      }
    }
  } as const
})

defineOptions({ name: 'PlaygroundIndependentSetup' })

// 使用 chatStore 管理会话历史
const chatStore = useChatStore()

// 使用 useAi composable
const { sendAiMessage, onChatStreamChunk, deleteConversation, renameConversation } = useAi()

// const sleep = () => new Promise((resolve) => setTimeout(resolve, 500))

// ==================== State ====================
const headerOpen = ref(false)
const content = ref('')
const agentRequestLoading = ref(false)
const attachedFiles = ref<any[]>([])

// 工具栏状态
const conversationListCollapsed = ref(false)
const streamingEnabled = ref(false)

// 当前使用的模型
const currentModel = ref('GPT-4')

// 计算属性：从 chatStore 获取会话列表并转换为 Conversations 组件需要的格式
const conversationsItems = computed(() => {
  return chatStore.sessionHistory.map((session) => ({
    key: session.id,
    label: session.name
  }))
})

// 当前活动会话ID
const activeKey = computed(() => chatStore.activeSessionId || '')

// 修改 XChat 的 request 函数，以便在接收到AI响应时保存到 chatStore
const [agent] = useXAgent<string, { message: string }, string>({
  request: async ({ message }, { onSuccess, onUpdate }) => {
    agentRequestLoading.value = true
    let history: Array<{ sender: 'user' | 'ai'; text: string }> = []

    try {
      if (chatStore.AiConfig?.enableStreaming) {
        onChatStreamChunk((chunk) => {
          onUpdate(chunk)
        })
      }
      sendAiMessage({
        prompt: message,
        history: history,
        successFn: (response) => {
          chatStore.addMessageToActiveSession({ sender: 'ai', text: response })
          onSuccess([response])
        },
        errorFn: (errorMessage) => {
          chatStore.addMessageToActiveSession({ sender: 'ai', text: `错误: ${errorMessage}` })
        },
        finallyFn: () => {
          chatStore.ThinkIngLoading(false)
        }
      })
    } catch (error) {
      console.error('Error in agent request:', error)
      chatStore.ThinkIngLoading(false)
      antMessage.error('发送消息失败')
    } finally {
      agentRequestLoading.value = false
    }
  }
})

// // 初始化时加载会话历史
// onMounted(() => {
//   // chatStore 的 init 方法已经在 store 中自动调用
//   // 这里可以添加额外的初始化逻辑
// })

const { onRequest, messages, setMessages } = useXChat({
  agent: agent.value
})

// 格式化消息以匹配 MessageListComponent 期望的类型
const formattedMessages = computed(() => {
  // 从 chatStore 获取当前活动会话的消息
  const activeSession = chatStore.activeSession
  if (!activeSession || !activeSession.messages) return []

  return activeSession.messages.map((msg, index) => ({
    id: `${activeSession.id}-${index}`, // 使用会话ID和消息索引作为唯一ID
    message: msg.text,
    status: msg.isLoading ? 'loading' : msg.sender === 'user' ? 'local' : 'ai'
  }))
})

// 监听活动会话变化，更新 XChat 的消息
watch(
  () => chatStore.activeSessionId,
  (newSessionId, oldSessionId) => {
    if (newSessionId && newSessionId !== oldSessionId) {
      // 当会话切换时，清空 XChat 的消息
      // 然后从 chatStore 加载新会话的消息
      const activeSession = chatStore.activeSession
      if (activeSession && activeSession.messages) {
        const xchatMessages = activeSession.messages.map((msg) => ({
          id: `temp-${Date.now()}-${Math.random()}`,
          message: msg.text,
          status: msg.isLoading ? 'loading' : msg.sender === 'user' ? 'local' : 'ai'
        }))
        // 将 chatStore 的消息转换为 XChat 格式
        setMessages(xchatMessages)
      } else {
        setMessages([])
      }
    }
  },
  { immediate: true }
)

// ==================== Event ====================
function onSubmit(nextContent: string) {
  if (!nextContent) return

  // 添加用户消息到 chatStore
  if (chatStore.activeSession) {
    chatStore.addMessageToActiveSession({
      sender: 'user',
      text: nextContent
    })

    // 添加AI思考中的状态
    chatStore.ThinkIngLoading(true)
  }

  // 发送消息到 XChat
  onRequest(nextContent)
  content.value = ''
}

function onPromptsItemClick(description: string) {
  // 添加提示词作为用户消息
  if (chatStore.activeSession) {
    chatStore.addMessageToActiveSession({
      sender: 'user',
      text: description
    })

    // 添加AI思考中的状态
    chatStore.ThinkIngLoading(true)
  }

  // 发送消息到 XChat
  onRequest(description)
}

async function onAddConversation() {
  try {
    // 使用 chatStore 创建新会话
    await chatStore.createNewSession()
  } catch (error) {
    console.error('Failed to create new conversation:', error)
    antMessage.error('创建新会话失败')
  }
}

const onConversationClick: ConversationsProps['onActiveChange'] = (key) => {
  // 使用 chatStore 设置活动会话
  chatStore.setActiveSession(key)
}

function handleFileChange(fileList: any[] | undefined) {
  attachedFiles.value = fileList || []
}

// 工具栏功能
function toggleConversationList() {
  conversationListCollapsed.value = !conversationListCollapsed.value
}

function toggleStreaming() {
  streamingEnabled.value = !streamingEnabled.value
}

function saveCurrentConversation() {
  // 使用 chatStore 保存当前会话
  chatStore._saveToDatabase()
  antMessage.success('会话保存成功！')
}

// ==================== Runtime ====================
</script>
<template>
  <div class="w-full min-w-[970px] h-full flex" :style="dynamicStyles.layout">
    <!-- 左侧会话列表 -->
    <ConversationListComponent
      v-if="!conversationListCollapsed"
      :conversations-items="conversationsItems"
      :active-key="activeKey"
      :model="currentModel"
      @add-conversation="onAddConversation"
      @conversation-click="onConversationClick"
      @delete-conversation="deleteConversation"
      @rename-conversation="renameConversation"
    />

    <!-- 右侧聊天内容区域 -->
    <div class="flex-1 h-full w-full flex flex-col">
      <!-- 顶部工具栏 -->
      <TopToolbarComponent
        :conversation-list-collapsed="conversationListCollapsed"
        :streaming-enabled="streamingEnabled"
        @toggle-conversation-list="toggleConversationList"
        @toggle-streaming="toggleStreaming"
        @save-current-conversation="saveCurrentConversation"
      />

      <!-- 聊天区域 -->
      <div
        class="flex-1 w-full max-w-[100%] box-border flex flex-col gap-4 h-[calc(100%-48px)] !mx-auto"
        :style="dynamicStyles.chat"
      >
        <!-- 消息列表容器，添加滚动功能 -->
        <div class="flex-1 overflow-auto scrollbar-thin" :style="dynamicStyles.messagesContainer">
          <MessageListComponent :messages="formattedMessages" />
        </div>

        <!-- 提示词 -->
        <PromptsComponent @prompts-item-click="onPromptsItemClick" />

        <!-- 输入框 -->
        <SenderComponent
          :content="content"
          :loading="agentRequestLoading"
          :header-open="headerOpen"
          :attached-files="attachedFiles"
          @submit="onSubmit"
          @change="(value) => (content = value)"
          @file-change="handleFileChange"
          @header-change="(open) => (headerOpen = open)"
        />
      </div>
    </div>
  </div>
</template>
