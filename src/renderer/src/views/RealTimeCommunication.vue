<template>
  <div class="webSocket-container">
    <!-- 模式选择界面 -->
    <div v-if="!wsStore.modeSelected" class="mode-selection">
      <a-typography-title :level="3">选择聊天模式</a-typography-title>
      <a-space direction="vertical" :size="20">
        <a-button type="primary" size="large" @click="wsStore.startHosting"> 创建房间 (作为主机) </a-button>
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
      :confirm-loading="wsStore.isConnecting"
    >
      <a-input
        v-model:value="localInputToken"
        placeholder="向主机索要令牌"
        @keyup.enter="handleTokenSubmit"
      />
    </a-modal>

    <!-- 主聊天容器 -->
    <div class="chat-container" v-if="wsStore.modeSelected">
      <div class="header">
        <a-typography-title :level="4" style="margin: 0">
          局域网聊天室 - {{ wsStore.isHost ? '主机' : '客户端' }} ({{ wsStore.nickname }})
        </a-typography-title>
        <a-tag :color="wsStore.isConnected ? 'green' : 'red'">{{ wsStore.connectionStatus }}</a-tag>
      </div>

      <!-- 主机信息展示 -->
      <div v-if="wsStore.isHost && wsStore.roomToken" class="host-info">
        <a-collapse v-model:activeKey="activeKey" :bordered="false" expand-icon-position="right">
          <a-collapse-panel key="1">
            <template #header>
              <a-typography-text type="secondary">点击此处查看/隐藏房间信息</a-typography-text>
            </template>
            <a-typography-text strong>IP: {{ wsStore.hostIpForDisplay }}</a-typography-text>
            <br />
            <a-typography-text strong>令牌: {{ wsStore.roomToken }}</a-typography-text>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <!-- 消息列表 -->
      <a-list
        class="message-area"
        ref="messageListRef"
        :data-source="wsStore.messages"
        item-layout="horizontal"
      >
        <template #renderItem="{ item }">
          <!-- 令牌验证现在由store处理，这里只显示 -->
          <a-list-item
            v-if="item.token === (wsStore.isHost ? wsStore.roomToken : wsStore.inputToken)"
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
          @keyup.enter="handleSendMessage"
          :disabled="!wsStore.isConnected"
        />
        <a-button
          type="primary"
          size="large"
          @click="handleSendMessage"
          :disabled="!wsStore.isConnected || !newMessage"
        >
          <template #icon><SendOutlined /></template>
          发送
        </a-button>
      </div>

      <!-- 全局广播区域 (仅主机可见) -->
      <div v-if="wsStore.isHost" class="input-area global-broadcast">
        <a-input
          v-model:value="globalMessage"
          size="large"
          placeholder="输入全局广播..."
          @keyup.enter="handleSendGlobalBroadcast"
          :disabled="!wsStore.isConnected"
        />
        <a-button
          type="danger"
          size="large"
          @click="handleSendGlobalBroadcast"
          :disabled="!wsStore.isConnected || !globalMessage"
        >
          <template #icon><NotificationOutlined /></template>
          全局广播
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { SendOutlined, NotificationOutlined } from '@ant-design/icons-vue'
import { message as antMessage } from 'ant-design-vue'
import { networkApi } from '@renderer/api/network'
import { useWebSocketStore } from '@renderer/stores/webSocketStore'
import { storeToRefs } from 'pinia'

const wsStore = useWebSocketStore()
// 从 store 中解构 state 和 getters，同时保持响应性
const { modeSelected, isHost, nickname, isConnected, connectionStatus, roomToken, hostIpForDisplay, messages } = storeToRefs(wsStore)

// --- 本地状态 ---
const newMessage = ref('')
const globalMessage = ref('')
const hostIp = ref('')
const localInputToken = ref('')
const showTokenModal = ref(false)
const isScanning = ref(false)
const foundIps = ref<string[]>([])
const activeKey = ref(['1']) // 控制折叠面板

// --- 网络扫描 ---
const scanNetwork = async () => {
  isScanning.value = true
  foundIps.value = []
  antMessage.info('正在扫描局域网中的主机...')
  try {
    const result = await networkApi.scan(8888)
    if (result.success && result.ips) {
      foundIps.value = result.ips
      antMessage.success(`扫描完成！发现 ${result.ips.length} 个主机。`)
    } else {
      antMessage.warn('扫描完成，未发现任何主机。')
    }
  } catch (error) {
    antMessage.error(`扫描时发生错误: ${(error as Error).message}`)
  } finally {
    isScanning.value = false
  }
}

// --- 模式选择 ---
const showTokenEntry = () => {
  if (!hostIp.value.trim()) {
    antMessage.warn('请输入有效的主机IP地址。')
    return
  }
  showTokenModal.value = true
}

const handleTokenSubmit = () => {
  if (!localInputToken.value.trim()) {
    antMessage.warn('请输入房间令牌。')
    return
  }
  wsStore.joinRoom(hostIp.value, localInputToken.value)
  showTokenModal.value = false
}

// --- 消息发送 ---
const handleSendMessage = () => {
  wsStore.sendMessage(newMessage.value)
  newMessage.value = ''
}

const handleSendGlobalBroadcast = () => {
  wsStore.sendGlobalBroadcast(globalMessage.value)
  globalMessage.value = ''
}

// --- 生命周期 ---
onUnmounted(() => {
  // 页面卸载时断开连接，清理状态
  wsStore.disconnect()
})
</script>

<style scoped>
.webSocket-container {
  height: calc(100% - 40px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-background);
  color: var(--color-text);
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
  color: var(--color-text);
}

.found-ips-list .ant-list-item a:hover {
  background-color: var(--color-background-mute);
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin: 20px auto;
  overflow: hidden;
  background-color: var(--color-background-soft);
}

.header {
  padding: 12px 24px;
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.host-info {
  padding: 10px 24px;
  background-color: var(--color-background);
}

/* Collapse panel theming */
.host-info :deep(.ant-collapse) {
  background-color: transparent;
  border: none;
}
.host-info :deep(.ant-collapse-item) {
  background-color: var(--color-background-mute) !important;
  border: 1px solid var(--color-primary) !important;
  border-radius: 4px !important;
}
.host-info :deep(.ant-collapse-header) {
  color: var(--color-text-light);
}
.host-info :deep(.ant-collapse-content) {
  background-color: transparent !important;
  color: var(--color-text);
  border-top: 1px solid var(--color-primary) !important;
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
  color: var(--color-heading);
}

.message-item .timestamp {
  font-size: 12px;
  color: var(--color-text-light);
  margin-left: 8px;
}

.message-text {
  padding: 8px 12px;
  background: var(--color-background);
  border-radius: 8px;
  display: inline-block;
  max-width: 100%;
  word-wrap: break-word;
  color: var(--color-text);
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
  background: var(--color-primary);
  color: #fff;
}

.input-area {
  display: flex;
  padding: 12px 24px;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-background);
  gap: 10px;
}

.global-broadcast {
  border-top: 1px dashed var(--color-border);
}
</style>
