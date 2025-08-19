<template>
  <div class="reports-container page-container">
    <ReportsToolbar
      :repositories="repositories"
      :selected-repo="selectedRepo"
      :date-range="dateRange"
      @update:selectedRepo="selectedRepo = $event"
      @update:dateRange="dateRange = $event"
      @generatePreview="generatePreview"
    />

    <a-tabs v-model:activeKey="activeTab" class="reports-tabs">
      <a-tab-pane key="commit-activity" tab="提交活动">
        <CommitActivityReport
          :loading="loading"
          :commit-stats="commitStats"
          :top-contributors="topContributors"
          @export-report="exportReport"
        />
      </a-tab-pane>

      <a-tab-pane key="code-changes" tab="代码变更">
        <CodeChangesReport
          :loading="loading"
          :top-changed-files="topChangedFiles"
          @export-report="exportReport"
        />
      </a-tab-pane>

      <a-tab-pane key="project-progress" tab="项目进度">
        <ProjectProgressReport
          :loading="loading"
          :milestones="milestones"
          @export-report="exportReport"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import { message, Modal } from 'ant-design-vue' // Changed from ElMessage, ElMessageBox, ElLoading
import ReportsToolbar from '@/components/ReportsView/ReportsToolbar.vue'
import CommitActivityReport from '@/components/ReportsView/CommitActivityReport.vue'
import CodeChangesReport from '@/components/ReportsView/CodeChangesReport.vue'
import ProjectProgressReport from '@/components/ReportsView/ProjectProgressReport.vue'

import repositoriesData from '@/mock/repositoriesData.json'
import reportsCommitStatsData from '@/mock/reportsCommitStats.json'
import reportsTopContributorsData from '@/mock/reportsTopContributors.json'
import reportsTopChangedFilesData from '@/mock/reportsTopChangedFiles.json'
import reportsMilestonesData from '@mock/reportsMilestones.json'

// 数据
const repositories = ref(repositoriesData)
const commitStats = reactive(reportsCommitStatsData)
const topContributors = ref(reportsTopContributorsData)
const topChangedFiles = ref(reportsTopChangedFilesData)
const milestones = ref(reportsMilestonesData)

// 状态变量
const selectedRepo = ref(1)
const activeTab = ref('commit-activity')
const loading = ref(false)
const dateRange = ref<[Dayjs, Dayjs]>([
  dayjs().subtract(30, 'day'),
  dayjs()
])

// 生成报告预览
const generatePreview = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
    message.success('报告预览已生成') // Changed from ElMessage
  }, 1500)
}

// 导出报告
const exportReport = async (type: 'excel' | 'pdf') => {
  const hide = message.loading(`正在导出${type === 'excel' ? 'Excel' : 'PDF'}文件...`, 0)

  try {
    // Placeholder for actual export logic
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate export time
    message.success(`报告已导出为${type === 'excel' ? 'Excel' : 'PDF'}文件`) // Changed from ElMessage
  } catch (error) {
    console.error('导出失败:', error)
    message.error(`导出${type === 'excel' ? 'Excel' : 'PDF'}文件失败`) // Changed from ElMessage
  } finally {
    hide()
  }
}

// 监听标签页变化，触发预览生成
watch(activeTab, (newValue) => {
  nextTick(() => {
    generatePreview()
  })
})

// 组件挂载后
// onMounted(() => {
//   generatePreview(); // Initial preview generation
// });
</script>

<style scoped>
.reports-container {
  width: 100%;
}

.reports-tabs {
  margin-top: 20px;
}
</style>
