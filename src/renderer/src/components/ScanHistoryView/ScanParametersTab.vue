<template>
  <div class="scan-parameters-tab">
    <a-descriptions bordered :column="2" size="small">
      <a-descriptions-item label="仓库路径" :span="2">{{ record.repoPath }}</a-descriptions-item>
      <a-descriptions-item label="扫描时间">{{ formatDate(record.scanTime) }}</a-descriptions-item>
      <a-descriptions-item label="扫描状态">
        <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="总提交数">{{ record.totalCommits }}</a-descriptions-item>
      <a-descriptions-item label="最大提交数">{{
        record.scanOptions.maxCommits || '无限制'
      }}</a-descriptions-item>
      <a-descriptions-item label="选择字段" :span="2">{{
        record.scanOptions.selectedFields.join(', ')
      }}</a-descriptions-item>
      <a-descriptions-item label="扫描子文件夹">{{
        record.scanOptions.scanSubfolders ? '是' : '否'
      }}</a-descriptions-item>
      <a-descriptions-item v-if="record.scanOptions.branch" label="分支">{{
        record.scanOptions.branch
      }}</a-descriptions-item>
      <a-descriptions-item
        v-if="record.scanOptions.selectedRepos && record.scanOptions.selectedRepos.length > 0"
        label="选择的子仓库"
        :span="2"
        >{{ record.scanOptions.selectedRepos.join(', ') }}</a-descriptions-item
      >
      <a-descriptions-item v-if="record.scanOptions.authorFilter" label="作者过滤" :span="2">{{
        record.scanOptions.authorFilter
      }}</a-descriptions-item>
      <a-descriptions-item
        v-if="record.scanOptions.dateRange && record.scanOptions.dateRange.length === 2"
        label="日期范围"
        :span="2"
        >{{ formatDateRange(record.scanOptions.dateRange) }}</a-descriptions-item
      >
    </a-descriptions>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import dayjs from 'dayjs'
import { GitScanOptions } from '@services/GitService'

interface ScanRecord {
  id: string
  repoPath: string
  scanTime: string
  status: 'success' | 'failed' | 'cancelled'
  totalCommits: number
  scanOptions: GitScanOptions
  log: string[]
}

defineProps({
  record: { type: Object as PropType<ScanRecord>, required: true }
})

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}

const formatDateRange = (range: [string, string]) => {
  return `${dayjs(range[0]).format('YYYY-MM-DD')} ~ ${dayjs(range[1]).format('YYYY-MM-DD')}`
}

const getStatusColor = (status: 'success' | 'failed' | 'cancelled') => {
  switch (status) {
    case 'success':
      return 'green'
    case 'failed':
      return 'red'
    case 'cancelled':
      return 'orange'
    default:
      return 'blue'
  }
}

const getStatusText = (status: 'success' | 'failed' | 'cancelled') => {
  switch (status) {
    case 'success':
      return '成功'
    case 'failed':
      return '失败'
    case 'cancelled':
      return '已取消'
    default:
      return '未知'
  }
}
</script>

<style scoped>
.scan-parameters-tab {
  padding: var(--spacing-md);
  height: 100%;
  overflow: auto;
}
</style>
