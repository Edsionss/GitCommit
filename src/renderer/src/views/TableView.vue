<template>
  <div class="router-view-container">
    <div class="table-view">
      <TableControlPanel
        v-model:searchQuery="searchQuery"
        v-model:searchField="searchField"
        :filters="filters"
        :has-filters="hasFilters"
        :filtered-data-length="filteredData.length"
        :format-date-range="formatDateRange"
        @removeFilter="removeFilter"
        @clearAllFilters="clearAllFilters"
        @exportData="exportData"
        @goToResults="goToResults"
        @handleCommand="handleCommand"
      />

      <CommitTable
        :loading="loading"
        :paginated-data="paginatedData"
        :table-height="tableHeight"
        :columns="columns"
        :format-number="formatNumber"
        :format-date="formatDate"
        :format-date-range="formatDateRange"
        :has-tags="hasTags"
        :extract-tags="extractTags"
        :clean-message="cleanMessage"
        :copy-to-clipboard="copyToClipboard"
        :view-details="viewDetails"
        :selected-rows="selectedRows"
        :current-page="currentPage"
        :page-size="pageSize"
        :filtered-data-length="filteredData.length"
        @update:currentPage="currentPage = $event"
        @update:pageSize="pageSize = $event"
        @exportSelected="exportSelected"
        @clearSelection="clearSelection"
        @selectionChange="handleSelectionChange"
        @applyFilter="applyFilter"
        @tableChange="handleTableChange"
      />

      <!-- 详情抽屉 -->
      <CommitDetailsDrawer
        :visible="detailsVisible"
        :commit="selectedCommit"
        :format-date="formatDate"
        :has-tags="hasTags"
        :extract-tags="extractTags"
        :clean-message="cleanMessage"
        :copy-to-clipboard="copyToClipboard"
        @update:visible="detailsVisible = $event"
      />

      <ColumnSelectionDialog
        :visible="columnDialogVisible"
        :available-columns="availableColumns"
        :selected-columns="selectedColumns"
        @update:visible="columnDialogVisible = $event"
        @applyColumnSelection="applyColumnSelection"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onMounted, nextTick, h } from 'vue'
import { gitService } from '@services/GitService'
import { useRouter } from 'vue-router'
import { message, Modal, Input } from 'ant-design-vue'
import dayjs from 'dayjs'
import TableControlPanel from '@/components/TableView/TableControlPanel.vue'
import CommitTable from '@/components/TableView/CommitTable.vue'
import CommitDetailsDrawer from '@/components/TableView/CommitDetailsDrawer.vue'
import ColumnSelectionDialog from '@/components/TableView/ColumnSelectionDialog.vue'

interface Commit {
  repository: string
  repoPath: string
  commitId: string
  shortHash: string
  author: string
  email: string
  date: string
  message: string
  body: string
  filesChanged: number
  insertions: number
  deletions: number
}

const router = useRouter()
const loading = ref(false)
const tableHeight = ref(500)
const commits = ref<Commit[]>([])
const searchQuery = ref('')
const searchField = ref('all')
const currentPage = ref(1)
const pageSize = ref(20)
const detailsVisible = ref(false)
const selectedCommit = ref<Commit | null>(null)
const selectedRows = ref<Commit[]>([])
const columnDialogVisible = ref(false)

// 过滤器
const filters = reactive({
  author: '',
  dateRange: null as [string, string] | null,
  repository: ''
})

// 定义列
const availableColumns = [
  { label: '仓库', value: 'repository' },
  { label: '提交ID', value: 'shortHash' },
  { label: '作者', value: 'author' },
  { label: '邮箱', value: 'email' },
  { label: '日期', value: 'date' },
  { label: '提交消息', value: 'message' },
  { label: '变更文件数', value: 'filesChanged' },
  { label: '新增行数', value: 'insertions' },
  { label: '删除行数', value: 'deletions' }
]

const selectedColumns = ref([
  'repository',
  'shortHash',
  'author',
  'date',
  'message',
  'filesChanged',
  'insertions',
  'deletions'
])

// 可见列状态
const columns = reactive({
  repository: true,
  shortHash: true,
  author: true,
  email: false,
  date: true,
  message: true,
  filesChanged: true,
  insertions: true,
  deletions: true
})

// 计算属性: 是否有过滤器
const hasFilters = computed(() => {
  return filters.author || filters.dateRange || filters.repository
})

// 计算属性: 过滤后的数据
const filteredData = computed(() => {
  let result = [...commits.value]

  // 应用搜索
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((commit) => {
      if (searchField.value === 'all') {
        return (
          (commit.message && commit.message.toLowerCase().includes(query)) ||
          (commit.author && commit.author.toLowerCase().includes(query)) ||
          (commit.commitId && commit.commitId.toLowerCase().includes(query)) ||
          (commit.email && commit.email.toLowerCase().includes(query))
        )
      } else {
        return (
          commit[searchField.value as keyof Commit] &&
          String(commit[searchField.value as keyof Commit])
            .toLowerCase()
            .includes(query)
        )
      }
    })
  }

  // 应用过滤器
  if (filters.author) {
    result = result.filter((commit) => commit.author === filters.author)
  }

  if (filters.repository) {
    result = result.filter((commit) => commit.repository === filters.repository)
  }

  if (filters.dateRange) {
    const startDate = dayjs(filters.dateRange[0])
    const endDate = dayjs(filters.dateRange[1]).endOf('day') // 设置到当天结束
    result = result.filter((commit) => {
      const commitDate = dayjs(commit.date)
      return commitDate.isAfter(startDate) && commitDate.isBefore(endDate)
    })
  }

  return result
})

// 计算属性: 分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 监听搜索条件变化，重置分页
watch([searchQuery, filters], () => {
  currentPage.value = 1
})

// 生命周期钩子
onMounted(async () => {
  calculateTableHeight()
  window.addEventListener('resize', calculateTableHeight)
  loadCommits()

  // 从localStorage获取列配置
  const savedColumns = localStorage.getItem('tableColumns')
  if (savedColumns) {
    try {
      const parsedColumns = JSON.parse(savedColumns)
      for (const key in columns) {
        if (typeof parsedColumns[key] === 'boolean') {
          columns[key] = parsedColumns[key]
        }
      }
      selectedColumns.value = availableColumns
        .filter((col) => columns[col.value as keyof typeof columns])
        .map((col) => col.value)
    } catch (error) {
      console.error('解析列配置失败:', error)
    }
  }
})

// 方法: 加载提交记录
const loadCommits = () => {
  loading.value = true
  const storedCommits = localStorage.getItem('gitCommits')

  if (storedCommits) {
    try {
      commits.value = JSON.parse(storedCommits)
      loading.value = false
    } catch (error) {
      console.error('解析提交数据失败:', error)
      message.error('加载提交数据失败')
      loading.value = false
    }
  } else {
    message.warning('没有找到提交数据，请先扫描仓库')
    loading.value = false
  }
}

// 方法: 计算表格高度
const calculateTableHeight = () => {
  nextTick(() => {
    const windowHeight = window.innerHeight
    // 减去其他元素的高度，如头部控制面板、分页等
    tableHeight.value = windowHeight - 300
  })
}

// 方法: 格式化数字
const formatNumber = (row: Commit, column: { property: string }) => {
  const value = row[column.property as keyof Commit]
  return typeof value === 'number' ? value.toLocaleString() : value
}

// 方法: 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = dayjs(dateString)

  if (date.isValid()) {
    return date.format('YYYY-MM-DD HH:mm:ss')
  }

  return dateString
}

// 方法: 格式化日期范围
const formatDateRange = (range: [string, string] | null) => {
  if (!range) return ''
  return `${dayjs(range[0]).format('MM-DD')} 至 ${dayjs(range[1]).format('MM-DD')}`
}

// 方法: 检查是否有标签
const hasTags = (message: string) => {
  if (!message) return false
  return message.match(/\[(.*?)\]/) !== null
}

// 方法: 提取标签
const extractTags = (message: string) => {
  if (!message) return []
  const matches = message.match(/\[(.*?)\]/g)
  if (!matches) return []

  return matches.map((tag) => tag.replace(/[\[\]]/g, ''))
}

// 方法: 清理消息
const cleanMessage = (message: string) => {
  if (!message) return ''
  return message.replace(/\[(.*?)\]/g, '').trim()
}

// 方法: 应用过滤器
const applyFilter = (type: string, value: any) => {
  if (type === 'author') {
    filters.author = value
  } else if (type === 'dateRange') {
    filters.dateRange = value
  } else if (type === 'repository') {
    filters.repository = value
  }
}

// 方法: 移除过滤器
const removeFilter = (type: string) => {
  if (type === 'author') {
    filters.author = ''
  } else if (type === 'dateRange') {
    filters.dateRange = null
  } else if (type === 'repository') {
    filters.repository = ''
  }
}

// 方法: 清除所有过滤器
const clearAllFilters = () => {
  filters.author = ''
  filters.dateRange = null
  filters.repository = ''
}

// 方法: 查看详情
const viewDetails = (row: Commit) => {
  selectedCommit.value = row
  detailsVisible.value = true
}

// 方法: 复制到剪贴板
const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      message.success('已复制到剪贴板')
    })
    .catch(() => {
      message.error('复制失败')
    })
}

// 方法: 导出数据
const exportData = () => {
  const defaultFileName = `git_commits_${dayjs().format('YYYYMMDD')}`
  let fileName = defaultFileName
  Modal.confirm({
    title: '导出数据',
    content: h('div', [
      h('p', '请输入文件名:'),
      h(Input, {
        defaultValue: defaultFileName,
        onChange: (e) => {
          fileName = e.target.value
        }
      })
    ]),
    onOk() {
      if (!fileName) {
        message.warning('请输入有效的文件名')
        return Promise.reject()
      }
      gitService
        .exportData(filteredData.value, 'json', fileName)
        .then((result) => {
          if (result) {
            message.success(`数据已导出到: ${result}`)
          }
        })
        .catch((error) => {
          console.error('导出失败:', error)
          message.error('导出失败')
        })
    },
    onCancel() {
      // 用户取消
    }
  })
}

// 方法: 导出选中数据
const exportSelected = () => {
  if (selectedRows.value.length === 0) {
    message.warning('请先选择要导出的数据')
    return
  }

  const defaultFileNameSelected = `git_commits_selected_${dayjs().format('YYYYMMDD')}`
  let fileNameSelected = defaultFileNameSelected
  Modal.confirm({
    title: '导出选中数据',
    content: h('div', [
      h('p', '请输入文件名:'),
      h(Input, {
        defaultValue: defaultFileNameSelected,
        onChange: (e) => {
          fileNameSelected = e.target.value
        }
      })
    ]),
    onOk() {
      if (!fileNameSelected) {
        message.warning('请输入有效的文件名')
        return Promise.reject()
      }
      gitService
        .exportData(selectedRows.value, 'json', fileNameSelected)
        .then((result) => {
          if (result) {
            message.success(`选中数据已导出到: ${result}`)
          }
        })
        .catch((error) => {
          console.error('导出失败:', error)
          message.error('导出失败')
        })
    },
    onCancel() {
      // 用户取消
    }
  })
}

// 方法: 处理选择变化
const handleSelectionChange = (rows: Commit[]) => {
  selectedRows.value = rows
}

// 方法: 清除选择
const clearSelection = () => {
  selectedRows.value = []
}

// 方法: 行样式
const rowClassName = ({ row }: { row: Commit }) => {
  // 根据条件设置不同的行样式
  return ''
}

// 方法: 前往结果页
const goToResults = () => {
  router.push('/results')
}

// 方法: 处理命令
const handleCommand = (command: string) => {
  if (command === 'settings') {
    router.push('/')
  } else if (command === 'toggleColumns') {
    columnDialogVisible.value = true
  } else if (command === 'exportCSV') {
    gitService
      .exportData(filteredData.value, 'csv')
      .then((result) => {
        if (result) {
          message.success(`数据已导出到: ${result}`)
        }
      })
      .catch((error) => {
        console.error('导出失败:', error)
        message.error('导出失败')
      })
  } else if (command === 'exportExcel') {
    gitService
      .exportData(filteredData.value, 'excel')
      .then((result) => {
        if (result) {
          message.success(`数据已导出到: ${result}`)
        }
      })
      .catch((error) => {
        console.error('导出失败:', error)
        message.error('导出失败')
      })
  } else if (command === 'refresh') {
    loadCommits()
  }
}

// 方法: 应用列选择
const applyColumnSelection = (newSelectedColumns: string[]) => {
  selectedColumns.value = newSelectedColumns
  // 更新列显示状态
  for (const key in columns) {
    columns[key as keyof typeof columns] = newSelectedColumns.includes(key)
  }

  // 保存列配置到localStorage
  localStorage.setItem('tableColumns', JSON.stringify(columns))

  columnDialogVisible.value = false
}
</script>

<style scoped>
.router-view-container {
  width: 100%;
  padding: var(--spacing-md);
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--spacing-md);
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

.control-panel {
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.control-panel:hover {
  box-shadow: var(--shadow-md);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.search-input {
  width: 100%;
}

.advanced-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 32px;
  background-color: #f8f9fa;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
}

.filter-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-right: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
}

.filter-tag {
  cursor: pointer;
  transition: var(--transition-bounce);
  position: relative;
}

.filter-tag:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-sm);
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-top: var(--border);
  margin-top: var(--spacing-sm);
}

.count-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background-color: #f8f9fa;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  font-weight: var(--font-weight-medium);
}

.button-group {
  display: flex;
  gap: var(--spacing-sm);
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: var(--border) !important;
  transition: box-shadow var(--transition-normal);
}

.table-card:hover {
  box-shadow: var(--shadow-md);
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md);
  background: white;
  border-top: var(--border);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 表格单元格样式 */
.repo-cell {
  display: flex;
  align-items: center;
}

.hash-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: 'Fira Code', monospace;
}

.hash-value {
  cursor: pointer;
  transition: color var(--transition-fast);
}

.hash-value:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.author-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 4px 0;
}

.author-cell:hover {
  color: var(--primary-color);
  transform: translateX(3px);
}

.author-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.author-avatar {
  background-color: var(--primary-light);
  color: var(--primary-color);
  transition: transform var(--transition-normal);
}

.author-cell:hover .author-avatar {
  transform: scale(1.1);
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.date-cell:hover {
  color: var(--primary-color);
  transform: translateX(3px);
}

.message-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.message-tag {
  font-size: 10px;
  height: 20px;
  line-height: 18px;
  transition: all var(--transition-fast);
}

.message-tag:hover {
  transform: scale(1.05);
}

.message-text {
  line-height: 1.5;
}

.insertion {
  color: var(--success);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
}

.deletion {
  color: var(--danger);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
}

tr:hover .insertion {
  text-shadow: 0 0 1px rgba(46, 204, 113, 0.5);
}

tr:hover .deletion {
  text-shadow: 0 0 1px rgba(231, 76, 60, 0.5);
}

.action-cell {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background-color: var(--info-light);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  animation: fadeInDown 0.3s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.selection-count {
  font-size: var(--font-size-sm);
  color: var(--info);
  font-weight: var(--font-weight-medium);
}

.copy-icon {
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.copy-icon:hover {
  color: var(--primary-color);
  transform: scale(1.2);
}

/* 提交详情样式 */
.commit-details {
  padding: var(--spacing-md);
}

.commit-author {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.email {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.commit-message {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.commit-title {
  font-weight: var(--font-weight-semibold);
  margin: 0;
  line-height: 1.5;
}

.commit-body {
  margin: 0;
  white-space: pre-wrap;
  font-family: 'Fira Code', monospace;
  font-size: var(--font-size-sm);
  background-color: #f8f9fa;
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  border-left: 3px solid var(--border-color);
}

.commit-stats {
  display: flex;
  gap: var(--spacing-sm);
}

.copy-with-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: 'Fira Code', monospace;
  font-size: var(--font-size-sm);
  background-color: #f8f9fa;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  overflow-x: auto;
}

/* 列选择对话框样式 */
.column-dialog-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}
</style>
