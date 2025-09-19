<template>
  <div class="webSocket-container">
    <!-- Chat Window -->
    <NetWorkTool v-show="collapsed" v-model="selectedIps"></NetWorkTool>
    <a-button class="back-button" type="primary" @click="collapsed = !collapsed"> 1111 </a-button>

    <ChatWindow
      v-if="wsStore.modeSelected"
      :messages="wsStore.messages"
      :is-host="wsStore.isHost"
      :is-connected="wsStore.isConnected"
      :nickname="wsStore.nickname"
      :connection-status="wsStore.connectionStatus"
      :room-token="wsStore.roomToken"
      :input-token="wsStore.inputToken"
      :host-ip-for-display="wsStore.hostIpForDisplay"
      @send-message="wsStore.sendMessage"
      @send-room-broadcast="wsStore.sendRoomBroadcast"
    />
    <!-- Initial Screen -->
    <div v-else class="mode-selection-wrapper">
      <ModeSelection
        v-model:hostIp="hostIp"
        :is-scanning="isScanning"
        @start-hosting="wsStore.startHosting"
        @show-join-modal="showTokenModal = true"
        @scan-network="scanNetwork"
      />
      <DirectBroadcast
        v-if="foundIps.length > 0"
        :found-ips="foundIps"
        @ip-selected="(ip) => (hostIp = ip)"
      />
    </div>

    <!-- Token Input Modal -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import { webSocketApi } from '@api/webSocket'
import { useWebSocketStore } from '@/stores/webSocketStore'

// Import child components
import NetWorkTool from '@components/RealTimeCommunication/NetWorkTool.vue'
import ModeSelection from '@components/RealTimeCommunication/ModeSelection.vue'
import DirectBroadcast from '@components/RealTimeCommunication/DirectBroadcast.vue'
import ChatWindow from '@components/RealTimeCommunication/ChatWindow.vue'

const collapsed = ref(true)
const selectedIps = ref<string[]>([])
const wsStore = useWebSocketStore()

// --- Local state for orchestration ---
const hostIp = ref('')
const localInputToken = ref('')
const showTokenModal = ref(false)
const isScanning = ref(false)
const foundIps = ref<string[]>([])

// --- Network Scan Logic ---
const scanNetwork = async () => {
  isScanning.value = true
  foundIps.value = []
  antMessage.info('正在扫描局域网中的主机...')
  try {
    const result = await webSocketApi.scan(8888)
    if (result.success && result.ips) {
      foundIps.value = result.ips
      console.log(foundIps.value)

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

// --- Modal Logic ---
const handleTokenSubmit = () => {
  if (!localInputToken.value.trim()) {
    antMessage.warn('请输入房间令牌。')
    return
  }
  if (!hostIp.value.trim()) {
    antMessage.warn('IP地址不能为空，请从扫描结果中选择或手动输入。')
    return
  }
  wsStore.joinRoom(hostIp.value, localInputToken.value)
  showTokenModal.value = false
}

// --- Lifecycle Hooks ---
onUnmounted(() => {
  // Disconnect when the user navigates away from the page
  if (wsStore.isConnected) {
    wsStore.disconnect()
  }
})
</script>

<style scoped>
.webSocket-container {
  height: calc(100% - 0px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10px;
  background-color: var(--color-background);
  color: var(--color-text);
  overflow-y: auto;
}

.mode-selection-wrapper {
  display: flex;
  flex-direction: column;
  gap: 40px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}
</style>
