<template>
  <div class="scan-parameters-tab">
    <h3>扫描参数</h3>
    <a-descriptions bordered :column="1" size="small">
      <a-descriptions-item label="仓库路径">{{ record.repoPath }}</a-descriptions-item>
      <a-descriptions-item label="扫描时间">{{ formatDate(record.scanTime) }}</a-descriptions-item>
      <a-descriptions-item label="扫描状态">
        <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="总提交数">{{ record.totalCommits }}</a-descriptions-item>
      <a-descriptions-item label="选择字段">{{ record.scanOptions.selectedFields.join(', ') }}</a-descriptions-item>
      <a-descriptions-item label="扫描子文件夹">{{ record.scanOptions.scanSubfolders ? '是' : '否' }}</a-descriptions-item>
      <a-descriptions-item v-if="record.scanOptions.selectedRepos && record.scanOptions.selectedRepos.length > 0" label="选择的子仓库">{{ record.scanOptions.selectedRepos.join(', ') }}</a-descriptions-item>
      <a-descriptions-item v-if="record.scanOptions.authorFilter" label="作者过滤">{{ record.scanOptions.authorFilter }}</a-descriptions-item>
      <a-descriptions-item v-if="record.scanOptions.dateRange && record.scanOptions.dateRange.length === 2" label="日期范围">{{ formatDateRange(record.scanOptions.dateRange) }}</a-descriptions-item>
      <a-descriptions-item v-if="record.scanOptions.maxCommits" label="最大提交数">{{ record.scanOptions.maxCommits }}</a-descriptions-item>
      <a-descriptions-item v-if="record.scanOptions.branch" label="分支">{{ record.scanOptions.branch }}</a-descriptions-item>
    </a-descriptions>

    <h3 style="margin-top: 20px;">扫描日志</h3>
    <div class="log-display">
      <p v-if="record.log.length === 0">暂无日志信息。</p>
      <p v-else v-for="(log, index) in record.log" :key="index" :class="getLogLevelClass(log)">{{ log }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { GitCommit, GitScanOptions } from '@services/GitService'

interface ScanRecord {
  id: string
  repoPath: string
  scanTime: string
  status: 'success' | 'failed' | 'cancelled'
  totalCommits: number
  scanOptions: GitScanOptions
  log: string[]
  results: GitCommit[]
}

defineProps({
  record: { type: Object as PropType<ScanRecord>, required: true },
})

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}

const formatDateRange = (range: [string, string]) => {
  return `${dayjs(range[0]).format('YYYY-MM-DD')} ~ ${dayjs(range[1]).format('YYYY-MM-DD')}`
}

const getStatusColor = (status: 'success' | 'failed' | 'cancelled') => {
  switch (status) {
    case 'success': return 'green'
    case 'failed': return 'red'
    case 'cancelled': return 'orange'
    default: return 'blue'
  }
}

const getStatusText = (status: 'success' | 'failed' | 'cancelled') => {
  switch (status) {
    case 'success': return '成功'
    case 'failed': return '失败'
    case 'cancelled': return '已取消'
    default: return '未知'
  }
}

const getLogLevelClass = (logMessage: string) => {
  if (logMessage.includes('[ERROR]') || logMessage.includes('扫描失败')) return 'log-error'
  if (logMessage.includes('[WARNING]')) return 'log-warning'
  if (logMessage.includes('[SUCCESS]') || logMessage.includes('扫描完成')) return 'log-success'
  return 'log-info'
}
</script>

<style scoped>
.scan-parameters-tab {
  padding: var(--spacing-md);
}

.log-display {
  background-color: var(--color-background-soft);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
  font-size: var(--font-size-sm);
}

.log-display p {
  margin: 2px 0;
  line-height: 1.4;
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
