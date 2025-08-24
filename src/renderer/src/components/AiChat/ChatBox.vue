<template>
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
                item.sender === 'user' ? 'You' : appSettings?.ai?.model || 'AI Assistant'
              }}</span>
            </template>
            <template #description>
              <div class="message-content">
                <div v-if="item.isLoading">
                  <Loading></Loading>
                </div>
                <div
                  v-else-if="item.sender === 'ai'"
                  v-html="renderMarkdown(item.text)"
                  class="markdown-body"
                ></div>
                <div v-else v-html="renderMarkdown(item.text)" class="markdown-body"></div>
              </div>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>

    <a-list v-if="startSend" :data-source="[1]" item-layout="horizontal">
      <template #renderItem>
        <a-list-item class="chat-message ai">
          <a-list-item-meta>
            <template #avatar>
              <a-avatar>
                {{ 'AI' }}
              </a-avatar>
            </template>
            <template #title>
              <span>{{ appSettings?.ai?.model || 'AI Assistant' }}</span>
            </template>
            <template #description>
              <div class="message-content">
                <div
                  v-if="!!streamingMessage"
                  v-html="renderMarkdown(streamingMessage)"
                  class="markdown-body"
                ></div>
                <div v-else-if="isLoading">
                  <Loading></Loading>
                </div>
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
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { storeToRefs } from 'pinia'
import { marked } from 'marked'
import Loading from '@/components/Loading/index.vue'
import { message as antMessage } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useScanStore } from '@/stores/scanStore'
import { aiApi } from '@/api/ai'
import { useAi } from '@/composables/ai'

const route = useRoute()
const router = useRouter()

const renderer = new marked.Renderer()
renderer.link = ({ href, title, text }) => {
  // 如果 href 是空的，就当作“内部路由占位符”
  if (!href) {
    return `<a role="link" class="fake-link" data-router-link>${text}</a>`
  }
  return `<a href="${href}" target="_blank" rel="noopener">${text}</a>`
}

marked.setOptions({ renderer })

const props = defineProps<{
  isSidebarVisible: boolean
}>()

const chatHistoryRef = ref<HTMLElement | null>(null)
const borderStyle = computed(() => {
  if (!props.isSidebarVisible) {
    return {
      borderLeft: '1px solid var(--color-border)'
    }
  }
  return { borderLeft: 'none' }
})
const chatStore = useChatStore()
const { activeSession } = storeToRefs(chatStore)
const settingsStore = useSettingsStore()
const { appSettings } = storeToRefs(settingsStore)

const userInput = ref('')

const isLoading = ref(false)

const startSend = ref(false)

const streamingMessage = ref('')

const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    }
  })
}

watch(activeSession, () => scrollToBottom(), { deep: true, immediate: true })

const renderMarkdown = (text: string) => {
  if (!text) {
    return ''
  }
  return marked.parse(text, { gfm: true, breaks: true })
}

const sendMessage = async ({ input, userContent, success }: any) => {
  startSend.value = true
  let text = input?.trim() || userInput.value.trim()
  if (!text || isLoading.value) return
  userInput.value = ''
  const userMessage = { sender: 'user' as const, text: userContent || text }
  chatStore.addMessageToActiveSession(userMessage, appSettings.value.ai.enableAutoSave)
  // chatStore.ThinkIngLoading(true)
  isLoading.value = true
  const { sendAiMessage, onChatStreamChunk } = useAi()
  const aiConfig = appSettings.value.ai
  let history: Array<{ sender: 'user' | 'ai'; text: string }> = []
  if (aiConfig.enableAiHistory && activeSession.value) {
    // Exclude the last message, which is the one we are currently sending
    history = activeSession.value.messages.slice(0, -1).map((msg) => ({
      sender: msg.sender,
      text: msg.text
    }))
  }
  aiConfig.enableStreaming &&
    onChatStreamChunk((chunk) => {
      streamingMessage.value += chunk
      scrollToBottom()
    })
  // window.api.onChatStreamChunk((chunk) => {
  //   streamingMessage.value += chunk
  //   scrollToBottom()
  // })
  sendAiMessage({
    prompt: text,
    history: history,
    // config: appSettings.value.ai,
    // Stream: appSettings.value.ai.enableStreaming,
    successFn: (message) => {
      chatStore.addMessageToActiveSession({ sender: 'ai', text: message }, aiConfig.enableAutoSave)
      success && success(message)
      startSend.value = false
      streamingMessage.value = ''
      scrollToBottom()
    },
    errorFn: (errorMessage) => {
      chatStore.addMessageToActiveSession(
        { sender: 'ai', text: `错误: ${errorMessage}` },
        aiConfig.enableAutoSave
      )
    },
    finallyFn: () => {
      isLoading.value = false
      scrollToBottom()
    }
  })
}

const dataStore = useDataStore()
const scanStore = useScanStore()
function autoAnalysisScanRecord(id: string, record: any[]) {
  if (id && record && record.length) {
    chatStore.createNewSession()
    const resultInput = `
    请按照如下规则:
    1.根据这段提交记录的日期先得到其中的工作日 
    2.根据提交内容和提交代码行数以及提交信息进行综合分析 
    3.总结出与工作日相对应的人天信息，综合分配每个任务的人天 
    4.只需要50字}对这段git提交记录进行分析
    ${JSON.stringify(record)}
    `
    sendMessage({
      input: resultInput,
      userContent: '[提交记录分析]()',
      success: (result) => {
        scanStore.setScanRecordById(id, { analysisResult: result })
        antMessage.success('分析完成，结果已保存到扫描记录中')
      }
    })
  }
}
onMounted(() => {
  autoAnalysisScanRecord(dataStore.getScanId, dataStore.getScanResultList)
  dataStore.delScanResultList()
})
</script>

<style scoped>
.chat-history {
  flex-grow: 1;
  overflow-y: auto;
  padding: 14px;
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

:deep(.ant-list-item) {
  padding: 10px 0px;
  margin-bottom: 0px;
  border-bottom: none;
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

.chat-message.ai .message-content,
.chat-message.user .message-content {
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

:deep(.markdown-body li) {
  list-style-position: inside;
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
