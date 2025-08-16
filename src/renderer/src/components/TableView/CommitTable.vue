<template>
  <a-card class="table-card" :bordered="false">
    <template #title>
      <div class="card-header">
        <div v-if="selectedRows.length === 0">提交历史</div>
        <div v-else class="selection-actions">
          <span class="selection-count">已选择 {{ selectedRows.length }} 项</span>
          <a-button type="primary" size="small" @click="$emit('exportSelected')">导出选中</a-button>
          <a-button size="small" @click="$emit('clearSelection')">取消选择</a-button>
        </div>
      </div>
    </template>

    <a-table
      :loading="loading"
      :data-source="paginatedData"
      :columns="tableColumns"
      :row-selection="rowSelection"
      :pagination="false"
      :scroll="{ y: tableHeight }"
      size="middle"
      row-key="commitId"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'repository'">
          <div class="repo-cell">
            <a-tag :color="getRepoColor(record.repository)">{{ record.repository }}</a-tag>
          </div>
        </template>

        <template v-if="column.key === 'shortHash'">
          <div class="hash-cell">
            <span class="hash-value" @click="copyToClipboard(record.commitId)">{{ record.shortHash }}</span>
            <CopyOutlined class="copy-icon" @click="copyToClipboard(record.commitId)" />
          </div>
        </template>

        <template v-if="column.key === 'author'">
          <div class="author-cell" @click="applyAuthorFilter(record.author)">
            <a-avatar class="author-avatar" :size="24">{{ record.author.charAt(0) }}</a-avatar>
            <span class="author-name">{{ record.author }}</span>
          </div>
        </template>

        <template v-if="column.key === 'message'">
          <div class="message-cell">
            <div v-if="hasTags(record.message)" class="message-tags">
              <a-tag class="message-tag" v-for="tag in extractTags(record.message)" :key="tag" color="blue">
                {{ tag }}
              </a-tag>
            </div>
            <span class="message-text">{{ cleanMessage(record.message) }}</span>
          </div>
        </template>

        <template v-if="column.key === 'filesChanged'">
          <a-tag color="purple">{{ record.filesChanged }}</a-tag>
        </template>

        <template v-if="column.key === 'insertions'">
          <span class="insertion">+{{ record.insertions }}</span>
        </template>

        <template v-if="column.key === 'deletions'">
          <span class="deletion">-{{ record.deletions }}</span>
        </template>

        <template v-if="column.key === 'actions'">
          <div class="action-cell">
            <a-button type="link" size="small" @click="viewDetails(record)">详情</a-button>
          </div>
        </template>
      </template>
    </a-table>

    <div class="pagination-container">
      <a-pagination
        :current="currentPage"
        :page-size="pageSize"
        :total="filteredDataLength"
        show-size-changer
        show-quick-jumper
        :page-size-options="['10', '20', '50', '100']"
        @update:current="updateCurrentPage"
        @update:page-size="updatePageSize"
      />
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CopyOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  loading: Boolean,
  paginatedData: Array,
  tableHeight: Number,
  columns: Object,
  formatNumber: Function,
  formatDate: Function,
  formatDateRange: Function,
  hasTags: Function,
  extractTags: Function,
  cleanMessage: Function,
  copyToClipboard: Function,
  viewDetails: Function,
  selectedRows: Array,
  currentPage: Number,
  pageSize: Number,
  filteredDataLength: Number
})

const emit = defineEmits([
  'update:currentPage',
  'update:pageSize',
  'selectionChange',
  'applyFilter',
  'tableChange',
  'exportSelected',
  'clearSelection'
])

const tableColumns = computed(() => {
  const columnMap = {
    repository: { title: '仓库', dataIndex: 'repository', key: 'repository', width: 120 },
    shortHash: { title: '提交ID', dataIndex: 'shortHash', key: 'shortHash', width: 120 },
    author: { title: '作者', dataIndex: 'author', key: 'author', width: 150 },
    message: { title: '提交消息', dataIndex: 'message', key: 'message', ellipsis: true },
    filesChanged: { title: '文件', dataIndex: 'filesChanged', key: 'filesChanged', width: 80, align: 'center' },
    insertions: { title: '新增', dataIndex: 'insertions', key: 'insertions', width: 80, align: 'center' },
    deletions: { title: '删除', dataIndex: 'deletions', key: 'deletions', width: 80, align: 'center' },
    actions: { title: '操作', key: 'actions', width: 100, align: 'center', fixed: 'right' }
  }
  return Object.keys(props.columns)
    .filter(key => props.columns[key])
    .map(key => columnMap[key])
    .concat(columnMap['actions']);
});

const rowSelection = computed(() => {
  return {
    selectedRowKeys: props.selectedRows.map(row => row.commitId),
    onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
      emit('selectionChange', selectedRows)
    }
  }
})

const updateCurrentPage = (page: number) => {
  emit('update:currentPage', page)
}

const updatePageSize = (size: number) => {
  emit('update:pageSize', size)
}

const handleTableChange = (pagination, filters, sorter) => {
  emit('tableChange', pagination, filters, sorter)
}

const applyAuthorFilter = (author: string) => {
  emit('applyFilter', 'author', author)
}

const repoColors = ['blue', 'green', 'cyan', 'purple', 'orange', 'red'];
const repoColorMap = new Map();
let colorIndex = 0;

const getRepoColor = (repoName: string) => {
  if (!repoColorMap.has(repoName)) {
    repoColorMap.set(repoName, repoColors[colorIndex % repoColors.length]);
    colorIndex++;
  }
  return repoColorMap.get(repoName);
};

</script>

<style scoped>
.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: var(--border) !important;
  transition: box-shadow var(--transition-normal);
}

.table-card:hover {
  box-shadow: var(--shadow-md);
}

.table-card :deep(.ant-card-body) {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  height: 32px;
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background-color: var(--info-light);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  animation: fadeInDown 0.3s ease-out;
}

.selection-count {
  font-size: var(--font-size-sm);
  color: var(--info);
  font-weight: var(--font-weight-medium);
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md);
  background: white;
  border-top: var(--border);
}

.repo-cell .ant-tag {
  cursor: pointer;
  transition: all var(--transition-normal);
}

.repo-cell:hover .ant-tag {
  transform: scale(1.05);
}

.hash-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: 'Fira Code', monospace;
}

.hash-value {
  cursor: pointer;
  transition: color var(--transition-fast);
}

.hash-value:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.copy-icon {
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.copy-icon:hover {
  color: var(--primary-color);
  transform: scale(1.2);
}

.author-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 4px 0;
}

.author-cell:hover {
  color: var(--primary-color);
  transform: translateX(3px);
}

.author-avatar {
  background-color: var(--primary-light);
  color: var(--primary-color);
  transition: transform var(--transition-normal);
}

.author-cell:hover .ant-avatar {
  transform: scale(1.1);
}

.author-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.message-tag {
  font-size: 10px;
  height: 20px;
  line-height: 18px;
  transition: all var(--transition-fast);
}

.message-tag:hover {
  transform: scale(1.05);
}

.message-text {
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.insertion {
  color: var(--success);
  font-weight: var(--font-weight-semibold);
}

.deletion {
  color: var(--danger);
  font-weight: var(--font-weight-semibold);
}

.action-cell {
  display: flex;
  justify-content: center;
  gap: 8px;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>