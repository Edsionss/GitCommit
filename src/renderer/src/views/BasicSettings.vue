<template>
  <div class="basic-settings-container">
    <div class="basic-settings-content">
      <SettingsForm
        ref="settingsFormRef"
        :form="form"
        @update:form="Object.assign(form, $event)"
        @add-log="addLog"
        @validate-repo-path="validateRepoPath"
        :repo-status="repoStatus"
        @update:repoStatus="repoStatus = $event"
      />
      <LogPanel
        ref="logPanelRef"
        :scanning="scanning"
        @stop-scan="stopScan"
        @scan-started="scanning = true"
        @scan-finished="scanning = false"
      />
    </div>
    <ActionPanel
      :scanning="scanning"
      :has-results="hasResults"
      @start-scan="startScan"
      @save-results="saveResults"
      @scan-authors="scanAuthors"
      @reset-config="resetForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { gitService } from '@services/GitService'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import SettingsForm from '@components/BasicSettings/SettingsForm.vue'
import LogPanel from '@components/BasicSettings/LogPanel.vue'
import ActionPanel from '@components/BasicSettings/ActionPanel.vue'
import { useSettingsStore } from '@/stores/settingsStore'

const router = useRouter()
const settingsStore = useSettingsStore()

const defaultFormState = {
  selectedFields: ['repository', 'commitId', 'shortHash', 'author', 'date', 'message'],
  statsDimension: 'none',
  repoPath: '',
  scanSubfolders: true,
  selectedRepos: [],
  branches: [],
  maxCommits: 0,
  authorFilter: [],
  dateRange: [dayjs().startOf('month'), dayjs()],
  outputFormat: 'json'
}

const form = reactive({ ...defaultFormState })

const scanning = ref(false)
const hasResults = ref(false)
const repoStatus = ref<'valid' | 'invalid' | 'warning' | 'none'>('none')
const logPanelRef = ref<InstanceType<typeof LogPanel> | null>(null)
const settingsFormRef = ref<InstanceType<typeof SettingsForm> | null>(null)
const currentLogs = ref<string[]>([]) // 用于存储当前扫描的日志

const resetForm = () => {
  Object.assign(form, defaultFormState)
  repoStatus.value = 'none'
  message.success('配置已重置')
}

const addLog = (msg: string, type: Log['type'] = 'info') => {
  const timestamp = dayjs().format('HH:mm:ss')
  const formattedLog = `[${timestamp}] ${msg}`
  currentLogs.value.push(formattedLog)
  logPanelRef.value?.addLog(msg, type)
}

const validateRepoPath = async (path: string) => {
  if (form.scanSubfolders) {
    repoStatus.value = 'warning'
    return
  }
  if (!path) {
    repoStatus.value = 'none'
    return
  }
  try {
    const isValid = await window.api.validateRepoPath(path)
    repoStatus.value = isValid ? 'valid' : 'invalid'
  } catch (error) {
    repoStatus.value = 'invalid'
  }
}

const startScan = async () => {
  if (!form.repoPath) return message.warning('请选择Git仓库路径')
  if (form.selectedFields.length === 0) return message.warning('请至少选择一个字段')
  if (form.scanSubfolders && form.selectedRepos.length === 0)
    return message.warning('请至少选择一个子仓库进行扫描')
  if (!form.scanSubfolders && repoStatus.value !== 'valid')
    return message.warning('请选择一个有效的Git仓库')

  addLog(`开始扫描仓库: ${form.repoPath}`)

  const scanOptions = {
    authorFilter: [...form.authorFilter],
    dateRange: form.dateRange.map((d) => d.format('YYYY-MM-DD HH:mm:ss')) as [string, string],
    selectedFields: [...form.selectedFields],
    maxCommits: form.maxCommits || undefined,
    branches: [...form.branches],
    scanSubfolders: form.scanSubfolders,
    selectedRepos: [...form.selectedRepos]
  }

  addLog(`扫描选项: ${JSON.stringify(scanOptions, null, 2)}`, 'info')

  try {
    const commits = await window.api.scanGitRepo(form.repoPath, scanOptions)

    addLog(`扫描完成，共找到 ${commits.length} 条提交记录`, 'success')
    hasResults.value = true
    localStorage.setItem('gitCommits', JSON.stringify(commits)) // 保留这个用于“保存结果”功能

    // --- FIX START: 直接保存到扫描历史 ---
    const history = JSON.parse(localStorage.getItem('scanHistory') || '[]')
    const newRecord = {
      id: dayjs().valueOf().toString(),
      repoPath: form.repoPath || '未知仓库',
      scanTime: dayjs().toISOString(),
      status: 'success',
      totalCommits: commits.length,
      scanOptions: { ...form },
      log: [...currentLogs.value],
      results: commits
    }
    history.unshift(newRecord)
    localStorage.setItem('scanHistory', JSON.stringify(history))
    // --- FIX END ---

    // 跳转到扫描记录页面
    router.push({ name: 'ScanHistory' })

    const appSettings = settingsStore.appSettings
    if (appSettings.system?.clearScanConfigOnFinish) {
      resetForm()
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    addLog(`扫描失败: ${errorMsg}`, 'error')
    message.error(`扫描失败: ${errorMsg}`)
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

const scanAuthors = () => {
  if (settingsFormRef.value) {
    settingsFormRef.value.loadAuthors()
  }
}
</script>

<style scoped>
:deep(.form-row-label) {
  width: auto;
}

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
</style>
