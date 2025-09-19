<template>
  <div class="network-tool-sider">
    <div class="content-wrapper">
      <div class="head-container">
        <div class="head-title">
          <h3><ToolOutlined />网络工具</h3>
        </div>
        <div class="head-actions">
          <a-button type="primary" @click="scanNetwork">
            扫描网络
            <template #icon>
              <SearchOutlined />
            </template>
          </a-button>
          <a-button type="primary" @click="wsStore.startHosting">
            创建房间
            <template #icon>
              <PlusCircleOutlined />
            </template>
          </a-button>
        </div>
      </div>
      <div class="content" v-if="foundIps.length">
        <a-checkbox-group v-model:value="selectedIps" style="width: 100%">
          <a-list :data-source="foundIps" size="small" bordered>
            <template #renderItem="{ item }">
              <a-list-item class="ip-list-item">
                <a-checkbox :value="item" @click.stop>
                  <DesktopOutlined />
                  {{ item }}
                  <a-button type="link" @click="joinRoom(item)">加入</a-button>
                </a-checkbox>
              </a-list-item>
            </template>
          </a-list>
        </a-checkbox-group>
      </div>
    </div>
    <a-modal
      v-model:open="showTokenModal"
      title="输入房间令牌"
      :closable="false"
      :maskClosable="false"
      @ok="handleTokenSubmit"
      :confirm-loading="wsStore.isConnecting"
    >
      <a-input
        v-model:value="roomData.token"
        placeholder="向主机索要令牌"
        @keyup.enter="handleTokenSubmit"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  ToolOutlined,
  DesktopOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  SearchOutlined,
  PlusCircleOutlined
} from '@ant-design/icons-vue'

const isScanning = ref(false)
const foundIps = ref<string[]>([])
import { message as antMessage } from 'ant-design-vue'
import { webSocketApi } from '@api/webSocket'
import { useWebSocketStore } from '@/stores/webSocketStore'
const wsStore = useWebSocketStore()
const roomData = reactive<any>({
  hostIp: '',
  token: ''
})
const selectedIps = defineModel<string[]>()
const showTokenModal = ref(false)

// --- Modal Logic ---
const handleTokenSubmit = () => {
  if (!roomData.hostIp.trim()) {
    antMessage.warn('请输入房间令牌。')
    return
  }
  if (!roomData.token.trim()) {
    antMessage.warn('IP地址不能为空，请从扫描结果中选择或手动输入。')
    return
  }
  wsStore.joinRoom(roomData.hostIp, roomData.token)
  showTokenModal.value = false
}
const scanNetwork = async () => {
  isScanning.value = true
  foundIps.value = []
  antMessage.info('正在扫描局域网中的主机...')
  try {
    const result = await webSocketApi.scan(8888)
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

const joinRoom = (item: any) => {
  roomData.hostIp = item
  showTokenModal.value = true
}
</script>

<style scoped lang="scss">
.network-tool-sider {
  text-align: center;
  height: 100%;
  width: auto !important;
  max-width: 300px !important;
  min-width: 0px !important;
  border-left: 1px solid #f0f0f0;
  padding: 10px;
  flex: none !important;
}
:deep(.ant-list) {
  border: none;
}
.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .head-container {
    padding-bottom: 20px;
    border-bottom: #f0f0f0 1px solid;
    .head-actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
