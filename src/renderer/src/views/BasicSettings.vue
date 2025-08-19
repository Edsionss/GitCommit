<template>
  <div class="basic-settings-container">
    <div class="basic-settings-content">
      <SettingsForm
        ref="settingsFormRef"
        :form="form"
        @update:form="Object.assign(form, $event)"
        @add-log="addLog"
        @validate-repo-path="validateRepoPath"
        :is-valid-repo="isValidRepo"
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
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { gitService } from '@services/GitService'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import SettingsForm from '@components/BasicSettings/SettingsForm.vue'
import LogPanel from '@components/BasicSettings/LogPanel.vue'
import ActionPanel from '@components/BasicSettings/ActionPanel.vue'

const router = useRouter()

const defaultFormState = {
  selectedFields: ['repository', 'commitId', 'shortHash', 'author', 'date', 'message'],
  statsDimension: 'none',
  repoPath: '',
  scanSubfolders: false,
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
const isValidRepo = ref(false)
const logPanelRef = ref<InstanceType<typeof LogPanel> | null>(null)
const settingsFormRef = ref<InstanceType<typeof SettingsForm> | null>(null)
const currentLogs = ref<string[]>([]) // 用于存储当前扫描的日志

const resetForm = () => {
  Object.assign(form, defaultFormState)
  message.success('配置已重置')
}

const addLog = (msg: string, type: Log['type'] = 'info') => {
  const timestamp = dayjs().format('HH:mm:ss')
  const formattedLog = `[${timestamp}] ${msg}`
  currentLogs.value.push(formattedLog)
  logPanelRef.value?.addLog(msg, type)
}

const validateRepoPath = async (path: string) => {
  if (!path) {
    isValidRepo.value = false
    return
  }
  try {
    isValidRepo.value = await window.api.validateRepoPath(path)
  } catch (error) {
    isValidRepo.value = false
  }
}

const startScan = async () => {
  if (!form.repoPath) return message.warning('请选择Git仓库路径')
  if (form.selectedFields.length === 0) return message.warning('请至少选择一个字段')
  if (form.scanSubfolders && form.selectedRepos.length === 0)
    return message.warning('请至少选择一个子仓库进行扫描')
  if (!form.scanSubfolders && !isValidRepo.value) return message.warning('请选择一个有效的Git仓库')

  addLog(`开始扫描仓库: ${form.repoPath}`)

  try {
    const commits = await window.api.scanGitRepo(form.repoPath, {
      authorFilter: form.authorFilter.join(','),
      dateRange: form.dateRange.map((d) => d.format('YYYY-MM-DD HH:mm:ss')) as [string, string],
      selectedFields: [...form.selectedFields],
      maxCommits: form.maxCommits || undefined,
      branches: form.branches.join(','),
      scanSubfolders: form.scanSubfolders,
      selectedRepos: [...form.selectedRepos]
    })

    addLog(`扫描完成，共找到 ${commits.length} 条提交记录`, 'success')
    hasResults.value = true
    localStorage.setItem('gitCommits', JSON.stringify(commits))

    // 跳转到扫描记录页面并传递结果
    router.push({
      name: 'ScanHistory',
      query: {
        scanResult: JSON.stringify({
          commits: commits,
          options: form,
          log: currentLogs.value,
          status: 'success'
        })
      }
    })

    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings)
      if (parsedSettings.system?.clearScanConfigOnFinish) {
        resetForm()
      }
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    addLog(`扫描失败: ${errorMsg}`, 'error')
    message.error(`扫描失败: ${errorMsg}`)

    // 跳转到扫描记录页面并传递失败信息
    router.push({
      name: 'ScanHistory',
      query: {
        scanResult: JSON.stringify({
          commits: [],
          options: form,
          log: currentLogs.value,
          status: 'failed'
        })
      }
    })
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
