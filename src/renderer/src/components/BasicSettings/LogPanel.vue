<template>
  <div class="log-column">
    <a-card v-if="scanning" class="progress-card settings-card">
      <template #title>
        <div class="card-header">
          <span>扫描进度</span>
          <a-button type="primary" danger size="small" @click="$emit('stop-scan')">停止</a-button>
        </div>
      </template>
      <div class="progress-info">
        <span>{{ scanPhase }}</span>
        <span>{{ scanPercentage }}%</span>
      </div>
      <a-progress
        :percent="scanPercentage"
        :stroke-width="10"
        :status="scanPercentage === 100 ? 'success' : 'active'"
      />
    </a-card>

    <a-card class="log-card settings-card">
      <template #title>
        <div class="card-header">
          <span>扫描日志</span>
          <div class="log-actions">
            <a-button type="link" @click="$emit('copy-logs')" :disabled="logs.length === 0">
              <template #icon><CopyOutlined /></template>复制
            </a-button>
            <a-button type="link" danger @click="$emit('clear-logs')" :disabled="logs.length === 0">
              <template #icon><DeleteOutlined /></template>清除
            </a-button>
          </div>
        </div>
      </template>
      <div class="log-content">
        <div v-if="logs.length === 0" class="empty-logs">
          <a-empty description="暂无日志" />
        </div>
        <p v-else v-for="(log, index) in logs" :key="index" :class="log.type">{{ log.message }}</p>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import {
  CopyOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

interface Log {
  type: 'info' | 'error' | 'success'
  message: string
}

defineProps({
  scanning: Boolean,
  scanPhase: String,
  scanPercentage: Number,
  logs: {
    type: Array as () => Log[],
    required: true
  }
})

defineEmits(['stop-scan', 'copy-logs', 'clear-logs'])
</script>

<style scoped>
.log-column {
  flex: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.log-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  font-family: 'Fira Code', monospace;
  white-space: pre-wrap;
  font-size: 13px;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 12px;
  user-select: text; /* Allow text selection */
}

.empty-logs {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-actions {
  display: flex;
  gap: 8px;
}

.log-content p {
  margin: 3px 0;
  padding-left: 8px;
  border-left: 3px solid transparent;
}

.info {
  color: #555;
  border-left-color: #1890ff;
}

.error {
  color: #cf1322;
  background-color: #fff1f0;
  border-left-color: #cf1322;
}

.success {
  color: #389e0d;
  background-color: #f6ffed;
  border-left-color: #389e0d;
}

.progress-card {
  margin-bottom: 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
</style>