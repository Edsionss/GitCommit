<template>
  <div class="router-view-container">
    <div class="basic-settings">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <span>字段与统计配置</span>
          </div>
        </template>
        <el-form :model="form" label-width="120px">
          <!-- 字段选择 -->
          <el-form-item label="字段选择">
            <el-checkbox-group v-model="form.selectedFields">
              <el-checkbox :value="'repository'">仓库名称</el-checkbox>
              <el-checkbox :value="'repoPath'">仓库完整路径</el-checkbox>
              <el-checkbox :value="'commitId'">完整提交ID</el-checkbox>
              <el-checkbox :value="'shortHash'">短提交ID</el-checkbox>
              <el-checkbox :value="'author'">作者</el-checkbox>
              <el-checkbox :value="'email'">邮箱</el-checkbox>
              <el-checkbox :value="'date'">日期</el-checkbox>
              <el-checkbox :value="'message'">提交消息</el-checkbox>
              <el-checkbox :value="'body'">详细描述</el-checkbox>
              <el-checkbox :value="'filesChanged'">变更文件数</el-checkbox>
              <el-checkbox :value="'insertions'">新增行数</el-checkbox>
              <el-checkbox :value="'deletions'">删除行数</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <!-- 统计选项 -->
          <el-form-item label="统计选项">
            <el-switch v-model="form.enableStats" />
            <el-select
              v-model="form.statsDimension"
              :disabled="!form.enableStats"
              placeholder="选择统计维度"
              style="margin-left: 10px"
            >
              <el-option label="按作者统计" value="author" />
              <el-option label="按仓库统计" value="repository" />
              <el-option label="按日期统计" value="date" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <span>仓库与过滤配置</span>
          </div>
        </template>
        <el-form :model="form" label-width="120px">
          <!-- 仓库路径设置 -->
          <el-form-item label="仓库路径">
            <div class="input-with-select">
              <el-input
                v-model="form.repoPath"
                placeholder="请输入Git仓库路径"
                @change="validateRepoPath"
                :status="repoPathStatus"
              >
                <template #append>
                  <el-button @click="selectRepoPath">
                    <el-icon><Folder /></el-icon>
                  </el-button>
                </template>
                <template #prefix>
                  <el-icon v-if="isValidRepo" color="green"><Check /></el-icon>
                  <el-icon v-else-if="form.repoPath" color="red"><Close /></el-icon>
                </template>
              </el-input>
            </div>
            <div v-if="repoHistory.length > 0" class="recent-paths">
              <div class="recent-paths-header">
                <span>最近扫描位置</span>
                <el-button link type="primary" @click="clearRepoHistory">清空历史</el-button>
              </div>
              <el-scrollbar max-height="150px">
                <div
                  v-for="(item, index) in repoHistory"
                  :key="index"
                  class="recent-path-item"
                  @click="selectRecentPath(item.path)"
                >
                  <div class="path-info">
                    <span class="path-text">{{ item.path }}</span>
                    <span class="path-time">{{ formatLastAccessed(item.lastAccessed) }}</span>
                  </div>
                  <div class="path-actions">
                    <el-button link type="danger" @click.stop="removeRepoFromHistory(item.path)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </el-form-item>

          <!-- 分支选择 -->
          <el-form-item label="分支选择">
            <el-input v-model="form.branch" placeholder="默认为当前分支 (HEAD)">
              <template #prefix>
                <el-icon><Operation /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 提交数限制 -->
          <el-form-item label="最大提交数">
            <el-input-number v-model="form.maxCommits" :min="0" :max="10000" />
            <span class="hint">0表示不限制</span>
          </el-form-item>

          <!-- 作者过滤 -->
          <el-form-item label="作者过滤">
            <el-select
              v-model="form.authorFilter"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="选择或输入作者名称/邮箱"
              style="width: 100%"
            >
              <template v-if="isValidRepo && !authorsLoading">
                <el-option
                  v-for="author in availableAuthors"
                  :key="author"
                  :label="author"
                  :value="author"
                />
              </template>
              <template v-if="authorsLoading">
                <el-option label="加载中..." value="" disabled />
              </template>
            </el-select>
            <div class="author-actions">
              <el-button
                link
                type="primary"
                @click="loadAuthors"
                :loading="authorsLoading"
                :disabled="!isValidRepo"
              >
                <el-icon><Refresh /></el-icon> 扫描作者
              </el-button>
              <el-button link type="info" @click="form.authorFilter = []">
                <el-icon><Delete /></el-icon> 清空
              </el-button>
            </div>
          </el-form-item>

          <!-- 时间范围 -->
          <el-form-item label="时间范围">
            <div class="date-range-selector">
              <div class="preset-buttons">
                <el-radio-group v-model="datePreset" @change="handlePresetChange">
                  <el-radio :value="'今日'">今日</el-radio>
                  <el-radio :value="'本周'">本周</el-radio>
                  <el-radio :value="'本月'">本月</el-radio>
                  <el-radio :value="'自定义'">自定义</el-radio>
                </el-radio-group>
              </div>
              <el-date-picker
                v-model="form.dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                :disabled="datePreset !== '自定义'"
              />
            </div>
          </el-form-item>

          <!-- 输出设置 -->
          <el-form-item label="输出格式">
            <el-select v-model="form.outputFormat" placeholder="选择输出格式">
              <el-option label="JSON" value="json" />
              <el-option label="CSV" value="csv" />
              <el-option label="Excel" value="excel" />
              <el-option label="HTML" value="html" />
              <el-option label="Markdown" value="markdown" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 进度条 -->
      <el-card v-if="scanning" class="progress-card">
        <template #header>
          <div class="card-header">
            <span>扫描进度</span>
            <el-button type="danger" size="small" @click="stopScan">停止</el-button>
          </div>
        </template>
        <div class="progress-info">
          <span>{{ scanPhase }}</span>
          <span>{{ scanPercentage }}%</span>
        </div>
        <el-progress
          :percentage="scanPercentage"
          :stroke-width="10"
          :status="scanPercentage === 100 ? 'success' : ''"
        />
      </el-card>

      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <el-button type="primary" @click="startScan" :loading="scanning" icon="CaretRight"
          >开始扫描</el-button
        >
        <el-button @click="saveResults" :disabled="!hasResults" icon="Download">保存结果</el-button>
      </div>

      <!-- 日志区域 -->
      <el-card v-if="logs.length > 0" class="log-card">
        <template #header>
          <div class="card-header">
            <span>扫描日志</span>
            <div class="log-actions">
              <el-button link type="primary" @click="copyLogs" icon="CopyDocument">复制</el-button>
              <el-button link type="danger" @click="clearLogs" icon="Delete">清除</el-button>
            </div>
          </div>
        </template>
        <el-scrollbar height="200px">
          <div class="log-content">
            <p v-for="(log, index) in logs" :key="index" :class="log.type">{{ log.message }}</p>
          </div>
        </el-scrollbar>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { gitService } from '../../../services/GitService'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import {
  Folder,
  User,
  Document,
  CaretRight,
  Download,
  CopyDocument,
  Delete,
  Check,
  Close,
  Refresh,
  Operation
} from '@element-plus/icons-vue'

const router = useRouter()

interface Log {
  type: 'info' | 'error' | 'success'
  message: string
}

// 预设时间范围
const PRESET_RANGES = {
  今日: [dayjs().startOf('day'), dayjs().endOf('day')],
  本周: [dayjs().startOf('week'), dayjs().endOf('week')],
  本月: [dayjs().startOf('month'), dayjs().endOf('month')],
  自定义: 'custom'
}

const form = reactive({
  selectedFields: ['repository', 'commitId', 'shortHash', 'author', 'date', 'message'],
  enableStats: false,
  statsDimension: 'author',
  repoPath: '',
  branch: '',
  maxCommits: 0,
  authorFilter: [],
  dateRange: [
    dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
    dayjs().format('YYYY-MM-DD HH:mm:ss')
  ],
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

// 仓库路径状态
const repoPathStatus = computed(() => {
  if (!form.repoPath) return ''
  return isValidRepo.value ? 'success' : 'error'
})

onMounted(() => {
  // 设置进度监听
  if (window.api && typeof window.api.onScanProgress === 'function') {
    unsubscribeProgress.value = window.api.onScanProgress((data) => {
      scanPhase.value = data.phase
      scanPercentage.value = data.percentage
      if (data.percentage === 100) {
        setTimeout(() => {
          scanning.value = false
        }, 500)
      }
    })
  } else {
    console.error('API方法 onScanProgress 不可用')
  }

  // 设置错误监听
  if (window.api && typeof window.api.onScanError === 'function') {
    unsubscribeError.value = window.api.onScanError((data) => {
      addLog(`扫描错误: ${data.message}`, 'error')
      scanning.value = false
    })
  } else {
    console.error('API方法 onScanError 不可用')
  }

  // 设置取消监听
  if (window.api && typeof window.api.onScanCancelled === 'function') {
    unsubscribeCancelled.value = window.api.onScanCancelled(() => {
      addLog('扫描已取消', 'info')
      scanning.value = false
    })
  } else {
    console.error('API方法 onScanCancelled 不可用')
  }
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
      isValidRepo.value = true
      addLog(`选择仓库: ${result}`, 'success')
    }
  } catch (error) {
    console.error('选择目录失败:', error)
    ElMessage.error('选择目录失败')
  }
}

const validateRepoPath = async () => {
  if (!form.repoPath) {
    isValidRepo.value = false
    return
  }

  try {
    isValidRepo.value = await window.api.validateRepoPath(form.repoPath)
    if (isValidRepo.value) {
      addLog(`验证仓库: ${form.repoPath} 有效`, 'success')
    } else {
      addLog(`验证仓库: ${form.repoPath} 无效`, 'error')
    }
  } catch (error) {
    console.error('验证仓库路径失败:', error)
    isValidRepo.value = false
  }
}

const loadAuthors = async () => {
  if (!isValidRepo.value || !form.repoPath) {
    ElMessage.warning('请先选择有效的Git仓库')
    return
  }

  try {
    authorsLoading.value = true
    addLog(`加载仓库作者列表: ${form.repoPath}`)

    const authors = await window.api.getRepoAuthors(form.repoPath)
    availableAuthors.value = authors

    addLog(`找到 ${authors.length} 个作者`, 'success')
  } catch (error) {
    console.error('加载作者列表失败:', error)
    addLog(`加载作者列表失败: ${error instanceof Error ? error.message : String(error)}`, 'error')
    ElMessage.error('加载作者列表失败')
  } finally {
    authorsLoading.value = false
  }
}

const handlePresetChange = (preset: string) => {
  if (preset === '自定义') {
    return
  }

  const range = PRESET_RANGES[preset as keyof typeof PRESET_RANGES]
  if (Array.isArray(range)) {
    form.dateRange = [
      range[0].format('YYYY-MM-DD HH:mm:ss'),
      range[1].format('YYYY-MM-DD HH:mm:ss')
    ]
  }
}

const formatLastAccessed = (timestamp: string): string => {
  const date = dayjs(timestamp)
  const now = dayjs()

  if (date.isSame(now, 'day')) {
    return '今天 ' + date.format('HH:mm')
  } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
    return '昨天 ' + date.format('HH:mm')
  } else if (date.isAfter(now.subtract(7, 'day'))) {
    return date.format('ddd HH:mm')
  } else {
    return date.format('MM-DD HH:mm')
  }
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
  repoHistory.value.forEach((item) => {
    gitService.removeFromHistory(item.path)
  })
  repoHistory.value = []
}

const startScan = async () => {
  if (!form.repoPath) {
    ElMessage.warning('请选择Git仓库路径')
    return
  }

  if (form.selectedFields.length === 0) {
    ElMessage.warning('请至少选择一个字段')
    return
  }

  try {
    scanning.value = true
    scanPhase.value = '准备中'
    scanPercentage.value = 0
    addLog(`开始扫描仓库: ${form.repoPath}`)

    // 构建作者筛选字符串
    const authorFilterString = form.authorFilter.length > 0 ? form.authorFilter.join(',') : ''

    const commits = await gitService.scanRepository(form.repoPath, {
      authorFilter: authorFilterString,
      dateRange: form.dateRange as [string, string],
      selectedFields: form.selectedFields,
      maxCommits: form.maxCommits || undefined,
      branch: form.branch || undefined
    })

    addLog(`扫描完成，共找到 ${commits.length} 条提交记录`, 'success')
    hasResults.value = true

    // 存储结果到localStorage
    localStorage.setItem('gitCommits', JSON.stringify(commits))

    // 如果启用了统计，跳转到结果页面
    if (form.enableStats) {
      router.push('/results')
    } else {
      router.push('/table')
    }
  } catch (error) {
    console.error('扫描失败:', error)
    addLog(`扫描失败: ${error instanceof Error ? error.message : String(error)}`, 'error')
    ElMessage.error('扫描失败')
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
    if (commits.length === 0) {
      ElMessage.warning('没有可保存的结果')
      return
    }

    const result = await gitService.exportData(commits, form.outputFormat, form.repoPath)
    if (result) {
      addLog(`结果已保存到: ${result}`, 'success')
      ElMessage.success('保存成功')
    }
  } catch (error) {
    console.error('保存失败:', error)
    addLog(`保存失败: ${error instanceof Error ? error.message : String(error)}`, 'error')
    ElMessage.error('保存失败')
  }
}

const copyLogs = () => {
  const logText = logs.value.map((log) => log.message).join('\n')
  navigator.clipboard
    .writeText(logText)
    .then(() => ElMessage.success('日志已复制到剪贴板'))
    .catch(() => ElMessage.error('复制失败'))
}

const clearLogs = () => {
  logs.value = []
}
</script>

<style scoped>
.router-view-container {
  width: 100%;
  padding: var(--spacing-md);
}

.basic-settings {
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  margin-bottom: var(--spacing-lg);
  transition: var(--transition-normal);
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin: var(--spacing-lg) 0;
  animation: buttonPulse 2s infinite;
}

@keyframes buttonPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}

.log-card {
  margin-top: var(--spacing-lg);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.log-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.log-content {
  font-family: 'Fira Code', monospace;
  white-space: pre-wrap;
  font-size: 13px;
  background-color: #f8f9fa;
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  max-height: 300px;
  overflow-y: auto;
}

.log-content p {
  margin: 3px 0;
  padding: 2px 4px;
  line-height: 1.5;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.log-content p:hover {
  background-color: var(--hover-bg);
}

.info {
  color: var(--text-secondary);
  border-left: 3px solid var(--info);
  padding-left: 8px !important;
}

.error {
  color: var(--danger);
  border-left: 3px solid var(--danger);
  padding-left: 8px !important;
  background-color: var(--danger-light);
}

.success {
  color: var(--success);
  border-left: 3px solid var(--success);
  padding-left: 8px !important;
  background-color: var(--success-light);
}

.progress-card {
  margin-bottom: var(--spacing-lg);
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
  font-size: 14px;
}

.recent-paths {
  margin-top: var(--spacing-md);
  border: var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.recent-paths-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: var(--border);
  background-color: #f8f9fa;
}

.recent-path-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  border-bottom: var(--border);
  transition: all var(--transition-fast);
}

.recent-path-item:hover {
  background-color: var(--hover-bg);
  transform: translateX(4px);
}

.recent-path-item:last-child {
  border-bottom: none;
}

.path-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.path-text {
  font-size: var(--font-size-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.path-time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.path-actions {
  margin-left: var(--spacing-sm);
  opacity: 0.5;
  transition: opacity var(--transition-fast);
}

.recent-path-item:hover .path-actions {
  opacity: 1;
}

.author-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-sm);
}

.date-range-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.preset-buttons {
  display: flex;
  margin-bottom: var(--spacing-sm);
}

.hint {
  margin-left: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-style: italic;
}

/* Element Plus override */
:deep(.el-form-item__label) {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: var(--text-primary);
}

:deep(.el-checkbox) {
  margin-right: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  transition: transform var(--transition-fast);
}

:deep(.el-checkbox:hover) {
  transform: translateY(-2px);
}

:deep(.el-switch.is-checked .el-switch__core) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--border-color) inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--primary-color) inset;
}

:deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--primary-color) inset !important;
  border-color: var(--primary-color);
}

:deep(.el-progress-bar__outer) {
  background-color: #e9ecef;
  border-radius: var(--radius-pill);
  overflow: hidden;
}

:deep(.el-progress-bar__inner) {
  border-radius: var(--radius-pill);
  background-color: var(--primary-color);
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
}

:deep(.el-progress-bar__inner.is-success) {
  background-color: var(--success);
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.el-radio__inner::after) {
  background-color: #fff;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: var(--text-primary);
}

:deep(.el-button--primary) {
  background-color: var(--primary-color);
}

:deep(.el-button--primary:hover) {
  background-color: var(--primary-dark);
}

:deep(.el-button--primary) .el-icon {
  margin-right: 4px;
  font-size: 16px;
}

:deep(.el-button--danger) {
  background-color: var(--danger);
}

:deep(.el-date-editor .el-range-separator) {
  color: var(--text-secondary);
}

:deep(.el-select__tags) {
  flex-wrap: nowrap;
  overflow-x: auto;
  max-width: 100%;
  padding-bottom: 2px;
}

:deep(.el-input-number .el-input-number__decrease),
:deep(.el-input-number .el-input-number__increase) {
  background-color: #f8f9fa;
  border-color: var(--border-color);
  transition: background-color var(--transition-fast);
}

:deep(.el-input-number .el-input-number__decrease:hover),
:deep(.el-input-number .el-input-number__increase:hover) {
  background-color: #e9ecef;
}

:deep(.el-input-number.is-controls-right .el-input-number__increase) {
  border-bottom: var(--border);
}

/* Scan action button animations */
.el-button.is-loading:before {
  animation: loadingRotate 1s infinite linear;
}

@keyframes loadingRotate {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Field selection animation */
:deep(.el-form-item:first-child .el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
