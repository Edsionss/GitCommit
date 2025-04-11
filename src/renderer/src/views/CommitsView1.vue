<template>
  <div class="commits-container">
    <!-- 右侧导航 -->
    <GitNavigationComponent
      :navItems="navItems"
      :activeSection="activeSection"
      @update:activeSection="activeSection = $event"
      @scrollTo="scrollToSection"
    />

    <!-- 主内容区域 -->
    <div class="filter-section" id="filter-section">
      <!-- 筛选组件 -->
      <GitFilterComponent
        ref="filterComponent"
        @update:repoPath="repoPath = $event"
        @update:dateRange="dateRange = $event"
        @update:selectedAuthors="selectedAuthors = $event"
        @update:exportPath="exportPath = $event"
        @update:exportFields="exportFields = $event"
        @update:exportFormat="exportFormat = $event"
        @update:verifyGitRepo="verifyGitRepo = $event"
        @scanAuthors="handleScanAuthors"
        @scanCommits="handleScanCommits"
      />

      <!-- 日志组件 -->
      <GitLogsComponent ref="logsComponent" @stopScanning="handleStopScanning" />

      <!-- 结果组件 -->
      <GitResultsComponent
        ref="resultsComponent"
        :commits="commits"
        :exportPath="exportPath"
        @exportResults="handleExportResults"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import GitFilterComponent from '@/components/CommitView/GitFilterComponent.vue'
import GitLogsComponent from '@/components/CommitView/GitLogsComponent.vue'
import GitResultsComponent from '@/components/CommitView/GitResultsComponent.vue'
import GitNavigationComponent from '@/components/CommitView/GitNavigationComponent.vue'

// 模拟数据接口
interface CommitFile {
  path: string
  status: string
  additions: number
  deletions: number
}

interface Commit {
  hash: string
  author: string
  email: string
  date: string
  message: string
  files: CommitFile[]
  additions: number
  deletions: number
}

// 全局状态变量
const repoPath = ref('')
const dateRange = ref([])
const selectedAuthors = ref([])
const commits = ref<Commit[]>([])
const exportPath = ref('')
const exportFormat = ref('csv')
const exportFields = ref(['hash', 'author', 'date', 'message', 'additions', 'deletions'])
const verifyGitRepo = ref(true)

// 组件引用
const filterComponent = ref<InstanceType<typeof GitFilterComponent> | null>(null)
const logsComponent = ref<InstanceType<typeof GitLogsComponent> | null>(null)
const resultsComponent = ref<InstanceType<typeof GitResultsComponent> | null>(null)

// 导航相关
const navItems = [
  { id: 'filter-section', label: '筛选' },
  { id: 'logs-section', label: '日志' },
  { id: 'results-section', label: '结果' }
]
const activeSection = ref('filter-section')

// 滚动到指定区域
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    activeSection.value = sectionId
  }
}

// 处理扫描作者
const handleScanAuthors = async (repoPath: string) => {
  if (!logsComponent.value) return
  logsComponent.value.addLog('开始扫描作者...')

  try {
    // 模拟扫描作者过程
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // 模拟作者列表
    const authorsList = [
      'John Doe <john@example.com>',
      'Jane Smith <jane@example.com>',
      'Alex Johnson <alex@example.com>',
      'Mike Zhang <mike@example.com>',
      'Sarah Chen <sarah@example.com>'
    ]

    if (filterComponent.value) {
      filterComponent.value.setAuthorsList(authorsList)
    }

    logsComponent.value.addLog(`扫描完成，找到 ${authorsList.length} 位作者`)
    ElMessage.success(`成功扫描到 ${authorsList.length} 位作者`)
  } catch (error) {
    logsComponent.value.addLog(`扫描作者失败: ${error}`)
    ElMessage.error('扫描作者失败')
  } finally {
    if (filterComponent.value) {
      filterComponent.value.setScanningAuthorsState(false)
    }
  }
}

// 处理扫描提交记录
const handleScanCommits = async (params: any) => {
  if (!logsComponent.value || !filterComponent.value) return

  logsComponent.value.setScanningState(true)
  logsComponent.value.setScanProgress(0)
  logsComponent.value.setScanStatus('准备中')
  commits.value = []

  if (resultsComponent.value) {
    resultsComponent.value.resetPagination()
  }

  logsComponent.value.addLog(`开始扫描Git仓库: ${params.repoPath}`)
  logsComponent.value.addLog(
    `时间范围: ${params.dateRange[0] || '不限'} 至 ${params.dateRange[1] || '不限'}`
  )
  logsComponent.value.addLog(
    `选中作者: ${params.selectedAuthors.length > 0 ? params.selectedAuthors.join(', ') : '所有作者'}`
  )

  if (params.verifyGitRepo) {
    logsComponent.value.addLog('正在验证Git仓库...')
    // 在实际应用中，这里应该有真实的验证逻辑
    await new Promise((resolve) => setTimeout(resolve, 500))
    logsComponent.value.addLog('Git仓库验证通过')
  }

  try {
    // 模拟扫描过程
    logsComponent.value.setScanStatus('验证仓库')
    await simulateProgress(0, 10)
    logsComponent.value.addLog('仓库验证通过')

    logsComponent.value.setScanStatus('读取提交历史')
    await simulateProgress(10, 30)
    logsComponent.value.addLog('成功读取提交历史')

    logsComponent.value.setScanStatus('处理提交记录')
    await simulateProgress(30, 60)
    logsComponent.value.addLog('正在处理提交记录')

    logsComponent.value.setScanStatus('统计变更')
    await simulateProgress(60, 90)
    logsComponent.value.addLog('正在统计变更')

    logsComponent.value.setScanStatus('生成结果')
    await simulateProgress(90, 100)

    // 模拟结果
    commits.value = generateMockCommits(20)

    logsComponent.value.setScanStatus('完成')
    logsComponent.value.addLog(`扫描完成，共找到 ${commits.value.length} 条提交记录`)
    ElMessage.success(`成功扫描到 ${commits.value.length} 条提交记录`)
  } catch (error) {
    logsComponent.value.setScanStatus('失败')
    logsComponent.value.addLog(`扫描失败: ${error}`)
    ElMessage.error('扫描失败')
  } finally {
    logsComponent.value.setScanningState(false)
    filterComponent.value.setScanningState(false)
  }
}

// 处理停止扫描
const handleStopScanning = () => {
  if (logsComponent.value && filterComponent.value) {
    logsComponent.value.setScanningState(false)
    filterComponent.value.setScanningState(false)
    logsComponent.value.setScanStatus('已停止')
    logsComponent.value.addLog('用户手动停止了扫描')
    ElMessage.warning('扫描已停止')
  }
}

// 处理导出结果
const handleExportResults = () => {
  if (logsComponent.value) {
    ElMessage.success(`已成功导出到 ${exportPath.value}`)
    logsComponent.value.addLog(`已将 ${commits.value.length} 条记录导出到 ${exportPath.value}`)
  }
}

// 模拟进度
const simulateProgress = async (start: number, end: number) => {
  if (!logsComponent.value) return

  const steps = 5
  const increment = (end - start) / steps

  for (let i = 0; i <= steps; i++) {
    logsComponent.value.setScanProgress(Math.min(start + increment * i, end))
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
}

// 生成模拟提交记录
const generateMockCommits = (count: number): Commit[] => {
  const mockCommits: Commit[] = []
  const authors = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Mike Zhang', 'Sarah Chen']
  const emails = [
    'john@example.com',
    'jane@example.com',
    'alex@example.com',
    'mike@example.com',
    'sarah@example.com'
  ]

  for (let i = 0; i < count; i++) {
    const authorIndex = Math.floor(Math.random() * authors.length)
    const fileCount = Math.floor(Math.random() * 5) + 1
    const files: CommitFile[] = []
    let totalAdditions = 0
    let totalDeletions = 0

    for (let j = 0; j < fileCount; j++) {
      const additions = Math.floor(Math.random() * 50)
      const deletions = Math.floor(Math.random() * 20)
      totalAdditions += additions
      totalDeletions += deletions

      files.push({
        path: `src/components/file${j + 1}.vue`,
        status: ['added', 'modified', 'deleted'][Math.floor(Math.random() * 3)],
        additions,
        deletions
      })
    }

    // 生成随机日期（过去30天内）
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))

    mockCommits.push({
      hash: Math.random().toString(16).substring(2, 42),
      author: authors[authorIndex],
      email: emails[authorIndex],
      date: date.toISOString().split('T')[0],
      message: `提交示例 #${i + 1}: 实现新功能或修复问题`,
      files,
      additions: totalAdditions,
      deletions: totalDeletions
    })
  }

  return mockCommits
}
</script>

<style scoped>
.commits-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  padding-right: 60px; /* 为右侧导航腾出空间 */
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 全局滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(245, 247, 250, 0.4);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background-color: #909399;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #606266;
}

/* 确保全局滚动条和局部滚动条一致 */
html,
body {
  scrollbar-width: thin;
  scrollbar-color: #909399 rgba(245, 247, 250, 0.4);
}
</style>
