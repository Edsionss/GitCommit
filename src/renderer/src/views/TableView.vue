<template>
  <div class="router-view-container">
    <div class="table-view">
      <el-card class="control-panel">
        <template #header>
          <div class="card-header">
            <span>数据控制</span>
          </div>
        </template>
        <div class="controls">
          <div class="filter-section">
            <el-input
              v-model="searchQuery"
              placeholder="搜索提交信息、作者或ID"
              class="search-input"
              clearable
              :prefix-icon="Search"
            >
              <template #prepend>
                <el-select v-model="searchField" placeholder="搜索字段" style="width: 120px">
                  <el-option label="全部字段" value="all" />
                  <el-option label="提交消息" value="message" />
                  <el-option label="作者" value="author" />
                  <el-option label="提交ID" value="commitId" />
                  <el-option label="邮箱" value="email" />
                </el-select>
              </template>
            </el-input>

            <div class="advanced-filters">
              <div class="filter-label">高级筛选：</div>
              <el-tag
                v-if="filters.author"
                closable
                @close="removeFilter('author')"
                class="filter-tag"
                type="primary"
              >
                作者: {{ filters.author }}
              </el-tag>
              <el-tag
                v-if="filters.dateRange"
                closable
                @close="removeFilter('dateRange')"
                class="filter-tag"
                type="success"
              >
                日期: {{ formatDateRange(filters.dateRange) }}
              </el-tag>
              <el-tag
                v-if="filters.repository"
                closable
                @close="removeFilter('repository')"
                class="filter-tag"
                type="warning"
              >
                仓库: {{ filters.repository }}
              </el-tag>
              <el-button v-if="hasFilters" size="small" type="info" @click="clearAllFilters">
                清除全部
              </el-button>
            </div>
          </div>

          <div class="action-section">
            <div class="count-info">总数: {{ filteredData.length }} 条提交记录</div>
            <div class="button-group">
              <el-button type="primary" @click="exportData" :disabled="filteredData.length === 0">
                <el-icon><Download /></el-icon> 导出数据
              </el-button>
              <el-tooltip content="使用统计" placement="top">
                <el-button @click="goToResults" :disabled="filteredData.length === 0">
                  <el-icon><DataAnalysis /></el-icon>
                </el-button>
              </el-tooltip>
              <el-dropdown @command="handleCommand">
                <el-button>
                  <el-icon><Setting /></el-icon>
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="settings">设置</el-dropdown-item>
                    <el-dropdown-item command="toggleColumns">选择列</el-dropdown-item>
                    <el-dropdown-item command="exportCSV">导出为CSV</el-dropdown-item>
                    <el-dropdown-item command="exportExcel">导出为Excel</el-dropdown-item>
                    <el-dropdown-item command="refresh">刷新数据</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 表格组件 -->
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <span>Git提交历史</span>
            <div v-if="selectedRows.length > 0" class="selection-actions">
              <span class="selection-count">已选择 {{ selectedRows.length }} 项</span>
              <el-button size="small" @click="exportSelected" type="primary">导出选中项</el-button>
              <el-button size="small" @click="clearSelection" type="info">取消选择</el-button>
            </div>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="paginatedData"
          stripe
          border
          style="width: 100%"
          :max-height="tableHeight"
          @selection-change="handleSelectionChange"
          :row-class-name="rowClassName"
          highlight-current-row
        >
          <!-- 表格列 -->
          <el-table-column type="selection" width="55" fixed="left" />
          <el-table-column type="index" label="#" width="60" fixed="left" />

          <el-table-column
            v-if="columns.repository"
            prop="repository"
            label="仓库"
            min-width="150"
            sortable
          >
            <template #default="{ row }">
              <div class="repo-cell">
                <el-tag effect="dark">{{ row.repository }}</el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            v-if="columns.shortHash"
            prop="shortHash"
            label="提交ID"
            min-width="100"
            sortable
          >
            <template #default="{ row }">
              <div class="hash-cell">
                <span @click="copyToClipboard(row.commitId)" class="copy-icon">
                  <el-icon><DocumentCopy /></el-icon>
                </span>
                <el-tooltip
                  :content="row.commitId"
                  placement="top"
                  :show-after="500"
                  :hide-after="2000"
                >
                  <span class="hash-value">{{ row.shortHash }}</span>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            v-if="columns.author"
            prop="author"
            label="作者"
            min-width="120"
            sortable
          >
            <template #default="{ row }">
              <div
                class="author-cell"
                @click="applyFilter('author', row.author)"
                :title="`筛选作者: ${row.author}`"
              >
                <el-avatar :size="24" class="author-avatar">
                  {{ row.author ? row.author.substring(0, 1).toUpperCase() : '?' }}
                </el-avatar>
                <span class="author-name">{{ row.author }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            v-if="columns.email"
            prop="email"
            label="邮箱"
            min-width="180"
            show-overflow-tooltip
          />

          <el-table-column v-if="columns.date" prop="date" label="日期" min-width="180" sortable>
            <template #default="{ row }">
              <div
                class="date-cell"
                @click="applyFilter('dateRange', [row.date, row.date])"
                :title="`筛选日期: ${formatDate(row.date)}`"
              >
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(row.date) }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            v-if="columns.message"
            prop="message"
            label="提交消息"
            min-width="300"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div class="message-cell">
                <span v-if="hasTags(row.message)" class="message-tags">
                  <el-tag
                    v-for="tag in extractTags(row.message)"
                    :key="tag"
                    size="small"
                    class="message-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </span>
                <span class="message-text">{{ cleanMessage(row.message) }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            v-if="columns.filesChanged"
            label="文件变更"
            min-width="100"
            :formatter="formatNumber"
            prop="filesChanged"
            sortable
          />

          <el-table-column
            v-if="columns.insertions"
            label="新增"
            min-width="80"
            prop="insertions"
            sortable
          >
            <template #default="{ row }">
              <span class="insertion">+{{ row.insertions }}</span>
            </template>
          </el-table-column>

          <el-table-column
            v-if="columns.deletions"
            label="删除"
            min-width="80"
            prop="deletions"
            sortable
          >
            <template #default="{ row }">
              <span class="deletion">-{{ row.deletions }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <div class="action-cell">
                <el-tooltip content="查看详情" placement="top">
                  <el-button circle size="small" @click="viewDetails(row)">
                    <el-icon><View /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="复制ID" placement="top">
                  <el-button circle size="small" @click="copyToClipboard(row.commitId)">
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页控件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredData.length"
            background
          />
        </div>
      </el-card>

      <!-- 详情抽屉 -->
      <el-drawer v-model="detailsVisible" title="提交详情" size="50%" direction="rtl">
        <div v-if="selectedCommit" class="commit-details">
          <el-descriptions border column="1" :title="`提交 #${selectedCommit.shortHash}`">
            <el-descriptions-item label="提交ID">
              <div class="copy-with-button">
                <span>{{ selectedCommit.commitId }}</span>
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="copyToClipboard(selectedCommit.commitId)"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="仓库">{{
              selectedCommit.repository
            }}</el-descriptions-item>
            <el-descriptions-item label="作者">
              <div class="commit-author">
                <el-avatar :size="24">
                  {{ selectedCommit.author.substring(0, 1).toUpperCase() }}
                </el-avatar>
                <span>{{ selectedCommit.author }}</span>
                <span class="email" v-if="selectedCommit.email">
                  &lt;{{ selectedCommit.email }}&gt;
                </span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="日期">
              {{ formatDate(selectedCommit.date) }}
            </el-descriptions-item>
            <el-descriptions-item label="提交消息">
              <div class="commit-message">
                <div v-if="hasTags(selectedCommit.message)" class="message-tags">
                  <el-tag
                    v-for="tag in extractTags(selectedCommit.message)"
                    :key="tag"
                    size="small"
                    class="message-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                <p class="commit-title">{{ cleanMessage(selectedCommit.message) }}</p>
                <pre v-if="selectedCommit.body" class="commit-body">{{ selectedCommit.body }}</pre>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="文件变更">
              <div class="commit-stats">
                <el-tag type="info">{{ selectedCommit.filesChanged }} 个文件</el-tag>
                <el-tag type="success">+{{ selectedCommit.insertions }}</el-tag>
                <el-tag type="danger">-{{ selectedCommit.deletions }}</el-tag>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-drawer>

      <!-- 列选择对话框 -->
      <el-dialog v-model="columnDialogVisible" title="选择显示列" width="400px">
        <el-checkbox-group v-model="selectedColumns">
          <div class="column-dialog-content">
            <el-checkbox v-for="col in availableColumns" :key="col.value" :value="col.value">
              {{ col.label }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="columnDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="applyColumnSelection">确认</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onMounted, nextTick } from 'vue'
import { gitService } from '../services/GitService'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {
  Search,
  Calendar,
  Download,
  Setting,
  View,
  DocumentCopy,
  DataAnalysis,
  ArrowDown,
  Delete
} from '@element-plus/icons-vue'

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
      ElMessage.error('加载提交数据失败')
      loading.value = false
    }
  } else {
    ElMessage.warning('没有找到提交数据，请先扫描仓库')
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
      ElMessage.success('已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

// 方法: 导出数据
const exportData = () => {
  ElMessageBox.prompt('请输入文件名', '导出数据', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputValue: `git_commits_${dayjs().format('YYYYMMDD')}`
  })
    .then(({ value }) => {
      if (!value) {
        ElMessage.warning('请输入有效的文件名')
        return
      }

      gitService
        .exportData(filteredData.value, 'json', value)
        .then((result) => {
          if (result) {
            ElMessage.success(`数据已导出到: ${result}`)
          }
        })
        .catch((error) => {
          console.error('导出失败:', error)
          ElMessage.error('导出失败')
        })
    })
    .catch(() => {
      // 用户取消
    })
}

// 方法: 导出选中数据
const exportSelected = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }

  ElMessageBox.prompt('请输入文件名', '导出选中数据', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputValue: `git_commits_selected_${dayjs().format('YYYYMMDD')}`
  })
    .then(({ value }) => {
      if (!value) {
        ElMessage.warning('请输入有效的文件名')
        return
      }

      gitService
        .exportData(selectedRows.value, 'json', value)
        .then((result) => {
          if (result) {
            ElMessage.success(`选中数据已导出到: ${result}`)
          }
        })
        .catch((error) => {
          console.error('导出失败:', error)
          ElMessage.error('导出失败')
        })
    })
    .catch(() => {
      // 用户取消
    })
}

// 方法: 处理选择变化
const handleSelectionChange = (rows: Commit[]) => {
  selectedRows.value = rows
}

// 方法: 清除选择
const clearSelection = () => {
  // 调用el-table的clearSelection方法
  const tableRef = document.querySelector('.el-table') as any
  if (tableRef && tableRef.__vue__ && typeof tableRef.__vue__.clearSelection === 'function') {
    tableRef.__vue__.clearSelection()
  }
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
          ElMessage.success(`数据已导出到: ${result}`)
        }
      })
      .catch((error) => {
        console.error('导出失败:', error)
        ElMessage.error('导出失败')
      })
  } else if (command === 'exportExcel') {
    gitService
      .exportData(filteredData.value, 'excel')
      .then((result) => {
        if (result) {
          ElMessage.success(`数据已导出到: ${result}`)
        }
      })
      .catch((error) => {
        console.error('导出失败:', error)
        ElMessage.error('导出失败')
      })
  } else if (command === 'refresh') {
    loadCommits()
  }
}

// 方法: 应用列选择
const applyColumnSelection = () => {
  // 更新列显示状态
  for (const key in columns) {
    columns[key as keyof typeof columns] = selectedColumns.value.includes(key)
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

.search-input :deep(.el-input__wrapper) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.search-input :deep(.el-input-group__prepend) {
  background-color: #f8f9fa;
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

.table-card :deep(.el-card__body) {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

.repo-cell :deep(.el-tag) {
  transition: all var(--transition-normal);
}

.repo-cell:hover :deep(.el-tag) {
  transform: scale(1.05);
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

/* Element Plus 样式覆盖 */
:deep(.el-table) {
  --el-table-border-color: var(--border-color);
  --el-table-header-bg-color: #f8f9fa;
  --el-table-row-hover-bg-color: var(--hover-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
}

:deep(.el-table th) {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  background-color: #f8f9fa;
}

:deep(.el-table .el-table__header-wrapper) {
  border-bottom: var(--border);
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background-color: var(--hover-bg);
}

:deep(.el-table .el-button.is-circle) {
  opacity: 0.7;
  transition: all var(--transition-normal);
}

:deep(.el-table .el-button.is-circle:hover) {
  transform: rotate(15deg);
}

:deep(.el-pagination) {
  --el-pagination-button-color: var(--text-secondary);
  --el-pagination-hover-color: var(--primary-color);
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: var(--primary-color);
}

:deep(.el-avatar) {
  --el-avatar-bg-color: var(--primary-light);
  --el-avatar-text-color: var(--primary-color);
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: var(--spacing-md);
  border-bottom: var(--border);
}

:deep(.el-descriptions__label) {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

:deep(.el-descriptions__cell) {
  padding: 16px 12px;
}

:deep(.el-descriptions) {
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-md);
}

:deep(.el-descriptions__header) {
  margin-bottom: var(--spacing-md);
}

:deep(.el-descriptions__title) {
  font-weight: var(--font-weight-semibold);
  color: var(--primary-color);
  font-size: var(--font-size-lg);
}
</style>
