<template>
  <a-card class="list-card" :loading="loading">
    <template #title>
      <div class="card-header">
        <span>扫描记录</span>
      </div>
    </template>
    <div class="scan-records-list">
      <a-empty v-if="scanRecords.length === 0" description="暂无扫描记录" />
      <div v-for="record in scanRecords" :key="record.id">
        <a-dropdown :trigger="['contextmenu']">
          <div
            class="record-item"
            :class="{ active: selectedRecordId === record.id }"
            @click="$emit('selectRecord', record)"
          >
            <div class="record-header">
              <span class="repo-path">{{ record.repoPath }}</span>
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </div>
            <div class="record-info">
              <span>{{ formatDate(record.scanTime) }}</span>
              <span>共 {{ record.totalCommits }} 条提交</span>
            </div>
          </div>
          <template #overlay>
            <a-menu @click="({ key }) => $emit('deleteRecord', record.id, key)">
              <a-menu-item key="delete">删除</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import dayjs from 'dayjs'
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
  scanRecords: { type: Array as PropType<ScanRecord[]>, required: true },
  loading: { type: Boolean, default: false },
  selectedRecordId: { type: String, default: null }
})

defineEmits(['selectRecord', 'deleteRecord'])

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
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
.list-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-card :deep(.ant-card-body) {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scan-records-list {
  padding: var(--spacing-sm);
}

.record-item {
  padding: var(--spacing-md);
  /* border-bottom: 1px solid var(--color-border); */
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 0.5rem;
}

.record-item:last-child {
  border-bottom: none;
}

.record-item:hover {
  background-color: var(--color-background-soft);
}

.record-item.active {
  background-color: rgba(var(--primary-color-rgb), 0.1);
  border-left: 3px solid var(--primary-color);
  padding-left: calc(var(--spacing-md) - 3px);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.repo-path {
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: var(--spacing-sm);
}

.record-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
</style>
