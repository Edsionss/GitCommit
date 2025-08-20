<template>
  <div class="config-column">
    <a-card class="settings-card">
      <template #title>
        <div class="card-header">
          <span>字段与统计配置</span>
        </div>
      </template>
      <a-form :model="localForm" layout="vertical">
        <a-form-item label="字段选择">
          <a-checkbox-group v-model:value="localForm.selectedFields">
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

        <div class="form-row">
          <label class="form-row-label">统计选项</label>
          <a-select
            v-model:value="localForm.statsDimension"
            placeholder="选择统计维度"
            style="width: 200px"
          >
            <a-select-option value="author">按作者统计</a-select-option>
            <a-select-option value="repository">按仓库统计</a-select-option>
            <a-select-option value="date">按日期统计</a-select-option>
            <a-select-option value="none">不按任何</a-select-option>
          </a-select>
        </div>
      </a-form>
    </a-card>

    <a-card class="settings-card">
      <template #title>
        <div class="card-header">
          <span>仓库与过滤配置</span>
        </div>
      </template>
      <a-form :model="localForm" layout="vertical">
        <a-form-item label="仓库路径">
          <a-input
            v-model:value="localForm.repoPath"
            placeholder="请输入Git仓库路径"
            @change="validateRepoPath"
          >
            <template #prefix>
              <CheckCircleFilled v-if="isValidRepo" style="color: green" />
              <CloseCircleFilled v-else-if="localForm.repoPath" style="color: red" />
            </template>
            <template #suffix>
              <CloseCircleFilled v-if="localForm.repoPath" class="clear-icon" @click="clearRepoPath" />
            </template>
            <template #addonAfter>
              <span @click="selectRepoPath" style="cursor: pointer">
                <FolderOutlined />
              </span>
            </template>
          </a-input>

          <div class="recent-paths">
            <div class="recent-paths-header">
              <span>最近扫描位置</span>
              <a-button
                type="link"
                @click="clearRepoHistory"
                :disabled="!repoHistory || repoHistory.length === 0"
                >清空历史</a-button
              >
            </div>
            <div class="recent-paths-list">
              <a-empty v-if="!repoHistory || repoHistory.length === 0" description="暂无历史记录" />
              <div
                v-else
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

        <div class="form-row">
          <label class="form-row-label">自动扫描子文件夹</label>
          <a-switch v-model:checked="localForm.scanSubfolders" />
        </div>

        <a-form-item label="选择仓库">
          <a-input-group compact>
            <a-select
              v-model:value="localForm.selectedRepos"
              mode="multiple"
              style="width: calc(100% - 110px)"
              :disabled="!localForm.scanSubfolders || !localForm.repoPath"
              placeholder="请先选择父目录并扫描子仓库"
              :options="
                subRepos.map((repo) => ({ value: repo, label: repo.replace(localForm.repoPath, '') }))
              "
            />
            <a-button
              style="width: 110px"
              @click="discoverSubRepos"
              :loading="isDiscoveringRepos"
              :disabled="!localForm.scanSubfolders || !localForm.repoPath"
            >
              扫描子仓库
            </a-button>
          </a-input-group>
          <div class="sub-actions">
            <a-button
              type="link"
              @click="selectAllRepos"
              :disabled="
                !localForm.scanSubfolders || !localForm.repoPath || !localForm.scanSubfolders || !localForm.repoPath
              "
            >
              <template #icon><CheckSquareOutlined /></template> 全选
            </a-button>
            <a-button
              type="link"
              @click="clearAllRepos"
              :disabled="
                !localForm.scanSubfolders || !localForm.repoPath || !localForm.scanSubfolders || !localForm.repoPath
              "
            >
              <template #icon><ClearOutlined /></template> 清空
            </a-button>
          </div>
        </a-form-item>

        <a-form-item label="分支选择">
          <a-input-group compact>
            <a-select
              v-model:value="localForm.branches"
              mode="multiple"
              show-search
              placeholder="默认为当前分支 (HEAD)，可搜索"
              :options="availableBranches.map((branch) => ({ value: branch }))"
              :loading="branchesLoading"
              style="width: calc(100% - 110px)"
            >
              <template #prefix>
                <BranchesOutlined />
              </template>
            </a-select>
            <a-button
              style="width: 110px"
              @click="loadBranches"
              :loading="branchesLoading"
              :disabled="!isValidRepo && !localForm.scanSubfolders"
            >
              扫描分支
            </a-button>
          </a-input-group>
          <div class="sub-actions">
            <a-button
              type="link"
              @click="selectAllBranches"
              :disabled="!availableBranches || availableBranches.length === 0"
            >
              <template #icon><CheckSquareOutlined /></template> 全选
            </a-button>
            <a-button
              type="link"
              @click="localForm.branches = []"
              :disabled="!localForm.branches || localForm.branches.length === 0"
            >
              <template #icon><ClearOutlined /></template> 清空
            </a-button>
          </div>
        </a-form-item>

        <a-form-item label="最大提交数" class="form-row-inline">
          <a-input-number v-model:value="localForm.maxCommits" :min="0" :max="10000" />
          <span class="hint">0表示不限制</span>
        </a-form-item>

        <a-form-item label="作者过滤">
          <a-select
            v-model:value="localForm.authorFilter"
            mode="tags"
            placeholder="选择或输入作者名称/邮箱"
            style="width: 100%"
            :options="availableAuthors.map((author) => ({ value: author }))"
            :loading="authorsLoading"
          />
          <div class="sub-actions">
            <a-button
              type="link"
              @click="loadAuthors"
              :loading="authorsLoading"
              :disabled="!isValidRepo || localForm.scanSubfolders"
            >
              <template #icon><SyncOutlined /></template> 扫描作者
            </a-button>
            <a-button
              type="link"
              @click="selectAllAuthors"
              :disabled="!availableAuthors || availableAuthors.length === 0"
            >
              <template #icon><CheckSquareOutlined /></template> 全选
            </a-button>
            <a-button
              type="link"
              @click="localForm.authorFilter = []"
              :disabled="!localForm.authorFilter || localForm.authorFilter.length === 0"
            >
              <template #icon><ClearOutlined /></template> 清空
            </a-button>
          </div>
        </a-form-item>

        <a-form-item label="时间范围">
          <div class="date-range-selector">
            <a-radio-group :value="datePreset" @change="handlePresetChange">
              <a-radio-button value="今日">今日</a-radio-button>
              <a-radio-button value="本周">本周</a-radio-button>
              <a-radio-button value="本月">本月</a-radio-button>
              <a-radio-button value="自定义">自定义</a-radio-button>
            </a-radio-group>
            <a-range-picker
              v-model:value="localForm.dateRange"
              show-time
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              :disabled="datePreset !== '自定义'"
            />
          </div>
        </a-form-item>

        <a-form-item label="输出格式">
          <a-select v-model:value="localForm.outputFormat" placeholder="选择输出格式">
            <a-select-option value="json">JSON</a-select-option>
            <a-select-option value="csv">CSV</a-select-option>
            <a-select-option value="excel">Excel</a-select-option>
            <a-select-option value="html">HTML</a-select-option>
            <a-select-option value="markdown">Markdown</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import {
  FolderOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteOutlined,
  BranchesOutlined,
  SyncOutlined,
  ClearOutlined,
  CheckSquareOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { gitService } from '@services/GitService'
import dayjs, { Dayjs } from 'dayjs'

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  isValidRepo: Boolean
})

const emit = defineEmits(['update:form', 'add-log', 'validate-repo-path'])

const localForm = reactive(props.form)

watch(
  localForm,
  (newVal) => {
    emit('update:form', newVal)
  },
  { deep: true }
)

const PRESET_RANGES: { [key: string]: [Dayjs, Dayjs] | string } = {
  今日: [dayjs().startOf('day'), dayjs().endOf('day')],
  本周: [dayjs().startOf('week'), dayjs().endOf('week')],
  本月: [dayjs().startOf('month'), dayjs().endOf('month')],
  自定义: 'custom'
}

const subRepos = ref<string[]>([])
const isDiscoveringRepos = ref(false)
const repoHistory = ref(gitService.getRepoHistory())
const availableAuthors = ref<string[]>([])
const authorsLoading = ref(false)
const branchesLoading = ref(false)
const availableBranches = ref<string[]>([])
const datePreset = ref('本月')
const isSelectingPath = ref(false)

watch(
  () => localForm.scanSubfolders,
  (newVal) => {
    localForm.selectedRepos = []
    subRepos.value = []
    // 当开启子文件夹扫描时，重置仓库验证状态
    if (newVal) {
      emit('validate-repo-path', '')
    }
    if (newVal === false && props.isValidRepo) {
      localForm.selectedRepos = [localForm.repoPath]
    }
  }
)

watch(
  () => props.isValidRepo,
  (newVal) => {
    availableBranches.value = []
    localForm.branches = []
    if (newVal) {
      message.success('验证成功，是有效的Git仓库')
      emit('add-log', `选择并验证仓库: ${localForm.repoPath} 有效`, 'success')
      if (!localForm.scanSubfolders) {
        localForm.selectedRepos = [localForm.repoPath]
      }
      loadBranches()
      loadAuthors()
    } else {
      if (localForm.repoPath && !localForm.scanSubfolders) {
        message.error('验证失败，当前路径不是有效的Git仓库')
        emit('add-log', `选择的目录无效: ${localForm.repoPath}`, 'error')
      }
    }
  }
)

const loadBranches = async () => {
  // if (!props.isValidRepo) return
  branchesLoading.value = true
  try {
    emit('add-log', `加载分支列表: ${localForm.repoPath}`, 'info')
    const branches = await window.api.getRepoBranches(localForm.repoPath)
    availableBranches.value = branches
    if (branches.length > 0) {
      emit('add-log', `成功加载 ${branches.length} 个分支`, 'success')
    } else {
      emit('add-log', '未找到任何分支', 'info')
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    emit('add-log', `加载分支失败: ${msg}`, 'error')
    message.error(`加载分支失败: ${msg}`)
  } finally {
    branchesLoading.value = false
  }
}

const clearRepoPath = () => {
  localForm.repoPath = ''
  emit('validate-repo-path', '')
  availableAuthors.value = []
  localForm.authorFilter = []
  subRepos.value = []
  localForm.selectedRepos = []
}

const selectRepoPath = async () => {
  isSelectingPath.value = true
  try {
    const result = await window.api.selectDirectory()
    if (result) {
      const { path } = result
      localForm.repoPath = path
      emit('validate-repo-path', path)
      gitService.addToHistory(path)
      repoHistory.value = gitService.getRepoHistory()

      if (localForm.scanSubfolders) {
        message.success(`已选择目录，请点击“扫描子仓库”按钮: ${path}`)
        emit('add-log', `已选择父目录进行子文件夹扫描: ${path}`, 'info')
      }
    }
  } catch (error) {
    message.error('选择目录失败')
    console.error('Error in selectRepoPath:', error)
  } finally {
    isSelectingPath.value = false
  }
}

const validateRepoPath = () => {
  if (!localForm.scanSubfolders) {
    emit('validate-repo-path', localForm.repoPath)
  }
  if (localForm.repoPath) {
    gitService.addToHistory(localForm.repoPath)
    repoHistory.value = gitService.getRepoHistory()
  }
}

const loadAuthors = async () => {
  if (!props.isValidRepo) {
    message.warning('请先选择有效的Git仓库')
    return
  }
  authorsLoading.value = true
  try {
    emit('add-log', `加载仓库作者列表: ${localForm.repoPath}`)
    const authors = await window.api.getRepoAuthors(localForm.repoPath)
    availableAuthors.value = authors
    emit('add-log', `找到 ${authors.length} 个作者`, 'success')
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    emit('add-log', `加载作者列表失败: ${errorMsg}`, 'error')
    message.error('加载作者列表失败')
  } finally {
    authorsLoading.value = false
  }
}

defineExpose({
  loadAuthors
})

const handlePresetChange = (e: any) => {
  const preset = e.target.value
  datePreset.value = preset
  if (preset === '自定义') return
  const range = PRESET_RANGES[preset]
  if (Array.isArray(range)) {
    localForm.dateRange = [range[0], range[1]]
  }
}

const selectRecentPath = (path: string) => {
  localForm.repoPath = path
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
  if (!localForm.repoPath) {
    message.warning('请先选择一个父目录')
    return
  }
  isDiscoveringRepos.value = true
  emit('add-log', `正在扫描子仓库: ${localForm.repoPath}`, 'info')
  try {
    const result = await window.api.getSubRepos(localForm.repoPath)
    if (result.success && result.repos) {
      subRepos.value = result.repos
      if (result.repos.length > 0) {
        emit('add-log', `发现了 ${result.repos.length} 个子仓库`, 'success')
        message.success(`发现了 ${result.repos.length} 个子仓库`)
      } else {
        emit('add-log', '未发现任何子仓库', 'info')
        message.info('未发现任何子仓库')
      }
    } else {
      throw new Error(result.error || 'An unknown error occurred')
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    message.error(`扫描子仓库时出错: ${errorMsg}`)
    emit('add-log', `扫描子仓库时出错: ${errorMsg}`, 'error')
  } finally {
    isDiscoveringRepos.value = false
  }
}

const selectAllRepos = () => {
  localForm.selectedRepos = [...subRepos.value]
}

const clearAllRepos = () => {
  localForm.selectedRepos = []
}

const selectAllBranches = () => {
  localForm.branches = [...availableBranches.value]
}

const selectAllAuthors = () => {
  localForm.authorFilter = [...availableAuthors.value]
}

const formatLastAccessed = (timestamp: string): string => {
  const date = dayjs(timestamp)
  const now = dayjs()
  if (date.isSame(now, 'day')) return '今天 ' + date.format('HH:mm')
  if (date.isSame(now.subtract(1, 'day'), 'day')) return '昨天 ' + date.format('HH:mm')
  return date.format('MM-DD HH:mm')
}
</script>

<style scoped>
.config-column {
  flex: 3;
  min-width: 0;
  overflow-y: auto;
}
.settings-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
.sub-actions {
  display: flex;
  justify-content: flex-start;
  gap: 8px;
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
.clear-icon {
  cursor: pointer;
  color: #aaa;
}
.clear-icon:hover {
  color: #888;
}
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.form-row-label {
  width: 150px;
  text-align: right;
  margin-right: 8px;
  color: rgba(0, 0, 0, 0.88);
  font-size: 14px;
}
.form-row-label::after {
  content: ':';
  position: relative;
  top: -0.5px;
  margin-inline-start: 2px;
  margin-inline-end: 8px;
}
.form-row-inline {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.form-row-inline :deep(.ant-form-item-label) {
  width: auto;
  padding-bottom: 0;
}
.form-row-inline :deep(.ant-form-item-control) {
  flex-grow: 1;
}
</style>
