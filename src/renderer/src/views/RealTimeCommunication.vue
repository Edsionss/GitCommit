<template>
  <div class="webSocket-container">
    <div class="chat-container" :style="{ width: collapsed ? '100%' : '100% ' }">
      <div class="chat-room" v-if="wsStore.modeSelected">
        <ChatWindow
          :messages="wsStore.messages"
          :is-host="wsStore.isHost"
          :is-connected="wsStore.isConnected"
          :nickname="wsStore.nickname"
          :connection-status="wsStore.connectionStatus"
          :room-token="wsStore.roomToken"
          :input-token="wsStore.inputToken"
          :host-ip-for-display="wsStore.hostIpForDisplay"
          @send-message="wsStore.sendMessage"
          @send-broadcast="handleSendDirectBroadcast"
        />
      </div>
      <div v-else class="direct-container">
        <h3>Welcome to the WebSocket Chat</h3>
        <a-empty :description="null" />
        <span>请使用左侧的“网络工具”创建或加入一个房间。</span>
        <div class="direct-content">
          <a-textarea v-model:value="directMessage" allow-clear />
          <a-button
            style="width: 100%"
            type="primary"
            size="large"
            @click="handleSendDirectBroadcast"
            :disabled="!directMessage || !WebSocketIps.length"
          >
            <template #icon><NotificationOutlined /></template>
            发送广播
          </a-button>
        </div>
      </div>
    </div>
    <div class="network-tool-container" v-if="collapsed">
      <NetWorkTool v-model="selectedIps" @foundIps="getAllIps"></NetWorkTool>
    </div>

    <a-float-button
      class="back-button"
      type="primary"
      @click="collapsed = !collapsed"
      :style="{
        right: '34px'
      }"
    >
      <template #icon>
        <UnorderedListOutlined />
      </template>
    </a-float-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import { webSocketApi } from '@api/webSocket'
import { useWebSocketStore } from '@/stores/webSocketStore'
import { UnorderedListOutlined, SendOutlined, NotificationOutlined } from '@ant-design/icons-vue'
import { copyNormalize } from '@utils/index'

// Import child components
import NetWorkTool from '@components/RealTimeCommunication/NetWorkTool.vue'
import ChatWindow from '@components/RealTimeCommunication/ChatWindow.vue'

const collapsed = ref(true)
const selectedIps = ref<string[]>([])
const wsStore = useWebSocketStore()

const directMessage = ref('')

const WebSocketIps = ref<string[]>([])

const getAllIps = (ips: string[]) => {
  WebSocketIps.value = ips
}

const handleSendDirectBroadcast = () => {
  if (!WebSocketIps.value.length) {
    antMessage.warn('请先扫描网络')
    return
  }
  let targetIps: string[] = []
  if (selectedIps.value.length) {
    targetIps = selectedIps.value
  } else {
    targetIps = WebSocketIps.value
  }
  wsStore.sendDirectBroadcast(copyNormalize(targetIps), copyNormalize(directMessage.value))
  directMessage.value = ''
}

// --- Lifecycle Hooks ---
onUnmounted(() => {
  if (wsStore.isConnected) {
    wsStore.disconnect()
  }
})
</script>

<style scoped lang="scss">
.webSocket-container {
  height: 100%;
  display: flex;
  width: 100%;
  padding: 10px;
  background-color: var(--color-background);
  color: var(--color-text);
  overflow-y: auto;
  .chat-container {
    // width: 70%;
    padding: 10px;
    .chat-room {
      height: 100%;
    }

    .direct-container {
      padding-top: 150px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      text-align: center;
      margin: auto;
      align-items: center;
      justify-content: center;

      .direct-content {
        border-radius: 8px;
        padding: 30px;
        width: 100%;
        width: 80%;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background-color: var(--color-background-soft);
      }
    }
  }
  .network-tool-container {
    width: 30%;
  }
}
</style>
