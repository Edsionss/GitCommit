<template>
  <a-card class="details-card" :loading="loading">
    <template #title>
      <div class="card-header">
        <span>扫描详情</span>
        <a-button-group v-if="record">
          <a-button @click="$emit('exportResults', 'json')">导出JSON</a-button>
          <a-button @click="$emit('exportResults', 'csv')">导出CSV</a-button>
          <a-button @click="$emit('exportResults', 'excel')">导出Excel</a-button>
        </a-button-group>
      </div>
    </template>
    <div v-if="record" class="details-content">
      <a-tabs v-model:activeKey="activeTab" class="details-tabs">
        <a-tab-pane key="parameters" tab="扫描参数与日志">
          <ScanParametersTab :record="record" />
        </a-tab-pane>
        <a-tab-pane key="results" tab="扫描结果">
          <ScanResultsTable :results="record.results" />
        </a-tab-pane>
      </a-tabs>
    </div>
    <a-empty v-else description="请选择一条扫描记录查看详情" />
  </a-card>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue'
import ScanParametersTab from './ScanParametersTab.vue'
import ScanResultsTable from './ScanResultsTable.vue'
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
  record: { type: Object as PropType<ScanRecord | null>, default: null },
  loading: { type: Boolean, default: false },
})

defineEmits(['exportResults'])

const activeTab = ref('parameters')
</script>

<style scoped>
.details-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.details-card :deep(.ant-card-body) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.details-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.details-tabs :deep(.ant-tabs-content-holder) {
  flex: 1;
  overflow-y: auto;
}

.details-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}

.details-tabs :deep(.ant-tabs-tabpane) {
  padding: var(--spacing-md);
}
</style>