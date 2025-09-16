<template>
  <div>
    <!-- 昵称输入模态框 -->
    <a-modal
      v-model:open="showNicknameModal"
      title="Enter Your Nickname"
      :closable="false"
      :maskClosable="false"
      @ok="handleSetNickname"
      :confirm-loading="isConnecting"
    >
      <a-input
        v-model:value="nickname"
        placeholder="Your nickname"
        @keyup.enter="handleSetNickname"
      />
    </a-modal>

    <!-- 主聊天容器 -->
    <div class="chat-container" v-if="!showNicknameModal">
      <div class="header">
        <a-typography-title :level="4" style="margin: 0"> Real-time Chat </a-typography-title>
        <a-tag :color="isConnected ? 'green' : 'red'">{{ connectionStatus }}</a-tag>
      </div>

      <!-- 消息列表 -->
      <a-list
        class="message-area"
        ref="messageListRef"
        :data-source="messages"
        item-layout="horizontal"
      >
        <template #renderItem="{ item }">
          <a-list-item class="message-item" :class="{ 'is-me': item.isMe }">
            <a-list-item-meta>
              <template #title>
                <span class="nickname">{{ item.nickname }}</span>
                <span class="timestamp">{{ new Date(item.timestamp).toLocaleTimeString() }}</span>
              </template>
              <template #avatar>
                <a-avatar>{{ item.nickname[0].toUpperCase() }}</a-avatar>
              </template>
              <template #description>
                <div class="message-text">{{ item.text }}</div>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>

      <!-- 输入区域 -->
      <div class="input-area">
        <a-input
          v-model:value="newMessage"
          size="large"
          placeholder="Type a message..."
          @keyup.enter="sendMessage"
          :disabled="!isConnected"
        />
        <a-button
          type="primary"
          size="large"
          @click="sendMessage"
          :disabled="!isConnected || !newMessage"
        >
          <template #icon><SendOutlined /></template>
          Send
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import type { ChatMessage } from '@sharedType/Chat'
import { SendOutlined } from '@ant-design/icons-vue'
import { webSocketApi } from '@api/webSocket'
import { nanoid } from 'nanoid'
// --- 状态 ---
const messages = ref<ChatMessage[]>([])
const newMessage = ref('')
const isConnected = ref(false)
const isConnecting = ref(false)
const connectionStatus = ref('Disconnected')
const messageListRef = ref<any>(null) // 用于引用 List 组件的 DOM
const showNicknameModal = ref(false)
const nickname = ref('')

let ws: WebSocket | null = null
let serverAddress = '' // 用于存储服务器地址
// --- 昵称处理 ---
const handleSetNickname = async () => {
  // if (nickname.value.trim()) {
  // 在连接前，先异步获取服务器地址
  if (!serverAddress) {
    serverAddress = await webSocketApi.getWsAddress()
    nickname.value = nanoid()
  }
  isConnecting.value = true
  connectWebSocket()
  // }
}
handleSetNickname()
// --- WebSocket 逻辑 ---
const connectWebSocket = () => {
  if (ws || !serverAddress) return

  console.log(`Connecting to WebSocket server at: ${serverAddress}`)
  ws = new WebSocket(serverAddress) // 使用动态获取的地址

  connectionStatus.value = 'Connecting...'

  ws.onopen = () => {
    isConnected.value = true
    isConnecting.value = false
    connectionStatus.value = 'Connected'
    // showNicknameModal.value = false // 连接成功后关闭模态框
  }

  ws.onmessage = (event) => {
    try {
      const message: ChatMessage = JSON.parse(event.data)
      messages.value.push(message)
      scrollToBottom()
    } catch (error) {
      console.error('Failed to parse message:', error)
    }
  }

  ws.onclose = () => {
    isConnected.value = false
    isConnecting.value = false
    connectionStatus.value = 'Disconnected. Retrying...'
    ws = null // 清理 ws 实例
    setTimeout(connectWebSocket, 3000)
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    isConnecting.value = false
    connectionStatus.value = 'Connection Error'
    ws?.close()
  }
}

// --- 发送消息 ---
const sendMessage = () => {
  if (newMessage.value.trim() && ws && isConnected.value) {
    const messagePayload = {
      text: newMessage.value,
      nickname: nickname.value
    }
    ws.send(JSON.stringify(messagePayload))
    newMessage.value = ''
  }
}

// --- 自动滚动 ---
const scrollToBottom = async () => {
  await nextTick()
  const listEl = document.querySelector('.message-area')
  if (listEl) {
    listEl.scrollTop = listEl.scrollHeight
  }
}

// --- 生命周期 ---
onUnmounted(() => {
  if (ws) {
    ws.onclose = null
    ws.close()
  }
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 500px;
  max-width: 700px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  margin: 20px auto;
  overflow: hidden;
  background: #f0f2f5;
}

.header {
  padding: 12px 24px;
  background-color: #ffffff;
  border-bottom: 1px solid #d9d9d9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.message-area {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.message-item {
  padding: 8px 0 !important;
  border: none !important;
}

.message-item .nickname {
  font-weight: bold;
  font-size: 14px;
}

.message-item .timestamp {
  font-size: 12px;
  color: #8c8c8c;
  margin-left: 8px;
}

.message-text {
  padding: 8px 12px;
  background: #fff;
  border-radius: 8px;
  display: inline-block;
  max-width: 100%;
  word-wrap: break-word;
}

/* 自己发送的消息样式 */
.message-item.is-me {
  text-align: right;
}

.message-item.is-me .ant-list-item-meta {
  flex-direction: row-reverse;
}

.message-item.is-me .ant-list-item-meta-content {
  text-align: right;
}

.message-item.is-me .nickname {
  display: none; /* 自己发的不显示昵称 */
}

.message-item.is-me .message-text {
  background: #1890ff;
  color: #fff;
}

.input-area {
  display: flex;
  padding: 12px 24px;
  border-top: 1px solid #d9d9d9;
  background-color: #ffffff;
  gap: 10px;
}
</style>
