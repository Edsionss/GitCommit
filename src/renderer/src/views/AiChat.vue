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
                  <div v-if="item.isLoading"><a-spin /></div>
                  <div v-else-if="item.sender === 'ai'" v-html="renderMarkdown(item.text)" class="markdown-body"></div>
                  <div v-else>{{ item.text }}</div>
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
import { marked } from 'marked'

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

const renderMarkdown = (text: string) => {
  return marked.parse(text, { gfm: true, breaks: true });
}

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
    if (!appSettings || !appSettings.ai) {
      throw new Error('请在设置页面中配置AI设置。')
    }
    
    const aiConfig = appSettings.ai

    if (!aiConfig.provider || !aiConfig.apiKey) {
      throw new Error('请设置AI源和API密钥')
    }

    const plainAiConfig = JSON.parse(JSON.stringify(aiConfig))

    const result = await window.api.aiChat(text, plainAiConfig)

    messages.value.pop()

    if (result.success) {
      messages.value.push({ sender: 'ai', text: result.message })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
    antMessage.error(errorMessage)
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage?.isLoading) {
      messages.value.pop()
    }
    messages.value.push({ sender: 'ai', text: `错误: ${errorMessage}` })
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

.chat-history {
  flex-grow: 1;
  overflow-y: auto;
  border-radius: 4px;
  margin-bottom: 16px;
  background-color: #fff;
  border-radius: 0.5rem;
  padding: 10px;
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
  max-width: 100%;
}

.chat-message.user .message-content {
  background: #1890ff;
  color: #fff;
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-message.ai .message-content {
  background: var(--color-background-soft);
  color: var(--color-text);
}

.chat-input-area {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 10px;
}

/* Scoped styles for rendered markdown */
.markdown-body {
  white-space: normal;
  word-break: normal;
}

:deep(.markdown-body p) {
  margin-bottom: 1em;
}

:deep(.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5) {
  margin-top: 1.5em;
  margin-bottom: 1em;
  font-weight: 600;
}

:deep(.markdown-body ul, .markdown-body ol) {
  padding-left: 2em;
  margin-bottom: 1em;
}

:deep(.markdown-body pre) {
  background-color: #2d2d2d;
  color: #f8f8f2;
  padding: 1em;
  border-radius: 6px;
  margin-bottom: 1em;
  overflow-x: auto;
}

:deep(.markdown-body code) {
  background-color: #2d2d2d;
  color: #f8f8f2;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
}

:deep(.markdown-body pre code) {
  padding: 0;
  background-color: transparent;
}

:deep(.markdown-body blockquote) {
  border-left: 4px solid #ccc;
  padding-left: 1em;
  margin-left: 0;
  color: #666;
}

:deep(.markdown-body table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

:deep(.markdown-body th, .markdown-body td) {
  border: 1px solid #ddd;
  padding: 8px;
}

:deep(.markdown-body th) {
  background-color: #f2f2f2;
}
</style>
