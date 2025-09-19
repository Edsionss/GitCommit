<template>
  <div class="broadcast-container">
    <a-typography-title :level="5">{{ title }}</a-typography-title>
    <a-textarea
      v-model:value="broadcastMessage"
      :placeholder="placeholder"
      :rows="3"
    />
    <a-button
      type="primary"
      @click="handleBroadcast"
      :disabled="!broadcastMessage.trim()"
      block
      style="margin-top: 12px"
    >
      <template #icon><NotificationOutlined /></template>
      {{ buttonText }}
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NotificationOutlined } from '@ant-design/icons-vue'

const props = withDefaults(defineProps<{
  selectedIps: string[]
}>(), {
  selectedIps: () => []
})

const emit = defineEmits<{(e: 'send-global-broadcast', text: string): void}>()

const broadcastMessage = ref('')

const hasSelection = computed(() => props.selectedIps.length > 0)

const title = computed(() =>
  hasSelection.value ? `向 ${props.selectedIps.length} 个已选目标广播` : '全局广播'
)

const buttonText = computed(() =>
  hasSelection.value ? `发送给 ${props.selectedIps.length} 个已选目标` : '发送全局广播'
)

const placeholder = computed(() =>
  hasSelection.value
    ? '输入要发送给已选主机的消息。'
    : '向网络中的所有主机发送广播消息。需要先扫描网络。'
)

const handleBroadcast = () => {
  emit('send-global-broadcast', broadcastMessage.value)
  broadcastMessage.value = '' // Clear after sending
}
</script>

<style scoped>
.broadcast-container {
  width: 100%;
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
}
</style>
