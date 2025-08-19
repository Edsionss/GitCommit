<template>
  <div class="log-display-container">
    <div class="log-display">
      <p v-if="!log || log.length === 0">暂无日志信息。</p>
      <p v-else v-for="(log, index) in log" :key="index" :class="getLogLevelClass(log)">
        {{ log }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'

defineProps({
  log: { type: Array as PropType<string[]>, required: true }
})

const getLogLevelClass = (logMessage: string) => {
  if (logMessage.includes('[ERROR]') || logMessage.includes('扫描失败')) return 'log-error'
  if (logMessage.includes('[WARNING]')) return 'log-warning'
  if (logMessage.includes('[SUCCESS]') || logMessage.includes('扫描完成')) return 'log-success'
  return 'log-info'
}
</script>

<style scoped>
.log-display-container {
  padding: var(--spacing-md);
  height: 100%;
  overflow: auto;
}

.log-display {
  background-color: var(--color-background-soft);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  height: 100%;
  overflow-y: auto;
  font-family: 'inherit', monospace;
  font-size: var(--font-size-sm);
  padding: 10px;
  user-select: text;
}

.log-display p {
  margin: 2px 0;
  line-height: 1.4;
  word-break: break-all;
  white-space: pre-wrap;
}

.log-info {
  color: var(--text-primary);
}

.log-error {
  color: var(--color-danger);
}

.log-warning {
  color: var(--color-warning);
}

.log-success {
  color: var(--color-success);
}
</style>
