<template>
  <a-card class="results-component" id="results-section">
    <template #title>
      <div class="card-header">
        <span>扫描结果 {{ commits.length > 0 ? `(${commits.length} 条记录)` : '(暂无数据)' }}</span>
        <div class="header-actions">
          <a-radio-group v-model:value="viewMode" size="small">
            <a-radio-button value="table">表格视图</a-radio-button>
            <a-radio-button value="text">文本视图</a-radio-button>
          </a-radio-group>
          <a-button type="primary" @click="exportResults" :disabled="commits.length === 0">
            <template #icon><DownloadOutlined /></template>
            导出结果
          </a-button>
        </div>
      </div>
    </template>

    <!-- 表格视图 -->
    <div v-if="commits.length > 0">
      <div v-if="viewMode === 'table'" class="table-view">
        <a-table :data-source="pagedCommits" :columns="columns" :pagination="false" bordered size="small">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'hash'">
              {{ record.hash.substring(0, 7) }}
            </template>
            <template v-else-if="column.key === 'changes'">
              <span class="additions">+{{ record.additions }}</span>
              <span class="deletions">-{{ record.deletions }}</span>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button size="small" @click="viewCommitDetails(record)"> 详情 </a-button>
            </template>
          </template>
        </a-table>

        <!-- 分页控件 -->
        <div class="pagination-container">
          <a-pagination
            v-model:current="currentPage"
            v-model:pageSize="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            show-size-changer
            :total="commits.length"
            @showSizeChange="handleSizeChange"
          />
        </div>
      </div>

      <!-- 文本视图 -->
      <div v-else-if="viewMode === 'text'" class="text-view">
        <a-textarea :rows="15" :value="textViewContent" readonly />
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-else class="no-data">
      <a-empty description="暂无提交记录" />
    </div>

    <!-- 提交详情对话框 -->
    <a-modal v-model:open="detailsDialogVisible" title="提交详情" width="70%">
      <div v-if="selectedCommit" class="commit-details">
        <div class="detail-item">
          <div class="detail-label">提交哈希:</div>
          <div class="detail-value">{{ selectedCommit.hash }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">作者:</div>
          <div class="detail-value">
            {{ selectedCommit.author }} &lt;{{ selectedCommit.email }}&gt;
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">日期:</div>
          <div class="detail-value">{{ selectedCommit.date }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">提交信息:</div>
          <div class="detail-value message">{{ selectedCommit.message }}</div>
        </div>
        <div class="detail-item files">
          <div class="detail-label">变更文件:</div>
          <div class="detail-value">
            <a-table :data-source="selectedCommit.files" :columns="fileColumns" bordered size="small">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'changes'">
                  <span class="additions">+{{ record.additions }}</span>
                  <span class="deletions">-{{ record.deletions }}</span>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'
import { message } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import type { PropType } from 'vue'

// 接口定义
interface CommitFile {
  path: string
  status: string
  additions: number
  deletions: number
}

interface Commit {
  hash: string
  author: string
  email: string
  date: string
  message: string
  files: CommitFile[]
  additions: number
  deletions: number
}

// 接收父组件传入的属性
const props = defineProps({
  commits: { type: Array as PropType<Commit[]>, required: true },
  exportPath: { type: String, required: true }
})

const emit = defineEmits(['exportResults'])

// 组件状态
const viewMode = ref('table')
const detailsDialogVisible = ref(false)
const selectedCommit = ref<Commit | null>(null)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 分页后的数据
const pagedCommits = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return props.commits.slice(startIndex, endIndex)
})

// 处理每页显示数量变化
const handleSizeChange = (current: number, size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
}

// 文本视图内容
const textViewContent = computed(() => {
  return props.commits
    .map((commit) => {
      return `提交: ${commit.hash}\n作者: ${commit.author} <${commit.email}>\n日期: ${commit.date}\n\n    ${commit.message}\n\n变更: +${commit.additions} -${commit.deletions}\n----------------------------------------`
    })
    .join('\n\n')
})

// 查看提交详情
const viewCommitDetails = (commit: Commit) => {
  selectedCommit.value = commit
  detailsDialogVisible.value = true
}

// 导出结果
const exportResults = () => {
  if (props.commits.length === 0) {
    message.warning('没有可导出的结果')
    return
  }

  if (!props.exportPath) {
    message.warning('请先在高级筛选中选择导出路径')
    return
  }

  emit('exportResults')
}

// 重置分页
const resetPagination = () => {
  currentPage.value = 1
  pageSize.value = 10
}

const columns = ref([
    { title: '提交哈希', dataIndex: 'hash', key: 'hash', width: 100 },
    { title: '作者', dataIndex: 'author', key: 'author', width: 120 },
    { title: '日期', dataIndex: 'date', key: 'date', width: 180, sorter: (a: Commit, b: Commit) => new Date(a.date).getTime() - new Date(b.date).getTime() },
    { title: '提交信息', dataIndex: 'message', key: 'message' },
    { title: '变更统计', key: 'changes', width: 120 },
    { title: '操作', key: 'action', width: 100 },
]);

const fileColumns = ref([
    { title: '文件路径', dataIndex: 'path', key: 'path' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
    { title: '变更', dataIndex: 'changes', key: 'changes', width: 120 },
]);


// 暴露方法给父组件调用
defineExpose({
  resetPagination
})
</script>

<style scoped>
.results-component {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.table-view {
  width: 100%;
  overflow-x: auto;
}

.text-view {
  width: 100%;
}

.additions {
  color: #67c23a;
  margin-right: 8px;
}

.deletions {
  color: #f56c6c;
}

.no-data {
  padding: 40px 0;
  text-align: center;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.commit-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
}

.detail-label {
  font-weight: bold;
  width: 100px;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
}

.detail-value.message {
  white-space: pre-wrap;
}

.detail-item.files {
  flex-direction: column;
}

.detail-item.files .detail-label {
  margin-bottom: 8px;
}
</style>
