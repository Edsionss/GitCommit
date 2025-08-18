<template>
  <div class="config-column">
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

        <div class="form-row">
          <label class="form-row-label">统计选项</label>
          <a-select v-model:value="form.statsDimension" placeholder="选择统计维度" style="width: 200px;">
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
      <a-form :model="form" layout="vertical">
        <a-form-item label="仓库路径">
          <a-input
            v-model:value="form.repoPath"
            placeholder="请输入Git仓库路径"
            @change="$emit('validate-repo-path')"
          >
            <template #prefix>
              <CheckCircleFilled v-if="isValidRepo" style="color: green" />
              <CloseCircleFilled v-else-if="form.repoPath" style="color: red" />
            </template>
            <template #suffix>
              <CloseCircleFilled
                v-if="form.repoPath"
                class="clear-icon"
                @click="$emit('clear-repo-path')"
              />
            </template>
            <template #addonAfter>
              <span
                @click="$emit('select-repo-path')"
                style="cursor: pointer"
              >
                <FolderOutlined />
              </span>
            </template>
          </a-input>

          <div class="recent-paths">
            <div class="recent-paths-header">
              <span>最近扫描位置</span>
              <a-button type="link" @click="$emit('clear-repo-history')" :disabled="!repoHistory || repoHistory.length === 0">清空历史</a-button>
            </div>
            <div class="recent-paths-list">
              <a-empty v-if="!repoHistory || repoHistory.length === 0" description="暂无历史记录" />
              <div
                v-else
                v-for="item in repoHistory"
                :key="item.path"
                class="recent-path-item"
                @click="$emit('select-recent-path', item.path)"
              >
                <div class="path-info">
                  <span class="path-text">{{ item.path }}</span>
                  <span class="path-time">{{ formatLastAccessed(item.lastAccessed) }}</span>
                </div>
                <div class="path-actions">
                  <a-button
                    type="text"
                    danger
                    @click.stop="$emit('remove-repo-from-history', item.path)"
                  >
                    <DeleteOutlined />
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </a-form-item>

        <div class="form-row">
          <label class="form-row-label">自动扫描子文件夹</label>
          <a-switch v-model:checked="form.scanSubfolders" />
        </div>

        <a-form-item label="选择仓库">
           <a-input-group compact>
            <a-select
              v-model:value="form.selectedRepos"
              mode="multiple"
              style="width: calc(100% - 110px);"
              :disabled="!form.scanSubfolders || !form.repoPath"
              placeholder="请先选择父目录并扫描子仓库"
              :options="subRepos.map(repo => ({ value: repo, label: repo.replace(form.repoPath, '') }))"
            />
            <a-button 
              style="width: 110px;"
              @click="$emit('discover-sub-repos')" 
              :loading="isDiscoveringRepos" 
              :disabled="!form.scanSubfolders || !form.repoPath"
            >
              扫描子仓库
            </a-button>
          </a-input-group>
        </a-form-item>

        <a-form-item label="分支选择">
          <a-select
            v-model:value="form.branch"
            show-search
            placeholder="默认为当前分支 (HEAD)，可搜索"
            :options="availableBranches.map((branch) => ({ value: branch }))"
            :loading="branchesLoading"
            @focus="$emit('load-branches')"
          >
            <template #prefix>
              <BranchesOutlined />
            </template>
          </a-select>
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
              @click="$emit('load-authors')"
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
            <a-radio-group :value="datePreset" @change="(e) => $emit('handle-preset-change', e)">
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
  </div>
</template>

<script setup lang="ts">
import {
  FolderOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteOutlined,
  BranchesOutlined,
  SyncOutlined,
  ClearOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

defineProps({
  form: {
    type: Object,
    required: true
  },
  isValidRepo: Boolean,
  isSelectingPath: Boolean,
  repoHistory: Array,
  availableAuthors: Array,
  authorsLoading: Boolean,
  datePreset: String,
  subRepos: Array,
  isDiscoveringRepos: Boolean,
  availableBranches: Array,
  branchesLoading: Boolean
})

defineEmits([
  'validate-repo-path',
  'clear-repo-path',
  'select-repo-path',
  'clear-repo-history',
  'select-recent-path',
  'remove-repo-from-history',
  'load-authors',
  'handle-preset-change',
  'discover-sub-repos',
  'load-branches'
])

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
</style>
