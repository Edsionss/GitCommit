<template>
  <div class="router-view-container">
    <div class="results">
      <a-tabs
        v-model:activeKey="activeTab"
        type="card"
        class="results-tabs"
        @change="handleTabChange"
      >
        <!-- 统计结果 -->
        <a-tab-pane key="stats" tab="统计结果">
          <ResultsStats
            :stats="stats"
            :time-unit="timeUnit"
            :top-limit="topLimit"
            :chart-types="chartTypes"
            :update-charts="updateCharts"
            :toggle-chart-type="toggleChartType"
            :save-chart="saveChart"
            @update:timeUnit="timeUnit = $event"
            @update:topLimit="topLimit = $event"
          />
        </a-tab-pane>

        <!-- 详细统计 -->
        <a-tab-pane key="details" tab="详细统计">
          <ResultsDetails :stats="stats" />
        </a-tab-pane>

        <!-- 导出结果 -->
        <a-tab-pane key="export" tab="导出结果">
          <ResultsExport
            :export-form="exportForm"
            :exporting="exporting"
            @select-export-path="selectExportPath"
            @handle-export="handleExport"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { Tabs, TabPane } from 'ant-design-vue'

import ResultsStats from '@/components/ResultsView/ResultsStats.vue'
import ResultsDetails from '@/components/ResultsView/ResultsDetails.vue'
import ResultsExport from '@/components/ResultsView/ResultsExport.vue'

import resultsStatsData from '@/mock/resultsStats.json'

// 选项卡和图表引用
const activeTab = ref('stats')

// 统计数据
const stats = ref(resultsStatsData)

// 图表配置
const timeUnit = ref('day')
const topLimit = ref(10)
const chartTypes = reactive({
  author: 'pie',
  date: 'line',
  repo: 'bar',
  hour: 'bar'
})

// 导出表单
const exportForm = reactive({
  format: 'excel',
  content: ['commits', 'stats'],
  path: '',
  filePrefix: 'Git提交记录'
})

// 状态标志
const exporting = ref(false)

// 窗口大小变化处理函数 (Placeholder - actual resize logic is in child components)
const handleResize = () => {
  // Child components will handle their own chart resizing
}

// 更新图表 (Placeholder - actual chart update logic is in child components)
const updateCharts = () => {
  // This function will be passed down to ResultsStats and will trigger its internal chart updates
  console.log('Updating charts in ResultsStats')
}

// 切换图表类型 (Placeholder - actual logic is in child components)
const toggleChartType = (chartName: string) => {
  console.log(`Toggling chart type for ${chartName}`)
}

// 保存图表为图片 (Placeholder - actual logic is in child components)
const saveChart = (chartName: string) => {
  console.log(`Saving chart ${chartName}`)
}

// 处理标签页切换
const handleTabChange = (key: string) => {
  activeTab.value = key
  // You might want to trigger data loading or chart updates based on the tab
  // For now, the child components handle their own data/chart initialization on mount
}

// 选择导出路径 (Placeholder - actual logic is in child components)
const selectExportPath = async () => {
  console.log('Selecting export path')
  // Simulate selection
  exportForm.path = 'C:/Users/Public/Documents/ExportedReports'
  message.success('导出路径已选择')
}

// 处理导出 (Placeholder - actual logic is in child components)
const handleExport = async () => {
  if (!exportForm.path) {
    message.warning('请选择导出路径')
    return
  }

  if (exportForm.content.length === 0) {
    message.warning('请选择导出内容')
    return
  }

  exporting.value = true
  const hide = message.loading('正在导出文件...', 0)

  try {
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 2000))
    message.success('文件导出成功！')
  } catch (error) {
    console.error('导出失败:', error)
    message.error('导出失败！')
  } finally {
    exporting.value = false
    hide()
  }
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.router-view-container {
  width: 100%;
  padding: var(--spacing-md);
}

.results {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-tabs {
  min-height: calc(100vh - 180px);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}
</style>
