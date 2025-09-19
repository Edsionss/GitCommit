<template>
  <a-layout-sider
    :width="240"
    theme="light"
    collapsible
    :collapsed="collapsed"
    :collapsed-width="0"
    @collapse="onCollapse"
    class="network-scanner-sider"
  >
    <div class="scanner-content" :class="{ 'is-collapsed': collapsed }">
      <div class="scanner-header">
        <ToolOutlined v-if="!collapsed" />
        <span v-if="!collapsed" class="header-title">网络工具</span>
        <a-tooltip v-if="!collapsed" title="创建新房间">
          <div type="text" shape="circle" @click="$emit('create-room')" class="create-room-btn">
            <PlusCircleOutlined />
          </div>
        </a-tooltip>
      </div>
      <a-button type="primary" @click="scan" :loading="isScanning" block class="scan-button">
        <template #icon><SearchOutlined /></template>
        <span v-if="!collapsed">扫描主机</span>
      </a-button>
      <a-divider v-if="!collapsed" class="divider" />
      <div v-if="!collapsed" class="ip-list-container">
        <div v-if="scannedIps.length === 0 && !isScanning" class="empty-state">
          <InfoCircleOutlined />
          <span>未发现主机</span>
        </div>
        <a-list
          v-else
          item-layout="horizontal"
          :data-source="scannedIps"
          class="ip-list"
          size="small"
        >
          <template #renderItem="{ item: ip }">
            <a-list-item class="ip-list-item">
              <template #actions>
                <a-button type="link" size="small" @click.stop="onIpSelect(ip)">加入</a-button>
              </template>
              <a-list-item-meta @click.stop="onIpSelect(ip)">
                <template #title>
                  <a-checkbox
                    v-model:checked="selectedIps[ip]"
                    @change="onSelectionChange"
                    @click.stop
                  />
                  <DesktopOutlined class="ip-icon" />
                  <span class="ip-address">{{ ip }}</span>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </div>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  SearchOutlined,
  DesktopOutlined,
  InfoCircleOutlined,
  ToolOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
  PlusCircleOutlined
} from '@ant-design/icons-vue'

defineProps<{
  isScanning: boolean
  scannedIps: string[]
}>()

const emit = defineEmits<{
  (e: 'scan-network'): void
  (e: 'ip-selected', ip: string): void
  (e: 'create-room'): void
  (e: 'selection-change', selectedIps: string[]): void
}>()

const collapsed = ref(false)
const selectedIps = ref<Record<string, boolean>>({})

const onCollapse = (isCollapsed: boolean) => {
  collapsed.value = isCollapsed
}

const scan = () => {
  emit('scan-network')
}

const onIpSelect = (ip: string) => {
  emit('ip-selected', ip)
}

const onSelectionChange = () => {
  const selection = Object.entries(selectedIps.value)
    .filter(([, isSelected]) => isSelected)
    .map(([ip]) => ip)
  emit('selection-change', selection)
}
</script>

<style scoped>
.network-scanner-sider {
  height: 100%;
  border-right: 1px solid var(--color-border);
  background-color: var(--color-background-soft) !important;
  transition: width 0.2s;
  position: relative; /* Needed for custom trigger positioning */
}

/* Hide the default trigger */
:deep(.ant-layout-sider-trigger) {
  display: none;
}

.scanner-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: opacity 0.2s;
}

.scanner-content.is-collapsed {
  display: none;
}

.scanner-header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Ensure button goes to the right */
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--color-text-emphasis);
}

.header-title {
  flex-grow: 1; /* Allow title to take up space */
}

.create-room-btn {
  cursor: pointer;
  flex-shrink: 0; /* Prevent button from shrinking */
  font-size: 20px;
  color: var(--color-text-secondary);
}

.create-room-btn:hover {
  color: var(--color-primary) !important; /* Use !important to override Ant Design styles */
}

.scan-button {
  flex-shrink: 0;
}

.divider {
  margin: 16px 0;
}

.ip-list-container {
  flex-grow: 1;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  gap: 8px;
}

.ip-list-item {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.ip-list-item:hover {
  background-color: var(--color-background-hover);
}

.ip-list-item .ant-list-item-meta-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ip-icon {
  color: var(--color-text-secondary);
}

.ip-address {
  flex-grow: 1;
}
</style>
