<template>
  <div class="direct-broadcast-section">
    <a-typography-title :level="4">扫描结果与直接广播</a-typography-title>
    <a-checkbox-group v-model:value="selectedIps" style="width: 100%">
      <a-list :data-source="foundIps" size="small" bordered>
        <template #header>
          <a-checkbox @change="handleSelectAll">全选</a-checkbox>
        </template>
        <template #renderItem="{ item }">
          <a-list-item class="ip-list-item" @click="$emit('ip-selected', item)">
            <a-checkbox :value="item" @click.stop>{{ item }}</a-checkbox>
          </a-list-item>
        </template>
      </a-list>
    </a-checkbox-group>
    <div class="input-area" style="margin-top: 16px">
      <a-input
        v-model:value="directMessage"
        placeholder="输入要广播的消息..."
        size="large"
        @keyup.enter="handleSendDirectBroadcast"
      />
      <a-button
        type="primary"
        size="large"
        @click="handleSendDirectBroadcast"
        :disabled="selectedIps.length === 0 || !directMessage"
      >
        <template #icon><SendOutlined /></template>
        发送广播
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWebSocketStore } from '@/stores/webSocketStore'
import { SendOutlined } from '@ant-design/icons-vue'
import type { CheckboxChangeEvent } from 'ant-design-vue/es/checkbox/interface'
import { copyNormalize } from '@utils/index'
const props = defineProps<{ foundIps: string[] }>()
const emit = defineEmits(['ip-selected'])

const wsStore = useWebSocketStore()
const directMessage = ref('')
const selectedIps = ref<string[]>([])

const handleSelectAll = (e: CheckboxChangeEvent) => {
  selectedIps.value = e.target.checked ? [...props.foundIps] : []
}

const handleSendDirectBroadcast = () => {
  wsStore.sendDirectBroadcast(copyNormalize(selectedIps.value), copyNormalize(directMessage.value))
  directMessage.value = ''
}
</script>

<style scoped>
.direct-broadcast-section {
  text-align: center;
  width: 100%;
}
.direct-broadcast-section .ant-list {
  text-align: left;
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
}

.ip-list-item {
  cursor: pointer;
  transition: background-color 0.3s;
}

.ip-list-item:hover {
  background-color: var(--color-background-mute);
}

.input-area {
  display: flex;
  padding: 12px 0;
  gap: 10px;
}
</style>
