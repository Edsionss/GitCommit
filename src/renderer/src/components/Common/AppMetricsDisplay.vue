<template>
  <div class="app-metrics-display">
    <span class="metric-item">CPU: {{ cpu.toFixed(1) }}%</span>
    <span class="metric-item">Mem: {{ mem.toFixed(0) }}MB</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

const cpu = computed(() => appStore.cpuUsage)
const mem = computed(() => appStore.memoryUsage / 1024 / 1024) // Convert to MB
</script>

<style scoped>
.app-metrics-display {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 16px;
}

.metric-item {
  display: inline-block;
}
</style>
