<template>
  <div class="filter-component">
    <el-card class="filter-card">
      <template #header>
        <div class="card-header">
          <span>Git提交记录筛选</span>
          <el-button type="primary" @click="startScan" :loading="scanning"> 开始扫描 </el-button>
        </div>
      </template>

      <!-- 仓库选择 -->
      <div class="filter-item">
        <div class="filter-label-row">
          <div class="filter-label">Git仓库路径</div>
          <div class="input-with-button">
            <el-input v-model="repoPath" placeholder="请输入Git仓库路径" clearable style="flex: 1">
              <template #append>
                <el-button @click="selectRepoPath">
                  <el-icon><Folder /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="paths-options" v-if="savedRepoPaths.length > 0">
          <div class="paths-options-row">
            <div class="verify-git-toggle">
              <el-switch
                v-model="verifyGitRepo"
                active-text="验证Git目录"
                inactive-text="不验证目录"
              />
            </div>
            <div class="saved-paths">
              <div class="saved-paths-label">历史路径:</div>
              <el-tag
                v-for="path in savedRepoPaths"
                :key="path"
                class="saved-path-tag"
                closable
                @click="repoPath = path"
                @close="removeSavedPath(path, 'repo')"
              >
                {{ getShortPath(path) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      <!-- 时间范围选择 -->
      <div class="filter-item">
        <div class="filter-label-row">
          <div class="filter-label">提交时间范围</div>
          <div class="quick-date-buttons">
            <el-button-group>
              <el-button
                size="small"
                :type="quickDateType === 'all' ? 'primary' : 'default'"
                @click="selectQuickDate('all')"
                >所有时间</el-button
              >
              <el-button
                size="small"
                :type="quickDateType === 'today' ? 'primary' : 'default'"
                @click="selectQuickDate('today')"
                >今天</el-button
              >
              <el-button
                size="small"
                :type="quickDateType === 'week' ? 'primary' : 'default'"
                @click="selectQuickDate('week')"
                >本周</el-button
              >
              <el-button
                size="small"
                :type="quickDateType === 'month' ? 'primary' : 'default'"
                @click="selectQuickDate('month')"
                >本月</el-button
              >
              <el-button
                size="small"
                :type="quickDateType === 'quarter' ? 'primary' : 'default'"
                @click="selectQuickDate('quarter')"
                >本季度</el-button
              >
              <el-button
                size="small"
                :type="quickDateType === 'year' ? 'primary' : 'default'"
                @click="selectQuickDate('year')"
                >本年</el-button
              >
              <el-button
                size="small"
                :type="quickDateType === 'custom' ? 'primary' : 'default'"
                @click="selectQuickDate('custom')"
                >自定义</el-button
              >
            </el-button-group>
          </div>
        </div>
        <div class="filter-control">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabled="quickDateType !== 'custom'"
            :shortcuts="dateShortcuts"
            @change="onDateRangeChange"
          />
        </div>
      </div>

      <!-- 提交作者选择 -->
      <div class="filter-item">
        <div class="filter-label-row">
          <div class="filter-label">提交作者</div>
          <div class="input-with-button">
            <el-select
              v-model="selectedAuthors"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="选择或输入提交作者"
              style="flex: 1"
            >
              <el-option
                v-for="author in authorsList"
                :key="author"
                :label="author"
                :value="author"
              />
            </el-select>
            <el-button @click="scanAuthors" :loading="scanningAuthors" style="margin-left: 8px">
              <el-icon><Refresh /></el-icon> 扫描当前仓库作者
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 高级筛选 -->
    <el-collapse v-model="activeCollapse">
      <el-collapse-item title="高级筛选" name="advanced">
        <div class="advanced-filters">
          <div class="filter-item">
            <div class="filter-label">导出路径</div>
            <div class="filter-control">
              <el-input v-model="exportPath" placeholder="请选择导出路径" clearable>
                <template #append>
                  <el-button @click="selectExportPath">
                    <el-icon><Folder /></el-icon>
                  </el-button>
                </template>
              </el-input>
              <div class="saved-paths" v-if="savedExportPaths.length > 0">
                <div class="saved-paths-label">历史路径:</div>
                <el-tag
                  v-for="path in savedExportPaths"
                  :key="path"
                  class="saved-path-tag"
                  closable
                  @click="exportPath = path"
                  @close="removeSavedPath(path, 'export')"
                >
                  {{ getShortPath(path) }}
                </el-tag>
              </div>
            </div>
          </div>

          <div class="filter-item">
            <div class="filter-label">导出字段选择</div>
            <div class="filter-control">
              <el-checkbox-group v-model="exportFields">
                <el-checkbox value="hash">提交哈希</el-checkbox>
                <el-checkbox value="author">提交作者</el-checkbox>
                <el-checkbox value="email">作者邮箱</el-checkbox>
                <el-checkbox value="date">提交日期</el-checkbox>
                <el-checkbox value="message">提交信息</el-checkbox>
                <el-checkbox value="files">变更文件</el-checkbox>
                <el-checkbox value="additions">新增行数</el-checkbox>
                <el-checkbox value="deletions">删除行数</el-checkbox>
              </el-checkbox-group>
            </div>
          </div>

          <div class="filter-item">
            <div class="filter-label">导出格式</div>
            <div class="filter-control">
              <el-radio-group v-model="exportFormat">
                <el-radio value="csv">CSV</el-radio>
                <el-radio value="json">JSON</el-radio>
                <el-radio value="txt">TXT</el-radio>
                <el-radio value="html">HTML</el-radio>
                <el-radio value="md">Markdown</el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineEmits } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Folder, Refresh } from '@element-plus/icons-vue'

const emit = defineEmits([
  'update:repoPath',
  'update:dateRange',
  'update:selectedAuthors',
  'update:exportPath',
  'update:exportFields',
  'update:exportFormat',
  'update:verifyGitRepo',
  'scanAuthors',
  'scanCommits'
])

// 状态变量
const repoPath = ref('')
const dateRange = ref([])
const quickDateType = ref('all')
const selectedAuthors = ref([])
const authorsList = ref<string[]>([])
const activeCollapse = ref([''])
const exportPath = ref('')
const exportFormat = ref('csv')
const exportFields = ref(['hash', 'author', 'date', 'message', 'additions', 'deletions'])
const savedRepoPaths = ref<string[]>([])
const savedExportPaths = ref<string[]>([])
const verifyGitRepo = ref(true)
const scanning = ref(false)
const scanningAuthors = ref(false)

// 监听属性变化
const emitUpdates = () => {
  emit('update:repoPath', repoPath.value)
  emit('update:dateRange', dateRange.value)
  emit('update:selectedAuthors', selectedAuthors.value)
  emit('update:exportPath', exportPath.value)
  emit('update:exportFields', exportFields.value)
  emit('update:exportFormat', exportFormat.value)
  emit('update:verifyGitRepo', verifyGitRepo.value)
}

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const today = new Date()
      return [today, today]
    }
  },
  {
    text: '本周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '本月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(1)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [start, end]
    }
  }
]

onMounted(() => {
  // 模拟从本地存储加载保存的路径
  const storedRepoPaths = localStorage.getItem('savedRepoPaths')
  if (storedRepoPaths) {
    savedRepoPaths.value = JSON.parse(storedRepoPaths)
  }

  const storedExportPaths = localStorage.getItem('savedExportPaths')
  if (storedExportPaths) {
    savedExportPaths.value = JSON.parse(storedExportPaths)
  }

  // 初始设置为"所有时间"
  selectQuickDate('all')
})

// 选择仓库路径
const selectRepoPath = async () => {
  // 模拟选择文件夹
  await ElMessageBox.prompt('请输入Git仓库路径', '选择仓库', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputValue: repoPath.value
  })
    .then(({ value }) => {
      if (value) {
        repoPath.value = value
        savePathToHistory(value, 'repo')
        emitUpdates()
      }
    })
    .catch(() => {})
}

// 选择导出路径
const selectExportPath = async () => {
  // 模拟选择文件夹
  await ElMessageBox.prompt('请输入导出路径', '选择导出路径', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputValue: exportPath.value
  })
    .then(({ value }) => {
      if (value) {
        exportPath.value = value
        savePathToHistory(value, 'export')
        emitUpdates()
      }
    })
    .catch(() => {})
}

// 保存路径到历史记录
const savePathToHistory = (path: string, type: 'repo' | 'export') => {
  if (type === 'repo') {
    if (!savedRepoPaths.value.includes(path)) {
      savedRepoPaths.value.unshift(path)
      savedRepoPaths.value = savedRepoPaths.value.slice(0, 5) // 保留最近的5条记录
      localStorage.setItem('savedRepoPaths', JSON.stringify(savedRepoPaths.value))
    }
  } else {
    if (!savedExportPaths.value.includes(path)) {
      savedExportPaths.value.unshift(path)
      savedExportPaths.value = savedExportPaths.value.slice(0, 5) // 保留最近的5条记录
      localStorage.setItem('savedExportPaths', JSON.stringify(savedExportPaths.value))
    }
  }
}

// 从历史记录中移除路径
const removeSavedPath = (path: string, type: 'repo' | 'export') => {
  if (type === 'repo') {
    savedRepoPaths.value = savedRepoPaths.value.filter((p) => p !== path)
    localStorage.setItem('savedRepoPaths', JSON.stringify(savedRepoPaths.value))
  } else {
    savedExportPaths.value = savedExportPaths.value.filter((p) => p !== path)
    localStorage.setItem('savedExportPaths', JSON.stringify(savedExportPaths.value))
  }
}

// 获取路径简短显示
const getShortPath = (path: string) => {
  if (path.length > 25) {
    return path.substring(0, 10) + '...' + path.substring(path.length - 12)
  }
  return path
}

// 扫描作者
const scanAuthors = () => {
  if (!repoPath.value) {
    ElMessage.warning('请先选择Git仓库路径')
    return
  }

  scanningAuthors.value = true
  emit('scanAuthors', repoPath.value)
}

// 开始扫描
const startScan = () => {
  if (!repoPath.value) {
    ElMessage.warning('请先选择Git仓库路径')
    return
  }

  scanning.value = true
  emit('scanCommits', {
    repoPath: repoPath.value,
    dateRange: dateRange.value,
    selectedAuthors: selectedAuthors.value,
    verifyGitRepo: verifyGitRepo.value,
    exportPath: exportPath.value,
    exportFormat: exportFormat.value,
    exportFields: exportFields.value
  })
}

// 选择快捷日期
const selectQuickDate = (type: string) => {
  quickDateType.value = type
  const today = new Date()

  switch (type) {
    case 'all':
      // 所有时间：开始时间为空，结束时间为今天
      dateRange.value = [null, today.toISOString().split('T')[0]]
      break

    case 'today':
      // 今天
      dateRange.value = [today.toISOString().split('T')[0], today.toISOString().split('T')[0]]
      break

    case 'week':
      // 本周
      const weekStart = new Date(today)
      const day = today.getDay() || 7 // 获取当前是周几 (0-6)，周日是0，转换为周日是7
      weekStart.setDate(today.getDate() - day + 1) // 设置为本周一
      dateRange.value = [weekStart.toISOString().split('T')[0], today.toISOString().split('T')[0]]
      break

    case 'month':
      // 本月
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      dateRange.value = [monthStart.toISOString().split('T')[0], today.toISOString().split('T')[0]]
      break

    case 'quarter':
      // 本季度
      const quarter = Math.floor(today.getMonth() / 3)
      const quarterStart = new Date(today.getFullYear(), quarter * 3, 1)
      dateRange.value = [
        quarterStart.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      ]
      break

    case 'year':
      // 本年
      const yearStart = new Date(today.getFullYear(), 0, 1)
      dateRange.value = [yearStart.toISOString().split('T')[0], today.toISOString().split('T')[0]]
      break

    case 'custom':
      // 自定义：保持当前选择，不做修改
      break
  }

  emitUpdates()
}

// 当日期范围直接修改时
const onDateRangeChange = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    // 如果用户通过日期选择器直接修改了日期，切换到自定义模式
    quickDateType.value = 'custom'
    emitUpdates()
  }
}

// 接收外部设置的 authors 列表
const setAuthorsList = (authors: string[]) => {
  authorsList.value = authors
  scanningAuthors.value = false
}

// 暴露方法给父组件调用
defineExpose({
  setAuthorsList,
  setScanningState: (state: boolean) => {
    scanning.value = state
  },
  setScanningAuthorsState: (state: boolean) => {
    scanningAuthors.value = state
  }
})
</script>

<style scoped>
.filter-component {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-item {
  margin-bottom: 16px;
}

.filter-label {
  font-weight: bold;
  margin-bottom: 8px;
}

.filter-control {
  width: 100%;
}

.filter-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.paths-options {
  margin-top: 8px;
}

.paths-options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.verify-git-toggle {
  margin-bottom: 0;
  min-width: 150px;
}

.saved-paths {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.saved-paths-label {
  color: #666;
  font-size: 0.9em;
}

.saved-path-tag {
  cursor: pointer;
}

.quick-date-buttons {
  margin-bottom: 0;
}

.input-with-button {
  display: flex;
  align-items: center;
  width: 88%;
}

.input-with-button .el-input {
  flex: 1;
}

.input-with-button .el-select {
  flex: 1;
  margin-right: 8px;
}

.advanced-filters {
  padding: 8px;
}
</style>
