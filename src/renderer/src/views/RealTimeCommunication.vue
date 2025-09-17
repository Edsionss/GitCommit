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
          <a-button size="large" @click="showTokenEntry" :disabled="!hostIp"> 加入房间 </a-button>
          <a-button size="large" @click="scanNetwork" :loading="isScanning"> 扫描网络 </a-button>
        </div>
        <div v-if="foundIps.length > 0" class="found-ips-list">
          <a-typography-text>发现的主机:</a-typography-text>
          <a-list :data-source="foundIps" size="small" bordered>
            <template #renderItem="{ item }">
              <a-list-item>
                <a @click="hostIp = item">{{ item }}</a>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </a-space>
    </div>

    <!-- 令牌输入模态框 -->
    <a-modal
      v-model:open="showTokenModal"
      title="输入房间令牌"
      :closable="false"
      :maskClosable="false"
      @ok="handleTokenSubmit"
      :confirm-loading="isConnecting"
    >
      <a-input
        v-model:value="inputToken"
        placeholder="向主机索要令牌"
        @keyup.enter="handleTokenSubmit"
      />
    </a-modal>

    <!-- 主聊天容器 -->
    <div class="chat-container" v-if="modeSelected">
      <div class="header">
        <a-typography-title :level="4" style="margin: 0">
          局域网聊天室 - {{ isHost ? '主机' : '客户端' }} ({{ nickname }})
        </a-typography-title>
        <a-tag :color="isConnected ? 'green' : 'red'">{{ connectionStatus }}</a-tag>
      </div>

      <!-- 主机信息展示 -->
      <div v-if="isHost && roomToken" class="host-info">
        <a-collapse v-model:activeKey="activeKey" :bordered="false" expand-icon-position="right">
          <a-collapse-panel key="1" style="background: #e6f7ff; border: 1px solid #91d5ff">
            <template #header>
              <a-typography-text type="secondary">点击此处查看/隐藏房间信息</a-typography-text>
            </template>
            <a-typography-text strong>IP: {{ hostIpForDisplay }}</a-typography-text>
            <br />
            <a-typography-text strong>令牌: {{ roomToken }}</a-typography-text>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <!-- 消息列表 -->
      <a-list
        class="message-area"
        ref="messageListRef"
        :data-source="messages"
        item-layout="horizontal"
      >
        <template #renderItem="{ item }">
          <!-- 简单的令牌验证：只显示令牌匹配的消息 -->
          <a-list-item
            v-if="item.token === (isHost ? roomToken : inputToken)"
            class="message-item"
            :class="{ 'is-me': item.isMe }"
          >
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
import { nanoid } from 'nanoid'
import { networkApi } from '@renderer/api/network'

// --- 状态 ---
const messages = ref<ChatMessage[]>([])
const newMessage = ref('')
const isConnected = ref(false)
const isConnecting = ref(false)
const connectionStatus = ref('未连接')
const messageListRef = ref<any>(null)
const nickname = ref('')

// --- 模式选择状态 ---
const modeSelected = ref(false)
const isHost = ref(false)
const hostIp = ref('')
const hostIpForDisplay = ref('')

// --- 令牌相关状态 ---
const roomToken = ref('') // 主机生成的令牌
const showTokenModal = ref(false) // 是否显示令牌输入框
const inputToken = ref('') // 客户端输入的令牌
const activeKey = ref(['1']) // 控制折叠面板的展开，默认展开

// --- 扫描相关状态 ---
const isScanning = ref(false)
const foundIps = ref<string[]>([])

let ws: WebSocket | null = null
let serverAddress = ''

// --- 网络扫描逻辑 ---
const scanNetwork = async () => {
  isScanning.value = true
  foundIps.value = []
  antMessage.info('正在扫描局域网中的主机...')
  try {
    const result = await networkApi.scan(8888)
    if (result.success && result.ips) {
      foundIps.value = result.ips
      if (result.ips.length > 0) {
        antMessage.success(`扫描完成！发现 ${result.ips.length} 个主机。`)
      } else {
        antMessage.warn('扫描完成，未发现任何主机。')
      }
    } else {
      antMessage.error(`扫描失败: ${result.error}`)
    }
  } catch (error) {
    antMessage.error(`扫描时发生错误: ${(error as Error).message}`)
  } finally {
    isScanning.value = false
  }
}

// --- 模式选择逻辑 ---
const startHosting = async () => {
  try {
    await webSocketApi.startWsServer()
    serverAddress = await webSocketApi.getWsAddress()

    if (!serverAddress || serverAddress.includes('localhost')) {
      antMessage.error('无法获取有效的局域网IP地址，无法作为主机。')
      return
    }

    hostIpForDisplay.value = serverAddress.replace('ws://', '').split(':')[0]
    antMessage.success(`主机已在 ${serverAddress} 启动！`)

    isHost.value = true
    modeSelected.value = true
    roomToken.value = nanoid(8) // 生成8位随机令牌
    nickname.value = `主机-${nanoid(6)}` // 自动生成昵称
    console.log(`[主机启动] IP: ${hostIpForDisplay.value}, 令牌: ${roomToken.value}`)

    connectWebSocket()
  } catch (error) {
    console.error('启动主机失败:', error)
    antMessage.error('启动主机失败，请查看控制台日志。')
  }
}

const showTokenEntry = () => {
  if (!hostIp.value.trim()) {
    antMessage.warn('请输入有效的主机IP地址。')
    return
  }
  showTokenModal.value = true
}

const handleTokenSubmit = () => {
  if (!inputToken.value.trim()) {
    antMessage.warn('请输入房间令牌。')
    return
  }
  serverAddress = `ws://${hostIp.value.trim()}:8888`
  nickname.value = `访客-${nanoid(6)}` // 自动生成昵称
  console.log(`[加入房间] 准备连接到 ${serverAddress}，使用令牌: ${inputToken.value}`)
  isConnecting.value = true
  connectWebSocket()
}

// --- WebSocket 逻辑 ---
const connectWebSocket = () => {
  if (ws || !serverAddress) return

  console.log(`正在连接到 WebSocket 服务器: ${serverAddress}`)
  ws = new WebSocket(serverAddress)
  connectionStatus.value = '正在连接...'

  ws.onopen = () => {
    console.log(`[WebSocket] 连接成功: ${serverAddress}`)
    isConnected.value = true
    isConnecting.value = false
    connectionStatus.value = '已连接'
    showTokenModal.value = false // 如果是从令牌框连接的，则关闭它
    modeSelected.value = true // 确认进入聊天界面
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

  ws.onclose = (event) => {
    console.log(`[WebSocket] 连接关闭`, event)
    console.log(`[WebSocket] 关闭代码: ${event.code}, 原因: ${event.reason}`)
    isConnected.value = false
    isConnecting.value = false
    connectionStatus.value = '已断开. 正在重试...'
    ws = null
    if (!isHost.value) {
      setTimeout(connectWebSocket, 3000)
    } else {
      connectionStatus.value = '主机服务器已关闭'
    }
  }

  ws.onerror = (error) => {
    console.error('[WebSocket] 发生错误:', error)
    isConnecting.value = false
    connectionStatus.value = '连接错误'
    antMessage.error(`无法连接到 ${serverAddress}，请检查地址和令牌是否正确。`)
    ws?.close()
  }
}

// --- 发送消息 ---
const sendMessage = () => {
  if (newMessage.value.trim() && ws && isConnected.value) {
    const messagePayload = {
      text: newMessage.value,
      nickname: nickname.value,
      token: isHost.value ? roomToken.value : inputToken.value
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
  align-items: center; /* 垂直居中对齐 */
}

.found-ips-list {
  height: 300px;
  overflow-y: auto;
  margin: 20px;
  width: 100%;
}

.found-ips-list .ant-list-item a {
  width: 100%;
  display: block;
  padding: 4px 8px;
  border-radius: 4px;
}

.found-ips-list .ant-list-item a:hover {
  background-color: #e6f7ff;
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

.host-info {
  padding: 10px 24px;
  background-color: #ffffff;
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
