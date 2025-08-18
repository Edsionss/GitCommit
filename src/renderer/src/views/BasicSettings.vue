<template>
  <div class="router-view-container">
    <div class="basic-settings">
      <a-card class="settings-card">
        <template #title>
          <div class="card-header">
            <span>字段与统计配置</span>
          </div>
        </template>
        <a-form :model="form" layout="vertical">
          <a-form-item label="字段选择">
            <a-checkbox-group v-model:value="form.selectedFields">
              <a-checkbox value="repository">仓库名称</a-checkbox>
              <a-checkbox value="repoPath">仓库完整路径</a-checkbox>
              <a-checkbox value="commitId">完整提交ID</a-checkbox>
              <a-checkbox value="shortHash">短提交ID</a-checkbox>
              <a-checkbox value="author">作者</a-checkbox>
              <a-checkbox value="email">邮箱</a-checkbox>
              <a-checkbox value="date">日期</a-checkbox>
              <a-checkbox value="message">提交消息</a-checkbox>
              <a-checkbox value="body">详细描述</a-checkbox>
              <a-checkbox value="filesChanged">变更文件数</a-checkbox>
              <a-checkbox value="insertions">新增行数</a-checkbox>
              <a-checkbox value="deletions">删除行数</a-checkbox>
            </a-checkbox-group>
          </a-form-item>

          <a-form-item label="统计选项">
            <a-select v-model:value="form.statsDimension" placeholder="选择统计维度">
              <a-select-option value="author">按作者统计</a-select-option>
              <a-select-option value="repository">按仓库统计</a-select-option>
              <a-select-option value="date">按日期统计</a-select-option>
              <a-select-option value="none">不按任何</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-card>

      <a-card class="settings-card">
        <template #title>
          <div class="card-header">
            <span>仓库与过滤配置</span>
          </div>
        </template>
        <a-form :model="form" layout="vertical">
          <a-form-item label="仓库路径">
            <a-input
              v-model:value="form.repoPath"
              placeholder="请输入Git仓库路径"
              @change="validateRepoPath"
            >
              <template #addonAfter>
                <span @click="selectRepoPath" style="cursor: pointer">
                  <FolderOutlined />
                </span>
              </template>
              <template #prefix>
                <CheckCircleFilled v-if="isValidRepo" style="color: green" />
                <CloseCircleFilled v-else-if="form.repoPath" style="color: red" />
              </template>
            </a-input>
            <div v-if="repoHistory.length > 0" class="recent-paths">
              <div class="recent-paths-header">
                <span>最近扫描位置</span>
                <a-button type="link" @click="clearRepoHistory">清空历史</a-button>
              </div>
              <div class="recent-paths-list">
                <div
                  v-for="item in repoHistory"
                  :key="item.path"
                  class="recent-path-item"
                  @click="selectRecentPath(item.path)"
                >
                  <div class="path-info">
                    <span class="path-text">{{ item.path }}</span>
                    <span class="path-time">{{ formatLastAccessed(item.lastAccessed) }}</span>
                  </div>
                  <div class="path-actions">
                    <a-button type="text" danger @click.stop="removeRepoFromHistory(item.path)">
                      <DeleteOutlined />
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </a-form-item>

          <a-form-item label="分支选择">
            <a-input v-model:value="form.branch" placeholder="默认为当前分支 (HEAD)">
              <template #prefix>
                <BranchesOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="最大提交数">
            <a-input-number v-model:value="form.maxCommits" :min="0" :max="10000" />
            <span class="hint">0表示不限制</span>
          </a-form-item>

          <a-form-item label="作者过滤">
            <a-select
              v-model:value="form.authorFilter"
              mode="tags"
              placeholder="选择或输入作者名称/邮箱"
              style="width: 100%"
              :options="availableAuthors.map((author) => ({ value: author }))"
              :loading="authorsLoading"
            />
            <div class="author-actions">
              <a-button
                type="link"
                @click="loadAuthors"
                :loading="authorsLoading"
                :disabled="!isValidRepo"
              >
                <template #icon><SyncOutlined /></template> 扫描作者
              </a-button>
              <a-button type="link" @click="form.authorFilter = []">
                <template #icon><ClearOutlined /></template> 清空
              </a-button>
            </div>
          </a-form-item>

          <a-form-item label="时间范围">
            <div class="date-range-selector">
              <a-radio-group v-model:value="datePreset" @change="handlePresetChange">
                <a-radio-button value="今日">今日</a-radio-button>
                <a-radio-button value="本周">本周</a-radio-button>
                <a-radio-button value="本月">本月</a-radio-button>
                <a-radio-button value="自定义">自定义</a-radio-button>
              </a-radio-group>
              <a-range-picker
                v-model:value="form.dateRange"
                show-time
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                :disabled="datePreset !== '自定义'"
              />
            </div>
          </a-form-item>

          <a-form-item label="输出格式">
            <a-select v-model:value="form.outputFormat" placeholder="选择输出格式">
              <a-select-option value="json">JSON</a-select-option>
              <a-select-option value="csv">CSV</a-select-option>
              <a-select-option value="excel">Excel</a-select-option>
              <a-select-option value="html">HTML</a-select-option>
              <a-select-option value="markdown">Markdown</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-card>

      <a-card v-if="scanning" class="progress-card">
        <template #title>
          <div class="card-header">
            <span>扫描进度</span>
            <a-button type="primary" danger size="small" @click="stopScan">停止</a-button>
          </div>
        </template>
        <div class="progress-info">
          <span>{{ scanPhase }}</span>
          <span>{{ scanPercentage }}%</span>
        </div>
        <a-progress
          :percent="scanPercentage"
          :stroke-width="10"
          :status="scanPercentage === 100 ? 'success' : 'active'"
        />
      </a-card>

      <div class="action-buttons">
        <a-button type="primary" @click="startScan" :loading="scanning">
          <template #icon><CaretRightOutlined /></template>开始扫描
        </a-button>
        <a-button @click="saveResults" :disabled="!hasResults">
          <template #icon><DownloadOutlined /></template>保存结果
        </a-button>
      </div>

      <a-card v-if="logs.length > 0" class="log-card">
        <template #title>
          <div class="card-header">
            <span>扫描日志</span>
            <div class="log-actions">
              <a-button type="link" @click="copyLogs"
                ><template #icon><CopyOutlined /></template>复制</a-button
              >
              <a-button type="link" danger @click="clearLogs"
                ><template #icon><DeleteOutlined /></template>清除</a-button
              >
            </div>
          </div>
        </template>
        <div class="log-content">
          <p v-for="(log, index) in logs" :key="index" :class="log.type">{{ log.message }}</p>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { gitService } from '../../../services/GitService'
import { useRouter } from 'vue-router'
import dayjs, { Dayjs } from 'dayjs'
import {
  FolderOutlined,
  UserOutlined,
  CaretRightOutlined,
  DownloadOutlined,
  CopyOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  SyncOutlined,
  BranchesOutlined,
  ClearOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

interface Log {
  type: 'info' | 'error' | 'success'
  message: string
}

const PRESET_RANGES: { [key: string]: [Dayjs, Dayjs] | string } = {
  今日: [dayjs().startOf('day'), dayjs().endOf('day')],
  本周: [dayjs().startOf('week'), dayjs().endOf('week')],
  本月: [dayjs().startOf('month'), dayjs().endOf('month')],
  自定义: 'custom'
}

const form = reactive({
  selectedFields: ['repository', 'commitId', 'shortHash', 'author', 'date', 'message'],
  enableStats: false,
  statsDimension: 'none',
  repoPath: '',
  branch: '',
  maxCommits: 0,
  authorFilter: [],
  dateRange: [dayjs().startOf('month'), dayjs()],
  outputFormat: 'json'
})

const repoHistory = ref(gitService.getRepoHistory())
const scanning = ref(false)
const hasResults = ref(false)
const logs = ref<Log[]>([])
const isValidRepo = ref(false)
const availableAuthors = ref<string[]>([])
const authorsLoading = ref(false)
const datePreset = ref('本月')
const scanPhase = ref('准备中')
const scanPercentage = ref(0)
const unsubscribeProgress = ref<(() => void) | null>(null)
const unsubscribeError = ref<(() => void) | null>(null)
const unsubscribeCancelled = ref<(() => void) | null>(null)

onMounted(() => {
  if (window.api?.onScanProgress) {
    unsubscribeProgress.value = window.api.onScanProgress((data) => {
      scanPhase.value = data.phase
      scanPercentage.value = data.percentage
      if (data.percentage === 100)
        setTimeout(() => {
          scanning.value = false
        }, 500)
    })
  }
  if (window.api?.onScanError) {
    unsubscribeError.value = window.api.onScanError((data) => {
      addLog(`扫描错误: ${data.message}`, 'error')
      scanning.value = false
    })
  }
  if (window.api?.onScanCancelled) {
    unsubscribeCancelled.value = window.api.onScanCancelled(() => {
      addLog('扫描已取消', 'info')
      scanning.value = false
    })
  }
})

onUnmounted(() => {
  unsubscribeProgress.value?.()
  unsubscribeError.value?.()
  unsubscribeCancelled.value?.()
})

const addLog = (message: string, type: Log['type'] = 'info') => {
  const timestamp = dayjs().format('HH:mm:ss')
  logs.value.push({ message: `[${timestamp}] ${message}`, type })
}

const selectRepoPath = async () => {
  try {
    const result = await window.api.selectDirectory()
    if (result) {
      form.repoPath = result
      await validateRepoPath()
    }
  } catch (error) {
    message.error('选择目录失败')
  }
}

const validateRepoPath = async () => {
  if (!form.repoPath) {
    isValidRepo.value = false
    return
  }
  try {
    isValidRepo.value = await window.api.validateRepoPath(form.repoPath)
    if (isValidRepo.value) addLog(`验证仓库: ${form.repoPath} 有效`, 'success')
    else addLog(`验证仓库: ${form.repoPath} 无效`, 'error')
  } catch (error) {
    isValidRepo.value = false
  }
}

const loadAuthors = async () => {
  if (!isValidRepo.value) {
    message.warning('请先选择有效的Git仓库')
    return
  }
  try {
    authorsLoading.value = true
    addLog(`加载仓库作者列表: ${form.repoPath}`)
    const authors = await window.api.getRepoAuthors(form.repoPath)
    availableAuthors.value = authors
    addLog(`找到 ${authors.length} 个作者`, 'success')
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    addLog(`加载作者列表失败: ${errorMsg}`, 'error')
    message.error('加载作者列表失败')
  } finally {
    authorsLoading.value = false
  }
}

const handlePresetChange = (e: any) => {
  const preset = e.target.value
  if (preset === '自定义') return
  const range = PRESET_RANGES[preset]
  if (Array.isArray(range)) {
    form.dateRange = [range[0], range[1]]
  }
}

const formatLastAccessed = (timestamp: string): string => {
  const date = dayjs(timestamp)
  const now = dayjs()
  if (date.isSame(now, 'day')) return '今天 ' + date.format('HH:mm')
  if (date.isSame(now.subtract(1, 'day'), 'day')) return '昨天 ' + date.format('HH:mm')
  return date.format('MM-DD HH:mm')
}

const selectRecentPath = (path: string) => {
  form.repoPath = path
  validateRepoPath()
}

const removeRepoFromHistory = (path: string) => {
  gitService.removeFromHistory(path)
  repoHistory.value = gitService.getRepoHistory()
}

const clearRepoHistory = () => {
  repoHistory.value.forEach((item) => gitService.removeFromHistory(item.path))
  repoHistory.value = []
}

const startScan = async () => {
  if (!form.repoPath) return message.warning('请选择Git仓库路径')
  if (form.selectedFields.length === 0) return message.warning('请至少选择一个字段')

  try {
    scanning.value = true
    scanPhase.value = '准备中'
    scanPercentage.value = 0
    addLog(`开始扫描仓库: ${form.repoPath}`)

    const commits = await gitService.scanRepository(form.repoPath, {
      authorFilter: form.authorFilter.join(','),
      dateRange: form.dateRange.map((d) => d.format('YYYY-MM-DD HH:mm:ss')) as [string, string],
      selectedFields: form.selectedFields,
      maxCommits: form.maxCommits || undefined,
      branch: form.branch || undefined
    })

    addLog(`扫描完成，共找到 ${commits.length} 条提交记录`, 'success')
    hasResults.value = true
    localStorage.setItem('gitCommits', JSON.stringify(commits))

    if (form.enableStats) router.push('/results')
    else router.push('/table-view') // Corrected route
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    addLog(`扫描失败: ${errorMsg}`, 'error')
    message.error('扫描失败')
    scanning.value = false
  }
}

const stopScan = () => {
  if (scanning.value) {
    window.api.cancelScan()
    addLog('正在停止扫描...', 'info')
  }
}

const saveResults = async () => {
  try {
    const commits = JSON.parse(localStorage.getItem('gitCommits') || '[]')
    if (commits.length === 0) return message.warning('没有可保存的结果')

    const result = await gitService.exportData(commits, form.outputFormat, form.repoPath)
    if (result) {
      addLog(`结果已保存到: ${result}`, 'success')
      message.success('保存成功')
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    addLog(`保存失败: ${errorMsg}`, 'error')
    message.error('保存失败')
  }
}

const copyLogs = () => {
  const logText = logs.value.map((log) => log.message).join('\n')
  navigator.clipboard
    .writeText(logText)
    .then(() => message.success('日志已复制到剪贴板'))
    .catch(() => message.error('复制失败'))
}

const clearLogs = () => {
  logs.value = []
}
</script>

<style scoped>
.basic-settings {
  max-width: 800px;
  margin: 0 auto;
}
.settings-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 20px 0;
}
.log-card {
  margin-top: 20px;
}
.log-actions {
  display: flex;
  gap: 8px;
}
.log-content {
  font-family: 'Fira Code', monospace;
  white-space: pre-wrap;
  font-size: 13px;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
}
.log-content p {
  margin: 3px 0;
  padding-left: 8px;
  border-left: 3px solid transparent;
}
.info {
  color: #555;
  border-left-color: #1890ff;
}
.error {
  color: #cf1322;
  background-color: #fff1f0;
  border-left-color: #cf1322;
}
.success {
  color: #389e0d;
  background-color: #f6ffed;
  border-left-color: #389e0d;
}
.progress-card {
  margin-bottom: 20px;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.recent-paths {
  margin-top: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
.recent-paths-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #d9d9d9;
  background-color: #fafafa;
}
.recent-paths-list {
  max-height: 150px;
  overflow-y: auto;
}
.recent-path-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}
.recent-path-item:hover {
  background-color: #f5f5f5;
}
.recent-path-item:last-child {
  border-bottom: none;
}
.path-info {
  flex: 1;
  overflow: hidden;
}
.path-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.path-time {
  font-size: 12px;
  color: #888;
}
.author-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}
.date-range-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.hint {
  margin-left: 12px;
  font-size: 12px;
  color: #888;
}
</style>
