'''
<template>
  <div class="config-column">
    <a-card class="settings-card">
      <template #title>
        <div class="card-header">
          <div>字段与统计配置</div>
          <div @click="filterFiledShow = !filterFiledShow" style="cursor: pointer">
            <DownOutlined v-if="!filterFiledShow" />
            <UpOutlined v-else />
          </div>
        </div>
      </template>
      <div class="head-container" v-show="filterFiledShow">
        <a-form :model="localForm" layout="vertical">
          <a-form-item label="字段选择">
            <a-checkbox-group v-model:value="localForm.selectedFields">
              <a-checkbox
                :value="check.value"
                v-for="check in checkboxOptions"
                :key="check.value"
                >{{ check.label }}</a-checkbox
              >
            </a-checkbox-group>
          </a-form-item>

          <div class="form-row">
            <label class="form-row-label">统计选项</label>
            <a-select
              v-model:value="localForm.statsDimension"
              placeholder="选择统计维度"
              style="width: 200px"
            >
              <a-select-option
                :value="select.value"
                v-for="select in selectOptions"
                :key="select.value"
                >{{ select.label }}</a-select-option
              >
            </a-select>
          </div>
          <div class="form-row">
            <label class="form-row-label">自动AI分析</label>
            <a-switch v-model:checked="localForm.AutoAiAnalysis" />
          </div>
        </a-form>
      </div>
    </a-card>

    <a-card class="settings-card">
      <template #title>
        <div class="card-header">
          <span>仓库与过滤配置</span>
          <div @click="repoFilterShow = !repoFilterShow" style="cursor: pointer">
            <DownOutlined v-if="!repoFilterShow" />
            <UpOutlined v-else />
          </div>
        </div>
      </template>
      <div class="body-content" v-show="repoFilterShow">
        <a-form :model="localForm" layout="vertical">
          <a-form-item label="仓库路径">
            <a-input
              v-model:value="localForm.repoPath"
              placeholder="请输入Git仓库路径"
              @change="validateRepoPath"
            >
              <template #prefix>
                <CheckCircleFilled v-if="repoStatus === 'valid'" style="color: green" />
                <ExclamationCircleFilled v-if="repoStatus === 'warning'" style="color: orange" />
                <CloseCircleFilled
                  v-else-if="repoStatus === 'invalid' && localForm.repoPath"
                  style="color: red"
                />
              </template>
              <template #suffix>
                <CloseCircleFilled
                  v-if="localForm.repoPath"
                  class="clear-icon"
                  @click="clearRepoPath"
                />
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
                <a-empty
                  v-if="!repoHistory || repoHistory.length === 0"
                  description="暂无历史记录"
                />
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
            <label class="form-row-label">扫描子文件夹</label>
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
                  subRepos.map((repo) => ({
                    value: repo.path,
                    label: repo.name
                  }))
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
                  !localForm.scanSubfolders || !localForm.repoPath || subRepos.length === 0
                "
              >
                <template #icon><CheckSquareOutlined /></template> 全选
              </a-button>
              <a-button
                type="link"
                @click="clearAllRepos"
                :disabled="
                  !localForm.scanSubfolders ||
                  !localForm.repoPath ||
                  localForm.selectedRepos.length === 0
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
                :placeholder="
                  localForm.scanSubfolders
                    ? '多仓库模式不支持选择分支'
                    : '默认为当前分支 (HEAD)，可搜索'
                "
                :options="availableBranches.map((branch) => ({ value: branch }))"
                :loading="branchesLoading"
                style="width: calc(100% - 110px)"
                :disabled="localForm.scanSubfolders"
              >
                <template #prefix>
                  <BranchesOutlined />
                </template>
              </a-select>
              <a-button
                style="width: 110px"
                @click="loadBranches"
                :loading="branchesLoading"
                :disabled="repoStatus !== 'valid' || localForm.scanSubfolders"
              >
                扫描分支
              </a-button>
            </a-input-group>
            <div class="sub-actions">
              <a-button
                type="link"
                @click="selectAllBranches"
                :disabled="
                  localForm.scanSubfolders || !availableBranches || availableBranches.length === 0
                "
              >
                <template #icon><CheckSquareOutlined /></template> 全选
              </a-button>
              <a-button
                type="link"
                @click="localForm.branches = []"
                :disabled="
                  localForm.scanSubfolders || !localForm.branches || localForm.branches.length === 0
                "
              >
                <template #icon><ClearOutlined /></template> 清空
              </a-button>
            </div>
          </a-form-item>

          <div class="form-row">
            <label class="form-row-label">最大提交数</label>
            <a-input-number v-model:value="localForm.maxCommits" :min="0" :max="10000" />
            <span class="hint">0表示不限制</span>
          </div>

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
                :disabled="isScanAuthorDisabled"
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
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, toRef, ref } from 'vue'
import {
  FolderOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteOutlined,
  BranchesOutlined,
  SyncOutlined,
  ClearOutlined,
  CheckSquareOutlined,
  ExclamationCircleFilled,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons-vue'
import { useSettingsForm } from './hooks/settingsForm'

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  repoStatus: {
    type: String as () => 'valid' | 'invalid' | 'warning' | 'none',
    required: true
  }
})

const filterFiledShow: any = ref(true)
const repoFilterShow: any = ref(true)

const checkboxOptions = [
  { value: 'repository', label: '仓库名称' },
  { value: 'repoPath', label: '仓库完整路径' },
  { value: 'commitId', label: '完整提交ID' },
  { value: 'shortHash', label: '短提交ID' },
  { value: 'author', label: '作者' },
  { value: 'email', label: '邮箱' },
  { value: 'date', label: '日期' },
  { value: 'message', label: '提交消息' },
  { value: 'body', label: '详细描述' },
  { value: 'filesChanged', label: '变更文件数' },
  { value: 'insertions', label: '新增行数' },
  { value: 'deletions', label: '删除行数' }
]
const selectOptions = [
  { value: 'author', label: '按作者统计' },
  { value: 'repository', label: '按仓库统计' },
  { value: 'date', label: '按日期统计' },
  { value: 'none', label: '不按任何' }
]
const emit = defineEmits(['update:form', 'add-log', 'validate-repo-path', 'update:repoStatus'])

const localForm = reactive(props.form)

watch(
  localForm,
  (newVal) => {
    emit('update:form', newVal)
  },
  { deep: true }
)

const {
  subRepos,
  isDiscoveringRepos,
  repoHistory,
  availableAuthors,
  authorsLoading,
  branchesLoading,
  availableBranches,
  datePreset,
  isScanAuthorDisabled,
  loadBranches,
  clearRepoPath,
  selectRepoPath,
  validateRepoPath,
  loadAuthors,
  handlePresetChange,
  selectRecentPath,
  removeRepoFromHistory,
  clearRepoHistory,
  discoverSubRepos,
  selectAllRepos,
  clearAllRepos,
  selectAllBranches,
  selectAllAuthors,
  formatLastAccessed
} = useSettingsForm(localForm, toRef(props, 'repoStatus'), emit)

defineExpose({ loadAuthors })
</script>

<style lang="scss" scoped src="./SettingsForm.scss"></style>
