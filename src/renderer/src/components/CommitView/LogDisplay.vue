<template>
  <div class="log-area">
    <div class="log-header">
      <span>扫描日志</span>
      <div class="log-actions">
        <a-button size="small" @click="$emit('copy')" type="primary">
          <template #icon><CopyOutlined /></template>
          复制日志
        </a-button>
        <a-button size="small" @click="$emit('save')" type="primary" ghost>
          <template #icon><DownloadOutlined /></template>
          保存日志
        </a-button>
        <a-button size="small" @click="$emit('clear')">清空</a-button>
      </div>
    </div>
    <div class="markdown-logs custom-scrollbar">
      <div v-if="scanLogs" v-html="formattedLogs" class="markdown-content"></div>
      <div v-else class="empty-logs">暂无日志，请先进行扫描操作</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons-vue'

defineProps<{
  scanLogs: string
  formattedLogs: string
}>()

defineEmits(['copy', 'save', 'clear'])
</script>

<style scoped>
.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0 8px;
}

.log-actions {
  display: flex;
  gap: 8px;
}

.log-area {
  margin-top: 16px;
}

.markdown-logs {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px;
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.empty-logs {
  color: #909399;
  font-style: italic;
  padding: 10px;
  text-align: center;
}

.markdown-content :deep(p) {
  margin: 4px 0;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: #303133;
}

.markdown-content :deep(.log-error) {
  color: #d9534f;
  font-weight: bold;
}

.markdown-content :deep(.log-success) {
  color: #5cb85c;
  font-weight: bold;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #a8a8a8;
}
</style>
