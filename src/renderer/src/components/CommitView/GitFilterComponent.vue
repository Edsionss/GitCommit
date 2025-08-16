<template>
  <div class="filter-component">
    <a-card class="filter-card">
      <template #title>
        <div class="card-header">
          <span>Git提交记录筛选</span>
          <a-button type="primary" @click="startScan" :loading="scanning"> 开始扫描 </a-button>
        </div>
      </template>

      <!-- 仓库选择 -->
      <div class="filter-item">
        <div class="filter-label-row">
          <div class="filter-label">Git仓库路径</div>
          <div class="input-with-button">
            <a-input-search v-model:value="repoPath" placeholder="请输入Git仓库路径" @search="selectRepoPath">
              <template #enterButton>
                <a-button>
                  <FolderOutlined />
                </a-button>
              </template>
            </a-input-search>
          </div>
        </div>
        <div class="paths-options" v-if="savedRepoPaths.length > 0">
          <div class="paths-options-row">
            <div class="verify-git-toggle">
              <a-switch v-model:checked="verifyGitRepo" checked-children="验证Git目录" un-checked-children="不验证目录" />
            </div>
            <div class="saved-paths">
              <div class="saved-paths-label">历史路径:</div>
              <a-tag
                v-for="path in savedRepoPaths"
                :key="path"
                class="saved-path-tag"
                closable
                @click="repoPath = path"
                @close="removeSavedPath(path, 'repo')"
              >
                {{ getShortPath(path) }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>
      <!-- 时间范围选择 -->
      <div class="filter-item">
        <div class="filter-label-row">
          <div class="filter-label">提交时间范围</div>
          <div class="quick-date-buttons">
            <a-radio-group v-model:value="quickDateType" @change="selectQuickDate">
              <a-radio-button value="all">所有时间</a-radio-button>
              <a-radio-button value="today">今天</a-radio-button>
              <a-radio-button value="week">本周</a-radio-button>
              <a-radio-button value="month">本月</a-radio-button>
              
              <a-radio-button value="year">本年</a-radio-button>
              <a-radio-button value="custom">自定义</a-radio-button>
            </a-radio-group>
          </div>
        </div>
        <div class="filter-control">
          <a-range-picker
            v-model:value="dateRange"
            style="width: 100%"
            :disabled="quickDateType !== 'custom'"
            @change="onDateRangeChange"
          />
        </div>
      </div>

      <!-- 提交作者选择 -->
      <div class="filter-item">
        <div class="filter-label-row">
          <div class="filter-label">提交作者</div>
          <div class="input-with-button">
            <a-select
              v-model:value="selectedAuthors"
              mode="tags"
              style="flex: 1"
              placeholder="选择或输入提交作者"
              :options="authorsList.map(author => ({ value: author }))"
            >
            </a-select>
            <a-button @click="scanAuthors" :loading="scanningAuthors" style="margin-left: 8px">
              <template #icon><ReloadOutlined /></template>
              扫描当前仓库作者
            </a-button>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 高级筛选 -->
    <a-collapse v-model:activeKey="activeCollapse">
      <a-collapse-panel key="advanced" header="高级筛选">
        <div class="advanced-filters">
          <div class="filter-item">
            <div class="filter-label">导出路径</div>
            <div class="filter-control">
              <a-input-search v-model:value="exportPath" placeholder="请选择导出路径" @search="selectExportPath">
                <template #enterButton>
                  <a-button>
                    <FolderOutlined />
                  </a-button>
                </template>
              </a-input-search>
              <div class="saved-paths" v-if="savedExportPaths.length > 0">
                <div class="saved-paths-label">历史路径:</div>
                <a-tag
                  v-for="path in savedExportPaths"
                  :key="path"
                  class="saved-path-tag"
                  closable
                  @click="exportPath = path"
                  @close="removeSavedPath(path, 'export')"
                >
                  {{ getShortPath(path) }}
                </a-tag>
              </div>
            </div>
          </div>

          <div class="filter-item">
            <div class="filter-label">导出字段选择</div>
            <div class="filter-control">
              <a-checkbox-group v-model:value="exportFields">
                <a-checkbox value="hash">提交哈希</a-checkbox>
                <a-checkbox value="author">提交作者</a-checkbox>
                <a-checkbox value="email">作者邮箱</a-checkbox>
                <a-checkbox value="date">提交日期</a-checkbox>
                <a-checkbox value="message">提交信息</a-checkbox>
                <a-checkbox value="files">变更文件</a-checkbox>
                <a-checkbox value="additions">新增行数</a-checkbox>
                <a-checkbox value="deletions">删除行数</a-checkbox>
              </a-checkbox-group>
            </div>
          </div>

          <div class="filter-item">
            <div class="filter-label">导出格式</div>
            <div class="filter-control">
              <a-radio-group v-model:value="exportFormat">
                <a-radio value="csv">CSV</a-radio>
                <a-radio value="json">JSON</a-radio>
                <a-radio value="txt">TXT</a-radio>
                <a-radio value="html">HTML</a-radio>
                <a-radio value="md">Markdown</a-radio>
              </a-radio-group>
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { FolderOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

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
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
const quickDateType = ref('all')
const selectedAuthors = ref<string[]>([])
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
  emit('update:dateRange', dateRange.value ? [dateRange.value[0].format('YYYY-MM-DD'), dateRange.value[1].format('YYYY-MM-DD')] : null)
  emit('update:selectedAuthors', selectedAuthors.value)
  emit('update:exportPath', exportPath.value)
  emit('update:exportFields', exportFields.value)
  emit('update:exportFormat', exportFormat.value)
  emit('update:verifyGitRepo', verifyGitRepo.value)
}

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
  selectQuickDate({ target: { value: 'all' } })
})

// 选择仓库路径
const selectRepoPath = async () => {
  // 模拟选择文件夹
  Modal.info({
    title: '选择仓库',
    content: '请在主进程中实现选择文件夹的功能',
  });
}

// 选择导出路径
const selectExportPath = async () => {
  // 模拟选择文件夹
  Modal.info({
    title: '选择导出路径',
    content: '请在主进程中实现选择文件夹的功能',
  });
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
    message.warning('请先选择Git仓库路径')
    return
  }

  scanningAuthors.value = true
  emit('scanAuthors', repoPath.value)
}

// 开始扫描
const startScan = () => {
  if (!repoPath.value) {
    message.warning('请先选择Git仓库路径')
    return
  }

  scanning.value = true
  emit('scanCommits', {
    repoPath: repoPath.value,
    dateRange: dateRange.value ? [dateRange.value[0].format('YYYY-MM-DD'), dateRange.value[1].format('YYYY-MM-DD')] : null,
    selectedAuthors: selectedAuthors.value,
    verifyGitRepo: verifyGitRepo.value,
    exportPath: exportPath.value,
    exportFormat: exportFormat.value,
    exportFields: exportFields.value
  })
}

// 选择快捷日期
const selectQuickDate = (e: any) => {
  const type = e.target.value
  quickDateType.value = type
  const today = dayjs()

  switch (type) {
    case 'all':
      dateRange.value = null
      break
    case 'today':
      dateRange.value = [today, today]
      break
    case 'week':
      dateRange.value = [today.startOf('week'), today]
      break
    case 'month':
      dateRange.value = [today.startOf('month'), today]
      break
    case 'year':
      dateRange.value = [today.startOf('year'), today]
      break
    case 'custom':
      break
  }

  emitUpdates()
}

// 当日期范围直接修改时
const onDateRangeChange = () => {
  if (dateRange.value && dateRange.value.length === 2) {
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
