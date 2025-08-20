<template>
  <div class="ai-chat-container">
    <div class="chat-history" ref="chatHistoryRef">
      <a-list :data-source="messages" item-layout="horizontal">
        <template #renderItem="{ item }">
          <a-list-item :class="['chat-message', item.sender]">
            <a-list-item-meta>
              <template #avatar>
                <a-avatar>
                  {{ item.sender === 'user' ? 'You' : 'AI' }}
                </a-avatar>
              </template>
              <template #title>
                <span>{{ item.sender === 'user' ? 'You' : 'AI Assistant' }}</span>
              </template>
              <template #description>
                <div class="message-content">
                  <div v-if="!item.isLoading">{{ item.text }}</div>
                  <a-spin v-else />
                </div>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </div>
    <div class="chat-input-area">
      <a-textarea
        v-model:value="userInput"
        placeholder="在这里输入您的问题..."
        :auto-size="{ maxRows: 6 }"
        @pressEnter="sendMessage"
      />
      <a-button
        type="primary"
        @click="sendMessage"
        :loading="isLoading"
        :disabled="!userInput.trim()"
      >
        发送
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import { useSettingsStore } from '@/stores/settingsStore'

interface Message {
  sender: 'user' | 'ai'
  text: string
  isLoading?: boolean
}

const userInput = ref('')
const isLoading = ref(false)
const messages = ref<Message[]>([])
const chatHistoryRef = ref<HTMLElement | null>(null)
const settingsStore = useSettingsStore()

const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    }
  })
}

onMounted(() => {
  messages.value.push({ sender: 'ai', text: '您好！有什么可以帮助您的吗？' })
})

const sendMessage = async () => {
  const text = userInput.value.trim()
  if (!text || isLoading.value) return

  // Add user message to history
  messages.value.push({ sender: 'user', text })
  userInput.value = ''
  scrollToBottom()

  // Add AI loading message
  messages.value.push({ sender: 'ai', text: '', isLoading: true })
  isLoading.value = true
  scrollToBottom()

  try {
    const appSettings = settingsStore.appSettings
    if (!appSettings) {
      throw new Error('AI settings not found. Please configure them first in the Settings page.')
    }
    const aiConfig = appSettings.ai

    if (!aiConfig || !aiConfig.provider || !aiConfig.apiKey) {
      throw new Error(
        'AI settings are incomplete. Please configure provider and API key in Settings.'
      )
    }

    const result = await window.api.aiChat(text, aiConfig)

    // Remove loading indicator
    messages.value.pop()

    if (result.success) {
      messages.value.push({ sender: 'ai', text: result.message })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
    antMessage.error(errorMessage)
    // Remove loading indicator on error
    messages.value.pop()
    messages.value.push({ sender: 'ai', text: `Error: ${errorMessage}` })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
:deep(.ant-list-item) {
  border-bottom: none;
}

.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  user-select: text;
}

.page-title {
  margin-bottom: 16px;
}

.chat-history {
  flex-grow: 1;
  overflow-y: auto;
  border-radius: 4px;
  margin-bottom: 16px;
  background-color: #fff;
  border-radius: 0.5rem;
}

.chat-message.user {
  text-align: right;
}

.chat-message.user .ant-list-item-meta {
  flex-direction: row-reverse;
  gap: 10px;
}

.chat-message.user .ant-list-item-meta-content {
  text-align: right;
}

.message-content {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 8px;
  background: #fff;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-message.user .message-content {
  background: #1890ff;
  color: #fff;
}

.chat-message.ai .message-content {
  background: var(--color-success);
  color: #fff;
}

.chat-input-area {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 10px;
}
</style>
