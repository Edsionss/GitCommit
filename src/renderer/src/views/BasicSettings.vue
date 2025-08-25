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
        :scanOptions="scanOptionsRef"
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
import _ from 'lodash'
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import SettingsForm from '@components/BasicSettings/SettingsForm.vue'
import LogPanel from '@components/BasicSettings/LogPanel.vue'
import ActionPanel from '@components/BasicSettings/ActionPanel.vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useScanStore } from '@/stores/scanStore'
import { storeToRefs } from 'pinia'
const scanStore = useScanStore()
const router = useRouter()
const settingsStore = useSettingsStore()
const { getAiConfig, getGitConfig } = storeToRefs(settingsStore)
const clearScanConfigOnFinish = computed(() => getGitConfig.value.clearScanConfigOnFinish)

const { getGitCommits } = storeToRefs(scanStore)
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
  outputFormat: 'json',
  AutoAiAnalysis: true,
  analysisRules: `
    1.根据这段提交记录的日期先得到其中的工作日
    2.根据提交内容和提交代码行数以及提交信息进行综合分析
    3.总结出与工作日相对应的人天信息，综合分配每个任务的人天
    4.只需要50字`
}

const form = reactive({ ...defaultFormState })
const scanOptionsRef = ref<any>(null)

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
    selectedRepos: [...form.selectedRepos],
    AutoAiAnalysis: !!form.AutoAiAnalysis,
    analysisRules: form.analysisRules
  }
  scanOptionsRef.value = scanOptions
  addLog(`扫描选项: ${JSON.stringify(scanOptions, null, 2)}`, 'info')

  try {
    addLog(`已开始扫描${scanOptions.AutoAiAnalysis ? '和进行AI分析' : ''}`, 'info')
    const { commits, analysisResult } = await window.api.scanGitRepo(
      form.repoPath,
      scanOptions,
      JSON.parse(JSON.stringify(getAiConfig.value || null))
    )
    addLog(`扫描完成，共找到 ${commits.length} 条提交记录`, 'success')
    hasResults.value = true
    scanStore.setGitCommits(commits)
    const newRecord = {
      repoPath: form.repoPath || '未知仓库',
      scanTime: dayjs().toISOString(),
      status: 'success',
      totalCommits: commits.length,
      scanOptions: { ...form },
      log: [...currentLogs.value],
      results: commits,
      analysisResult
    }
    scanStore.setScanRecordList(newRecord)
    // 跳转到扫描记录页面
    if (commits && commits.length) {
      router.push({ name: 'ScanHistory' })
      if (clearScanConfigOnFinish.value) {
        resetForm()
      }
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
    const commits = getGitCommits.value
    if (commits.length === 0) return message.warning('没有可保存的结果')
    const result = await exportApi.exportCommits(commits, form.outputFormat)
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
