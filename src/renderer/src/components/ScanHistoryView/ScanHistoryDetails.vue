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
        <a-tab-pane key="parameters" tab="扫描参数">
          <ScanParametersTab :record="record" class="detail-item" />
        </a-tab-pane>
        <a-tab-pane key="log" tab="扫描日志">
          <ScanLogTab :log="record.log" class="detail-item" />
        </a-tab-pane>
        <a-tab-pane key="results" tab="扫描结果">
          <ScanResultsTable :results="record.results" class="detail-item" />
        </a-tab-pane>
        <a-tab-pane key="analysis" tab="AI分析">
          <ScanAnalysis :record="record" @analysis="onAnalysis"></ScanAnalysis>
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
import ScanLogTab from './ScanLogTab.vue'
import ScanAnalysis from './ScanAnalysis.vue'
import type { GitCommit, GitScanOptions } from '@allTypes/git.dto'
import { useDataStore } from '@/stores/dataStore'
import { useRouter } from 'vue-router'

const dataStore = useDataStore()
const router = useRouter()

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

const props = defineProps({
  record: { type: Object as PropType<ScanRecord | null>, default: null },
  loading: { type: Boolean, default: false }
})

defineEmits(['exportResults'])

const activeTab = ref('parameters')

const onAnalysis = () => {
  dataStore.setScanResultList(props.record?.results)
  dataStore.setScanId(props.record?.id)
  // router.push({ path: '/aiChat', query: { id: props.record?.id } })
  router.push({ path: '/aiChat' })
}
</script>

<style scoped>
:deep(.ant-tabs-content) {
  height: 100%;
  padding-top: 15px;
  overflow: auto;
}
.detail-item {
  height: 100%;
  overflow: auto;
}
.details-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.details-card :deep(.ant-card-body) {
  flex: 1;
  overflow: auto;
  padding: 10px;
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
