<template>
  <div class="chat-container">
    <div class="header">
      <a-typography-title :level="4" style="margin: 0">
        局域网聊天室 - {{ isHost ? '主机' : '客户端' }} ({{ nickname }})
      </a-typography-title>
      <a-tag :color="isConnected ? 'green' : 'red'">{{ connectionStatus }}</a-tag>
    </div>

    <div v-if="isHost && roomToken" class="host-info">
      <a-collapse v-model:activeKey="activeKey" :bordered="false" expand-icon-position="right">
        <a-collapse-panel key="1">
          <template #header>
            <a-typography-text type="secondary">点击此处查看/隐藏房间信息</a-typography-text>
          </template>
          <a-typography-text strong>IP: {{ hostIpForDisplay }}</a-typography-text>
          <br />
          <a-typography-text strong>令牌: {{ roomToken }}</a-typography-text>
        </a-collapse-panel>
      </a-collapse>
    </div>

    <a-list class="message-area" :data-source="messages" item-layout="horizontal">
      <template #renderItem="{ item }">
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

    <div class="input-area">
      <a-input
        v-model:value="newMessage"
        size="large"
        placeholder="输入消息..."
        @keyup.enter="sendMessage"
        :disabled="!isConnected"
      />
      <a-dropdown-button
        type="primary"
        size="large"
        @click="sendMessage"
        :disabled="!isConnected || !newMessage"
      >
        <template #icon><SendOutlined /></template>
        发送
        <template #overlay v-if="isHost">
          <a-menu @click="handleMenuClick">
            <a-menu-item key="roomBroadcast">
              <template #icon><NotificationOutlined /></template>
              房间广播
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { SendOutlined, NotificationOutlined } from '@ant-design/icons-vue'
import type { ChatMessage } from '@sharedType/Chat'

const props = defineProps<{
  messages: ChatMessage[]
  isHost: boolean
  isConnected: boolean
  nickname: string
  connectionStatus: string
  roomToken: string
  inputToken: string
  hostIpForDisplay: string
}>()

const emit = defineEmits(['send-message', 'send-room-broadcast'])

const newMessage = ref('')
const activeKey = ref(['1'])

const sendMessage = () => {
  emit('send-message', newMessage.value)
  newMessage.value = ''
}

const handleMenuClick = ({ key }: { key: string }) => {
  if (key === 'roomBroadcast') {
    emit('send-room-broadcast', newMessage.value)
    newMessage.value = ''
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 8px;
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
  display: none;
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
</style>
