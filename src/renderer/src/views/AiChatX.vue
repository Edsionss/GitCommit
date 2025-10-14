<script setup lang="ts">
import type { ConversationsProps } from 'ant-design-x-vue'
import { useXAgent, useXChat } from 'ant-design-x-vue'
import { computed, ref, watch } from 'vue'
import { theme } from 'ant-design-vue'
import {
  ConversationListComponent,
  MessageListComponent,
  SenderComponent,
  PromptsComponent
} from '@components/AiChatX'

const { token } = theme.useToken()

const styles = computed(() => {
  return {
    layout: {
      width: '100%',
      'min-width': '970px',
      height: '100%',
      'border-radius': `${token.value.borderRadius}px`,
      display: 'flex',
      background: `${token.value.colorBgContainer}`,
      'font-family': `AlibabaPuHuiTi, ${token.value.fontFamily}, sans-serif`
    },
    chat: {
      height: '100%',
      width: '100%',
      'max-width': '700px',
      margin: '0 auto',
      'box-sizing': 'border-box',
      display: 'flex',
      'flex-direction': 'column',
      padding: `${token.value.paddingLG}px`,
      gap: '16px'
    }
  } as const
})

defineOptions({ name: 'PlaygroundIndependentSetup' })

const sleep = () => new Promise((resolve) => setTimeout(resolve, 500))

const defaultConversationsItems = [
  {
    key: '0',
    label: 'What is Ant Design X?'
  }
]

// ==================== State ====================
const headerOpen = ref(false)
const content = ref('')
const conversationsItems = ref(defaultConversationsItems)
const activeKey = ref(defaultConversationsItems[0].key)
const agentRequestLoading = ref(false)
const attachedFiles = ref<any[]>([])

// ==================== Runtime ====================
const [agent] = useXAgent<string, { message: string }, string>({
  request: async ({ message }, { onSuccess }) => {
    agentRequestLoading.value = true
    await sleep()
    agentRequestLoading.value = false
    onSuccess([`Mock success return. You said: ${message}`])
  }
})

const { onRequest, messages, setMessages } = useXChat({
  agent: agent.value
})

// 格式化消息以匹配 MessageListComponent 期望的类型
const formattedMessages = computed(() => {
  return messages.value.map((msg) => ({
    id: typeof msg.id === 'string' ? msg.id : String(msg.id), // 确保id是字符串类型
    message: msg.message, // 使用 message 属性而不是 content
    status: msg.status || 'success' // 默认状态为 success
  }))
})

watch(
  activeKey,
  () => {
    if (activeKey.value !== undefined) {
      setMessages([])
    }
  },
  { immediate: true }
)

// ==================== Event ====================
function onSubmit(nextContent: string) {
  if (!nextContent) return
  onRequest(nextContent)
  content.value = ''
}

function onPromptsItemClick(description: string) {
  onRequest(description)
}

function onAddConversation() {
  conversationsItems.value = [
    ...conversationsItems.value,
    {
      key: `${conversationsItems.value.length}`,
      label: `New Conversation ${conversationsItems.value.length}`
    }
  ]
  activeKey.value = `${conversationsItems.value.length}`
}

const onConversationClick: ConversationsProps['onActiveChange'] = (key) => {
  activeKey.value = key
}

function handleFileChange(fileList: any[] | undefined) {
  attachedFiles.value = fileList || []
}

// ==================== Runtime ====================
</script>
<template>
  <div :style="styles.layout">
    <!-- 左侧会话列表 -->
    <ConversationListComponent
      :conversations-items="conversationsItems"
      :active-key="activeKey"
      @add-conversation="onAddConversation"
      @conversation-click="onConversationClick"
    />

    <!-- 右侧聊天区域 -->
    <div :style="styles.chat">
      <!-- 消息列表 -->
      <MessageListComponent :messages="formattedMessages" />

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
</template>
