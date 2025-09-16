<template>
  <div class="webSocket-container">
    <!-- 模式选择界面 -->
    <div v-if="!modeSelected" class="mode-selection">
      <a-typography-title :level="3">选择聊天模式</a-typography-title>
      <a-space direction="vertical" :size="20">
        <a-button type="primary" size="large" @click="startHosting"> 创建房间 (作为主机) </a-button>
        <a-divider>或</a-divider>
        <div class="join-section">
          <a-input v-model:value="hostIp" placeholder="输入主机的IP地址" size="large" />
          <a-button size="large" @click="joinRoom" :disabled="!hostIp"> 加入房间 </a-button>
        </div>
      </a-space>
    </div>

    <!-- 昵称输入模态框 -->
    <a-modal
      v-model:open="showNicknameModal"
      title="输入你的昵称"
      :closable="false"
      :maskClosable="false"
      @ok="handleSetNickname"
      :confirm-loading="isConnecting"
    >
      <a-input
        v-model:value="nickname"
        placeholder="你的昵称"
        @keyup.enter="handleSetNickname"
      />
    </a-modal>

    <!-- 主聊天容器 -->
    <div class="chat-container" v-if="modeSelected && !showNicknameModal">
      <div class="header">
        <a-typography-title :level="4" style="margin: 0">
          局域网聊天室 - {{ isHost ? '主机' : '客户端' }}
        </a-typography-title>
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
          placeholder="输入消息..."
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
          发送
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
import { message as antMessage } from 'ant-design-vue'

// --- 状态 ---
const messages = ref<ChatMessage[]>([])
const newMessage = ref('')
const isConnected = ref(false)
const isConnecting = ref(false)
const connectionStatus = ref('未连接')
const messageListRef = ref<any>(null)
const showNicknameModal = ref(false)
const nickname = ref('')

// --- 新增：模式选择状态 ---
const modeSelected = ref(false) // 是否已选择模式
const isHost = ref(false) // 是否为主机
const hostIp = ref('') // 要加入的主机IP

let ws: WebSocket | null = null
let serverAddress = '' // 最终用于连接的服务器地址

// --- 模式选择逻辑 ---
const startHosting = async () => {
  try {
    // 1. 通知主进程启动 WebSocket 服务器
    await webSocketApi.startWsServer()
    // 2. 获取本机IP作为服务器地址
    serverAddress = await webSocketApi.getWsAddress()
    if (!serverAddress || serverAddress.includes('localhost')) {
      antMessage.error('无法获取有效的局域网IP地址，无法作为主机。')
      return
    }
    antMessage.success(`主机已在 ${serverAddress} 启动！请让其他人加入此地址。`)
    isHost.value = true
    modeSelected.value = true
    showNicknameModal.value = true // 显示昵称输入框
  } catch (error) {
    console.error('启动主机失败:', error)
    antMessage.error('启动主机失败，请查看控制台日志。')
  }
}

const joinRoom = () => {
  if (!hostIp.value.trim()) {
    antMessage.warn('请输入有效的主机IP地址。')
    return
  }
  // 假设端口固定为 8888
  serverAddress = `ws://${hostIp.value.trim()}:8888`
  modeSelected.value = true
  showNicknameModal.value = true // 显示昵称输入框
}

// --- 昵称处理 ---
const handleSetNickname = () => {
  if (nickname.value.trim()) {
    isConnecting.value = true
    connectWebSocket()
  } else {
    antMessage.warn('请输入一个昵称。')
  }
}

// --- WebSocket 逻辑 ---
const connectWebSocket = () => {
  if (ws || !serverAddress) return

  console.log(`正在连接到 WebSocket 服务器: ${serverAddress}`)
  ws = new WebSocket(serverAddress)

  connectionStatus.value = '正在连接...'

  ws.onopen = () => {
    isConnected.value = true
    isConnecting.value = false
    connectionStatus.value = '已连接'
    showNicknameModal.value = false // 连接成功后关闭模态框
  }

  ws.onmessage = (event) => {
    try {
      const message: ChatMessage = JSON.parse(event.data)
      messages.value.push(message)
      scrollToBottom()
    } catch (error) {
      console.error('解析消息失败:', error)
    }
  }

  ws.onclose = () => {
    isConnected.value = false
    isConnecting.value = false
    connectionStatus.value = '已断开. 正在重试...'
    ws = null
    // 如果不是主机，才进行重连尝试
    if (!isHost.value) {
      setTimeout(connectWebSocket, 3000)
    } else {
      connectionStatus.value = '主机服务器已关闭'
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket 错误:', error)
    isConnecting.value = false
    connectionStatus.value = '连接错误'
    antMessage.error(`无法连接到 ${serverAddress}，请检查地址是否正确或主机是否在线。`)
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
  // 注意：这里没有停止WebSocket服务器的逻辑，
  // 服务器会随应用的关闭而关闭。
})
</script>

<style scoped>
.webSocket-container {
  height: calc(100% - 40px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.mode-selection {
  text-align: center;
}

.join-section {
  display: flex;
  gap: 10px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
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