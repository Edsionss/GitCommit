<template>
  <div class="log-column">
    <!-- <a-card v-if="scanning" class="progress-card settings-card"> -->
    <a-card class="progress-card settings-card">
      <template #title>
        <div class="card-header">
          <span>扫描进度</span>
          <a-button type="primary" danger size="small" @click="$emit('stop-scan')">停止</a-button>
        </div>
      </template>
      <div class="progress">
        <div class="progress-info">
          <span>{{ scanPhase }}</span>
          <span>{{ scanPercentage }}%</span>
        </div>
        <a-progress
          :percent="scanPercentage"
          :stroke-width="10"
          :status="scanPercentage === 100 ? 'success' : 'active'"
        />
      </div>
    </a-card>

    <a-card class="log-card settings-card">
      <template #title>
        <div class="card-header">
          <span>扫描日志</span>
          <div class="log-actions">
            <a-button type="link" @click="copyLogs" :disabled="logs.length === 0">
              <template #icon><CopyOutlined /></template>复制
            </a-button>
            <a-button type="link" danger @click="clearLogs" :disabled="logs.length === 0">
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
import { ref, onMounted, onUnmounted } from 'vue'
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

interface Log {
  type: 'info' | 'error' | 'success'
  message: string
}

defineProps({
  scanning: Boolean
})

const emit = defineEmits(['stop-scan', 'scan-started', 'scan-finished'])

const logs = ref<Log[]>([])
const scanPhase = ref('准备中')
const scanPercentage = ref(0)
const unsubscribeProgress = ref<(() => void) | null>(null)
const unsubscribeError = ref<(() => void) | null>(null)
const unsubscribeCancelled = ref<(() => void) | null>(null)

const addLog = (msg: string, type: Log['type'] = 'info') => {
  const timestamp = dayjs().format('HH:mm:ss')
  logs.value.push({ message: `[${timestamp}] ${msg}`, type })
}

defineExpose({ addLog })

onMounted(() => {
  if (window.api?.onScanProgress) {
    unsubscribeProgress.value = window.api.onScanProgress((data) => {
      emit('scan-started')
      scanPhase.value = data.phase
      scanPercentage.value = data.percentage
      if (data.percentage === 100) {
        setTimeout(() => {
          emit('scan-finished')
        }, 500)
      }
    })
  }
  if (window.api?.onScanError) {
    unsubscribeError.value = window.api.onScanError((data) => {
      addLog(`扫描错误: ${data.message}`, 'error')
      emit('scan-finished')
    })
  }
  if (window.api?.onScanCancelled) {
    unsubscribeCancelled.value = window.api.onScanCancelled(() => {
      addLog('扫描已取消', 'info')
      emit('scan-finished')
    })
  }
})

onUnmounted(() => {
  unsubscribeProgress.value?.()
  unsubscribeError.value?.()
  unsubscribeCancelled.value?.()
})

const copyLogs = () => {
  const logText = logs.value.map((log) => log.message).join('\n')
  navigator.clipboard
    .writeText(logText)
    .then(() => message.success('日志已复制到剪贴板'))
    .catch(() => message.error('复制失败'))
}

const clearLogs = () => {
  logs.value = []
}
</script>

<style scoped>
:deep(.ant-card-body) {
  height: 100%;
  overflow: auto;
  padding: 5px;
}

.log-column {
  flex: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  /* font-family: 'Fira Code', monospace; */
  font-family: ' inherit', monospace;
  white-space: pre-wrap;
  font-size: 13px;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 5px;
  user-select: text; /* Allow text selection */
  overflow: auto;
  height: 100%;
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
.progress {
  padding: 10px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
</style>
