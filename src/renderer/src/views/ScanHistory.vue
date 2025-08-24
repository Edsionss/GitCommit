<template>
  <div class="scan-history-container">
    <ScanHistoryToolbar
      :repositories="repositories"
      v-model:selectedRepo="selectedRepo"
      v-model:dateRange="dateRange"
      @filter="filterScanHistory"
    />

    <div class="content-row">
      <div class="content-list overflow">
        <ScanHistoryList
          :scan-records="filteredScanRecords"
          :loading="loading"
          @select-record="selectScanRecord"
          @delete-record="deleteScanRecord"
          @delete-all-records="deleteAllScanRecords"
          :selected-record-id="selectedRecord ? selectedRecord.id : null"
        />
      </div>
      <div class="content-detail overflow">
        <ScanHistoryDetails
          :record="selectedRecord"
          :loading="loading"
          @export-results="exportScanResults"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import ScanHistoryToolbar from '@components/ScanHistoryView/ScanHistoryToolbar.vue'
import ScanHistoryList from '@components/ScanHistoryView/ScanHistoryList.vue'
import ScanHistoryDetails from '@components/ScanHistoryView/ScanHistoryDetails.vue'
import type { GitCommit, GitScanOptions } from '@allTypes/git.dto'
import { useRouter } from 'vue-router'
import { useScanStore } from '@/stores/scanStore'
import { storeToRefs } from 'pinia'

const scanStore = useScanStore()
const router = useRouter() // 导入GitCommit和GitScanOptions接口
const { getScanRecordList, getFirstRecord } = storeToRefs(scanStore)
// 定义扫描记录接口
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

// 模拟仓库数据
const repositories = ref([
  { id: 'all', name: '所有仓库' },
  { id: 'repo1', name: 'GitCommit' },
  { id: 'repo2', name: 'WebProject' }
])

// 筛选条件
const selectedRepo = ref('all')
const dateRange = ref<[Dayjs, Dayjs] | null>(null)

// 扫描记录数据
const scanRecords = computed<ScanRecord[]>(() => getScanRecordList.value)
const selectedRecord = ref<ScanRecord | null>(getFirstRecord.value)

const loading = ref(false)

// 计算属性：过滤后的扫描记录
const filteredScanRecords = computed(() => {
  let records = [...scanRecords.value]
  if (selectedRepo.value !== 'all') {
    records = records.filter((record) => record.repoPath.includes(selectedRepo.value))
  }
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value.map((d) => d.startOf('day'))
    records = records.filter((record) => {
      const recordDate = dayjs(record.scanTime).startOf('day')
      return (
        recordDate.isAfter(startDate.subtract(1, 'day')) &&
        recordDate.isBefore(endDate.add(1, 'day'))
      )
    })
  }
  return records.sort((a, b) => dayjs(b.scanTime).valueOf() - dayjs(a.scanTime).valueOf())
})

// 方法：删除单条扫描记录
const deleteScanRecord = (recordId: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条扫描记录吗？此操作不可撤销。',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: () => {
      scanStore.delScanRecordById(recordId)
      if (selectedRecord.value && selectedRecord.value.id === recordId) {
        selectedRecord.value = getFirstRecord.value
      }
      message.success('扫描记录已删除')
    }
  })
}

// 方法：删除所有扫描记录
const deleteAllScanRecords = () => {
  Modal.confirm({
    title: '确认删除全部',
    content: '确定要删除所有扫描记录吗？此操作不可撤销。',
    okText: '全部删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: () => {
      scanStore.delAllScanRecord()
      selectedRecord.value = null
      message.success('所有扫描记录已清空')
    }
  })
}

// 方法：过滤扫描历史
const filterScanHistory = () => {
  // computed属性会自动更新，这里可以触发一些UI更新或日志
  message.info('正在过滤扫描记录...')
}

// 方法：选择扫描记录
const selectScanRecord = (record: ScanRecord) => {
  selectedRecord.value = record
  console.log('选择扫描记录：', record)
}

// 方法：导出扫描结果
const exportScanResults = async (format: 'json' | 'csv') => {
  if (!selectedRecord.value || selectedRecord.value.results.length === 0) {
    message.warning('没有可导出的扫描结果')
    return
  }
  message.info(`正在导出 ${selectedRecord.value.repoPath} 的扫描结果为 ${format} 格式...`)
  try {
    const filePath = await exportApi.exportCommits(selectedRecord.value.results, format)
    if (filePath) {
      message.success(`导出成功！文件保存至: ${filePath}`)
    } else {
      message.info('导出已取消或未保存文件。')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    message.error(`导出失败: ${errorMessage}`)
  }
}

// 暴露给外部的方法，用于从BasicSettings页面接收扫描结果
</script>

<style scoped>
.scan-history-container {
  width: 100%;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.content-row {
  display: flex;
  gap: 10px;
  height: calc(100vh - 185px);
}
.content-list {
  flex: 1;
}
.content-detail {
  flex: 2;
}
.overflow {
  overflow: auto;
}
</style>
