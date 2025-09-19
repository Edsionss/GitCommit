<template>
  <a-layout class="realtime-communication-layout">
    <!-- Left Sider for Network Scanning -->
    <NetworkScanner
      :is-scanning="wsStore.isScanning"
      :scanned-ips="wsStore.scannedIps"
      @scan-network="wsStore.scanNetwork"
      @ip-selected="handleIpSelected"
      @create-room="wsStore.startHosting"
      @selection-change="(ips) => (wsStore.selectedIpsForBroadcast = ips)"
    />

    <!-- Main Content Area -->
    <a-layout-content class="main-content-area">
      <div class="content-wrapper">
        <!-- Chat Window -->
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
          :selected-ips="wsStore.selectedIpsForBroadcast"
          @send-message="wsStore.sendMessage"
          @send-global-broadcast="wsStore.sendGlobalBroadcast"
          @leave-room="wsStore.disconnect"
        />

        <!-- Initial Screen -->
        <div v-else class="mode-selection-wrapper">
          <ModeSelection />
          <GlobalBroadcastInput
            :selected-ips="wsStore.selectedIpsForBroadcast"
            @send-global-broadcast="wsStore.sendGlobalBroadcast"
          />
        </div>
      </div>
    </a-layout-content>

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
  </a-layout>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import { useWebSocketStore } from '@/stores/webSocketStore'

// Import child components
import ModeSelection from '@components/RealTimeCommunication/ModeSelection.vue'
import ChatWindow from '@components/RealTimeCommunication/ChatWindow.vue'
import NetworkScanner from '@components/RealTimeCommunication/NetworkScanner.vue'
import GlobalBroadcastInput from '@components/RealTimeCommunication/GlobalBroadcastInput.vue'

const wsStore = useWebSocketStore()

// --- Local state for orchestration ---
const hostIp = ref('')
const localInputToken = ref('')
const showTokenModal = ref(false)

// --- Event Handlers ---
const handleIpSelected = (ip: string) => {
  hostIp.value = ip
  showTokenModal.value = true
}

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
  localInputToken.value = '' // Reset after submission
}

// --- Lifecycle Hooks ---
onMounted(() => {
  // Automatically scan the network when the component is mounted
  wsStore.scanNetwork()
})

onUnmounted(() => {
  // Disconnect when the user navigates away from the page
  if (wsStore.isConnected) {
    wsStore.disconnect()
  }
})
</script>

<style scoped>
.realtime-communication-layout {
  height: calc(100vh - 120px); /* Adjust based on your app's header/footer */
  background-color: var(--color-background);
}

.main-content-area {
  padding: 24px;
  overflow-y: auto;
  height: 100%;
}

.content-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
}

.mode-selection-wrapper {
  display: flex;
  flex-direction: column;
  gap: 40px;
  width: 100%;
  max-width: 500px;
  margin: 40px auto;
}
</style>
