<template>
  <div class="basic-settings-container">
    <div class="basic-settings-content">
      <SettingsForm
        :form="form"
        :is-valid-repo="isValidRepo"
        :is-selecting-path="isSelectingPath"
        :repo-history="repoHistory"
        :available-authors="availableAuthors"
        :authors-loading="authorsLoading"
        :date-preset="datePreset"
        :sub-repos="subRepos"
        :is-discovering-repos="isDiscoveringRepos"
        :available-branches="availableBranches"
        :branches-loading="branchesLoading"
        @validate-repo-path="validateRepoPath"
        @clear-repo-path="clearRepoPath"
        @select-repo-path="selectRepoPath"
        @clear-repo-history="clearRepoHistory"
        @select-recent-path="selectRecentPath"
        @remove-repo-from-history="removeRepoFromHistory"
        @load-authors="loadAuthors"
        @load-branches="loadBranches"
        @handle-preset-change="handlePresetChange"
        @discover-sub-repos="discoverSubRepos"
      />
      <LogPanel
        :scanning="scanning"
        :scan-phase="scanPhase"
        :scan-percentage="scanPercentage"
        :logs="logs"
        @stop-scan="stopScan"
        @copy-logs="copyLogs"
        @clear-logs="clearLogs"
      />
    </div>
    <ActionPanel
      :scanning="scanning"
      :has-results="hasResults"
      @start-scan="startScan"
      @save-results="saveResults"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { gitService } from '../../../services/GitService'
import { useRouter } from 'vue-router'
import dayjs, { Dayjs } from 'dayjs'
import SettingsForm from '../components/BasicSettings/SettingsForm.vue'
import LogPanel from '../components/BasicSettings/LogPanel.vue'
import ActionPanel from '../components/BasicSettings/ActionPanel.vue'

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
  statsDimension: 'none',
  repoPath: '',
  scanSubfolders: false,
  selectedRepos: [],
  branch: '',
  maxCommits: 0,
  authorFilter: [],
  dateRange: [dayjs().startOf('month'), dayjs()],
  outputFormat: 'json'
})

const subRepos = ref<string[]>([])
const isDiscoveringRepos = ref(false)
const repoHistory = ref(gitService.getRepoHistory())
const scanning = ref(false)
const hasResults = ref(false)
const logs = ref<Log[]>([])
const isValidRepo = ref(false)
const availableAuthors = ref<string[]>([])
const authorsLoading = ref(false)
const branchesLoading = ref(false)
const availableBranches = ref<string[]>([])
const datePreset = ref('本月')
const scanPhase = ref('准备中')
const scanPercentage = ref(0)
const unsubscribeProgress = ref<(() => void) | null>(null)
const unsubscribeError = ref<(() => void) | null>(null)
const unsubscribeCancelled = ref<(() => void) | null>(null)
const isSelectingPath = ref(false)

watch(
  () => form.scanSubfolders,
  (newVal) => {
    form.selectedRepos = []
    subRepos.value = []
    if (newVal === false && isValidRepo.value) {
      form.selectedRepos = [form.repoPath]
    }
  }
)

onMounted(() => {
  if (window.api?.onScanProgress) {
    unsubscribeProgress.value = window.api.onScanProgress((data) => {
      scanPhase.value = data.phase
      scanPercentage.value = data.percentage
      if (data.percentage === 100) {
        setTimeout(() => {
          scanning.value = false
        }, 500)
      }
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

watch(isValidRepo, (newVal) => {
  availableBranches.value = []
  form.branch = ''
  if (newVal) {
    loadBranches()
    loadAuthors()
  }
})

onUnmounted(() => {
  unsubscribeProgress.value?.()
  unsubscribeError.value?.()
  unsubscribeCancelled.value?.()
})

const loadBranches = async () => {
  if (!isValidRepo.value) return
  branchesLoading.value = true
  try {
    addLog(`加载分支列表: ${form.repoPath}`, 'info')
    const branches = await window.api.getRepoBranches(form.repoPath)
    availableBranches.value = branches
    if (branches.length > 0) {
      addLog(`成功加载 ${branches.length} 个分支`, 'success')
      // 可以在这里默认选中一个分支，例如第一个
      // form.branch = branches[0];
    } else {
      addLog('未找到任何分支', 'info')
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    addLog(`加载分支失败: ${msg}`, 'error')
    message.error(`加载分支失败: ${msg}`)
  } finally {
    branchesLoading.value = false
  }
}

const addLog = (msg: string, type: Log['type'] = 'info') => {
  const timestamp = dayjs().format('HH:mm:ss')
  logs.value.push({ message: `[${timestamp}] ${msg}`, type })
}

const clearRepoPath = () => {
  form.repoPath = ''
  isValidRepo.value = false
  availableAuthors.value = []
  form.authorFilter = []
  subRepos.value = []
  form.selectedRepos = []
}

const selectRepoPath = async () => {
  isSelectingPath.value = true
  try {
    const result = await window.api.selectDirectory()
    if (result) {
      const { path, isValid } = result
      form.repoPath = path
      isValidRepo.value = isValid
      gitService.addToHistory(path)
      repoHistory.value = gitService.getRepoHistory()

      if (form.scanSubfolders) {
        message.success(`已选择目录，请点击“扫描子仓库”按钮: ${path}`)
        addLog(`已选择父目录进行子文件夹扫描: ${path}`, 'info')
      } else {
        if (isValid) {
          message.success('有效的Git仓库路径')
          addLog(`选择并验证仓库: ${path} 有效`, 'success')
          form.selectedRepos = [path]
        } else {
          message.error('选择的目录不是有效的Git仓库')
          addLog(`选择的目录无效: ${path}`, 'error')
        }
      }
    }
  } catch (error) {
    message.error('选择目录失败')
    console.error('Error in selectRepoPath:', error)
  } finally {
    isSelectingPath.value = false
  }
}

const validateRepoPath = async () => {
  if (!form.repoPath) {
    isValidRepo.value = false
    return
  }
  isSelectingPath.value = true
  try {
    isValidRepo.value = await window.api.validateRepoPath(form.repoPath)
    gitService.addToHistory(form.repoPath)
    repoHistory.value = gitService.getRepoHistory()

    if (form.scanSubfolders) {
      message.info(`将扫描此目录下所有Git仓库: ${form.repoPath}`)
    } else {
      if (isValidRepo.value) {
        message.success('验证成功，是有效的Git仓库')
        form.selectedRepos = [form.repoPath]
      } else {
        message.error('验证失败，当前路径不是有效的Git仓库')
      }
    }
  } catch (error) {
    isValidRepo.value = false
    message.error('验证过程中发生错误')
  } finally {
    isSelectingPath.value = false
  }
}

const loadAuthors = async () => {
  if (!isValidRepo.value) {
    message.warning('请先选择有效的Git仓库')
    return
  }
  authorsLoading.value = true
  try {
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
  datePreset.value = preset
  if (preset === '自定义') return
  const range = PRESET_RANGES[preset]
  if (Array.isArray(range)) {
    form.dateRange = [range[0], range[1]]
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
  repoHistory.value.forEach((item) => gitService.removeFromHistory(item.path))
  repoHistory.value = []
}

const discoverSubRepos = async () => {
  if (!form.repoPath) {
    message.warning('请先选择一个父目录')
    return
  }
  isDiscoveringRepos.value = true
  addLog(`正在扫描子仓库: ${form.repoPath}`, 'info')
  try {
    const result = await window.api.getSubRepos(form.repoPath)
    if (result.success && result.repos) {
      subRepos.value = result.repos
      if (result.repos.length > 0) {
        addLog(`发现了 ${result.repos.length} 个子仓库`, 'success')
        message.success(`发现了 ${result.repos.length} 个子仓库`)
      } else {
        addLog('未发现任何子仓库', 'info')
        message.info('未发现任何子仓库')
      }
    } else {
      throw new Error(result.error || 'An unknown error occurred')
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    message.error(`扫描子仓库时出错: ${errorMsg}`)
    addLog(`扫描子仓库时出错: ${errorMsg}`, 'error')
  } finally {
    isDiscoveringRepos.value = false
  }
}

const startScan = async () => {
  if (!form.repoPath) return message.warning('请选择Git仓库路径')
  if (form.selectedFields.length === 0) return message.warning('请至少选择一个字段')
  if (form.scanSubfolders && form.selectedRepos.length === 0)
    return message.warning('请至少选择一个子仓库进行扫描')
  if (!form.scanSubfolders && !isValidRepo.value) return message.warning('请选择一个有效的Git仓库')

  scanning.value = true
  scanPhase.value = '准备中'
  scanPercentage.value = 0
  addLog(`开始扫描仓库: ${form.repoPath}`)

  try {
    const commits = await window.api.scanGitRepo(form.repoPath, {
      authorFilter: form.authorFilter.join(','),
      dateRange: form.dateRange.map((d) => d.format('YYYY-MM-DD HH:mm:ss')) as [string, string],
      selectedFields: form.selectedFields,
      maxCommits: form.maxCommits || undefined,
      branch: form.branch || undefined,
      scanSubfolders: form.scanSubfolders,
      selectedRepos: form.selectedRepos
    })

    addLog(`扫描完成，共找到 ${commits.length} 条提交记录`, 'success')
    hasResults.value = true
    localStorage.setItem('gitCommits', JSON.stringify(commits))

    router.push('/table-view')
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    addLog(`扫描失败: ${errorMsg}`, 'error')
    message.error(`扫描失败: ${errorMsg}`)
  } finally {
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
.basic-settings-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.basic-settings-content {
  display: flex;
  gap: 10px;
  flex: 1;
  min-height: 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}
</style>
