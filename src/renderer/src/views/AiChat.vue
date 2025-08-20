<template>
  <div class="ai-chat-page">
    <!-- Left Sidebar for Chat History -->
    <ChatHistorySidebar :is-visible="isSidebarVisible" />

    <!-- Main Chat Area -->
    <div class="main-chat-area">
      <!-- Top Toolbar -->
      <ChatToolbar
        @toggle-sidebar="isSidebarVisible = !isSidebarVisible"
        @save-session="saveCurrentSession"
      />

      <!-- Chat History -->
      <div class="chat-history" ref="chatHistoryRef" :style="borderStyle">
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
                  <span>{{
                    item.sender === 'user'
                      ? 'You'
                      : settingsStore?.appSettings?.ai?.model || 'AI Assistant'
                  }}</span>
                </template>
                <template #description>
                  <div class="message-content">
                    <div v-if="item.isLoading"><a-spin /></div>
                    <div
                      v-else-if="item.sender === 'ai'"
                      v-html="renderMarkdown(item.text)"
                      class="markdown-body"
                    ></div>
                    <div v-else>{{ item.text }}</div>
                  </div>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </div>

      <!-- Chat Input -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { marked } from 'marked'
import ChatHistorySidebar from '@/components/AiChat/ChatHistorySidebar.vue'
import ChatToolbar from '@/components/AiChat/ChatToolbar.vue'

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
const isSidebarVisible = ref(true)

const borderStyle = computed(() => {
  if (!isSidebarVisible.value) {
    return {
      borderLeft: '1px solid var(--color-border)'
    }
  }
  return { borderLeft: 'none' }
})

const renderMarkdown = (text: string) => {
  return marked.parse(text, { gfm: true, breaks: true })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    }
  })
}

const saveCurrentSession = () => {
  antMessage.info('功能开发中：保存当前会话')
  // Later, this will save the `messages` array to the chat store.
}

onMounted(() => {
  messages.value.push({ sender: 'ai', text: '您好！有什么可以帮助您的吗？' })
})

const sendMessage = async () => {
  const text = userInput.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({ sender: 'user', text })
  userInput.value = ''
  scrollToBottom()

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
.ai-chat-page {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 0.5rem;
}

.main-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Important for flex children */
}

.chat-history {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--color-background-soft);
  border-right: 1px solid var(--color-border);
}

.chat-message {
  margin-bottom: 16px;
}

.message-content {
  display: inline-block;
  padding: 10px 14px;
  border-radius: 8px;
  text-align: left;
  max-width: 100%;
}

.chat-message.user .message-content {
  background: #1890ff;
  color: #fff;
}

.chat-message.ai .message-content {
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.chat-input-area {
  padding: 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 8px;
  align-items: flex-end;
  background-color: var(--color-background);
}

/* Scoped styles for rendered markdown */
.markdown-body {
  white-space: normal;
  word-break: normal;
}

:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}

:deep(
  .markdown-body h1,
  .markdown-body h2,
  .markdown-body h3,
  .markdown-body h4,
  .markdown-body h5
) {
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
