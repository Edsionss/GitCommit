<template>
  <div class="ai-chat-page">
    <ChatHistorySidebar
      :is-visible="isSidebarVisible"
      @select-session="setActiveSession"
      @new-session="createNewSession"
      @delete-session="deleteSession"
    />

    <div class="main-chat-area">
      <ChatToolbar
        @toggle-sidebar="isSidebarVisible = !isSidebarVisible"
        @save-session="saveCurrentSession"
      />

      <div class="chat-history" ref="chatHistoryRef" :style="borderStyle">
        <a-list v-if="activeSession" :data-source="activeSession.messages" item-layout="horizontal">
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
        <!-- <div v-if="isLoading" class="loading-spinner">
          <a-spin tip="AI 正在思考中..."></a-spin>
        </div> -->
      </div>

      <div class="chat-input-area">
        <a-textarea
          v-model:value="userInput"
          placeholder="在这里输入您的问题..."
          :auto-size="{ maxRows: 6 }"
          @pressEnter="sendMessage"
          :disabled="isLoading"
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
import { ref, nextTick, watch, computed } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'
import { marked } from 'marked'
import ChatHistorySidebar from '@/components/AiChat/ChatHistorySidebar.vue'
import ChatToolbar from '@/components/AiChat/ChatToolbar.vue'

const userInput = ref('')
const isLoading = ref(false)
const chatHistoryRef = ref<HTMLElement | null>(null)

const settingsStore = useSettingsStore()
const chatStore = useChatStore()
const { activeSession } = storeToRefs(chatStore)

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

watch(activeSession, () => scrollToBottom(), { deep: true, immediate: true })

const saveCurrentSession = () => {
  // The store saves automatically, so this is just for user feedback.
  antMessage.success('会话保存成功！')
}

const setActiveSession = (sessionId: string) => {
  chatStore.setActiveSession(sessionId)
}

const createNewSession = () => {
  chatStore.createNewSession()
}

const deleteSession = (sessionId: string) => {
  chatStore.deleteSession(sessionId)
}

const sendMessage = async () => {
  const text = userInput.value.trim()
  if (!text || isLoading.value) return

  const userMessage = { sender: 'user' as const, text }
  userInput.value = ''
  chatStore.addMessageToActiveSession(userMessage)
  scrollToBottom()
  isLoading.value = true

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

    if (result.success) {
      chatStore.addMessageToActiveSession({ sender: 'ai', text: result.message })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
    antMessage.error(errorMessage)
    chatStore.addMessageToActiveSession({ sender: 'ai', text: `错误: ${errorMessage}` })
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
  position: relative;
  user-select: text;
}

.loading-spinner {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.chat-message {
  display: flex;
  width: 100%;
  margin-bottom: 16px;
}

.chat-message.user {
  justify-content: flex-end;
}

/* Reverse avatar and content for user messages */
:deep(.chat-message.user .ant-list-item-meta) {
  flex-direction: row-reverse;
}

:deep(.chat-message.user .ant-list-item-meta-content) {
  text-align: right;
}

:deep(.chat-message.user .ant-list-item-meta-avatar) {
  margin-left: 16px;
  margin-right: 0;
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
  background: #fff;
  color: var(--color-text);
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
  /* background-color: #2d2d2d; */
  /* color: #f8f8f2; */
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
