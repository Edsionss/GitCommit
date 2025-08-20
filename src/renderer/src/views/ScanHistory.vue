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
import { GitCommit, GitScanOptions } from '@services/GitService'
import { useRouter } from 'vue-router'

const router = useRouter() // 导入GitCommit和GitScanOptions接口

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
const scanRecords = ref<ScanRecord[]>([])
const loading = ref(false)
const selectedRecord = ref<ScanRecord | null>(null)

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

// 方法：加载扫描历史
const loadScanHistory = () => {
  loading.value = true
  try {
    const history = localStorage.getItem('scanHistory')
    if (history) {
      const historyData = JSON.parse(history)
      // 对每条记录的results进行排序
      historyData.forEach((record) => {
        if (record.results && Array.isArray(record.results)) {
          record.results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        }
      })
      scanRecords.value = historyData
      if (scanRecords.value.length > 0) {
        selectedRecord.value = scanRecords.value[0] // 默认选中最新一条
      }
    }
  } catch (error) {
    console.error('加载扫描历史失败:', error)
    message.error('加载扫描历史失败')
  } finally {
    loading.value = false
  }
}

// 方法：保存扫描记录
const saveScanRecord = (record: ScanRecord) => {
  scanRecords.value.unshift(record) // 添加到最前面
  localStorage.setItem('scanHistory', JSON.stringify(scanRecords.value))
  selectedRecord.value = record // 选中新添加的记录
}

// 方法：删除单条扫描记录
const deleteScanRecord = (recordId: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条扫描记录吗？此操作不可撤销。',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: () => {
      const index = scanRecords.value.findIndex((r) => r.id === recordId)
      if (index > -1) {
        scanRecords.value.splice(index, 1)
        localStorage.setItem('scanHistory', JSON.stringify(scanRecords.value))
        if (selectedRecord.value && selectedRecord.value.id === recordId) {
          selectedRecord.value = scanRecords.value.length > 0 ? scanRecords.value[0] : null
        }
        message.success('扫描记录已删除')
      }
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
      scanRecords.value = []
      localStorage.removeItem('scanHistory')
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
}

// 方法：导出扫描结果
const exportScanResults = (format: string) => {
  if (!selectedRecord.value || selectedRecord.value.results.length === 0) {
    message.warning('没有可导出的扫描结果')
    return
  }
  message.info(`正在导出 ${selectedRecord.value.repoPath} 的扫描结果为 ${format} 格式...`)
  // 实际导出逻辑需要调用主进程或GitService
  // 例如：gitService.exportData(selectedRecord.value.results, format, 'outputPath', 'fileName')
  // 这里仅作模拟
  setTimeout(() => {
    message.success('导出成功！')
  }, 1000)
}

// 生命周期钩子
// 生命周期钩子
onMounted(() => {
  loadScanHistory()
})

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
