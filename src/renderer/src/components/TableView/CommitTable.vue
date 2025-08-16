<template>
  <a-card class="table-card">
    <template #title>
      <div class="card-header">
        <span>Git提交历史</span>
        <div v-if="selectedRows.length > 0" class="selection-actions">
          <span class="selection-count">已选择 {{ selectedRows.length }} 项</span>
          <a-button size="small" @click="$emit('exportSelected')" type="primary">导出选中项</a-button>
          <a-button size="small" @click="$emit('clearSelection')" type="text">取消选择</a-button>
        </div>
      </div>
    </template>

    <a-table
      :data-source="paginatedData"
      :columns="columns"
      :loading="loading"
      :pagination="false"
      :scroll="{ y: tableHeight, x: 'max-content' }"
      row-key="commitId"
      @change="(pagination, filters, sorter) => $emit('tableChange', pagination, filters, sorter)"
      @select="(record, selected, selectedRows, nativeEvent) => $emit('selectionChange', selectedRows)"
      @select-all="(selected, selectedRows, changeRows) => $emit('selectionChange', selectedRows)"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'repository'">
          <div class="repo-cell">
            <a-tag color="blue">{{ record.repository }}</a-tag>
          </div>
        </template>
        <template v-else-if="column.key === 'shortHash'">
          <div class="hash-cell">
            <span @click="$emit('copyToClipboard', record.commitId)" class="copy-icon">
              <CopyOutlined />
            </span>
            <a-tooltip :title="record.commitId" placement="top">
              <span class="hash-value">{{ record.shortHash }}</span>
            </a-tooltip>
          </div>
        </template>
        <template v-else-if="column.key === 'author'">
          <div
            class="author-cell"
            @click="$emit('applyFilter', 'author', record.author)"
            :title="`筛选作者: ${record.author}`"
          >
            <a-avatar :size="24">
              {{ record.author ? record.author.substring(0, 1).toUpperCase() : '?' }}
            </a-avatar>
            <span class="author-name">{{ record.author }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'date'">
          <div
            class="date-cell"
            @click="$emit('applyFilter', 'dateRange', [record.date, record.date])"
            :title="`筛选日期: ${formatDate(record.date)}`"
          >
            <CalendarOutlined />
            <span>{{ formatDate(record.date) }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'message'">
          <div class="message-cell">
            <span v-if="hasTags(record.message)" class="message-tags">
              <a-tag
                v-for="tag in extractTags(record.message)"
                :key="tag"
                size="small"
                class="message-tag"
              >
                {{ tag }}
              </a-tag>
            </span>
            <span class="message-text">{{ cleanMessage(record.message) }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'filesChanged'">
          {{ formatNumber(record.filesChanged) }}
        </template>
        <template v-else-if="column.key === 'insertions'">
          <span class="insertion">+{{ record.insertions }}</span>
        </template>
        <template v-else-if="column.key === 'deletions'">
          <span class="deletion">-{{ record.deletions }}</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <div class="action-cell">
            <a-tooltip title="查看详情" placement="top">
              <a-button type="text" shape="circle" size="small" @click="$emit('viewDetails', record)">
                <EyeOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="复制ID" placement="top">
              <a-button type="text" shape="circle" size="small" @click="$emit('copyToClipboard', record.commitId)">
                <CopyOutlined />
              </a-button>
            </a-tooltip>
          </div>
        </template>
      </template>
    </a-table>

    <!-- 分页控件 -->
    <div class="pagination-container">
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :page-size-options="['10', '20', '50', '100']"
        show-size-changer
        show-quick-jumper
        :total="filteredDataLength"
        show-total="total => `总数: ${total} 条`"
        @showSizeChange="(current, size) => $emit('update:pageSize', size)"
        @change="(page, pageSize) => $emit('update:currentPage', page)"
      />
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Card, Table, Tag, Button, Tooltip, Pagination, Avatar } from 'ant-design-vue';
import { FileTextOutlined, CopyOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  loading: { type: Boolean, default: false },
  paginatedData: { type: Array, required: true },
  tableHeight: { type: Number, required: true },
  columns: { type: Object, required: true }, // This will be the reactive 'columns' object from parent
  formatNumber: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  formatDateRange: { type: Function, required: true },
  hasTags: { type: Function, required: true },
  extractTags: { type: Function, required: true },
  cleanMessage: { type: Function, required: true },
  copyToClipboard: { type: Function, required: true },
  viewDetails: { type: Function, required: true },
  selectedRows: { type: Array, required: true },
  currentPage: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  filteredDataLength: { type: Number, required: true },
});

const emit = defineEmits([
  'update:currentPage',
  'update:pageSize',
  'exportSelected',
  'clearSelection',
  'viewDetails',
  'copyToClipboard',
  'applyFilter',
  'selectionChange',
  'tableChange'
]);

const columns = ref([
  {
    type: 'selection',
    width: 55,
    fixed: 'left',
  },
  {
    type: 'index',
    title: '#',
    width: 60,
    fixed: 'left',
  },
  {
    title: '仓库',
    dataIndex: 'repository',
    key: 'repository',
    minWidth: 150,
    sorter: (a, b) => a.repository.localeCompare(b.repository),
  },
  {
    title: '提交ID',
    dataIndex: 'shortHash',
    key: 'shortHash',
    minWidth: 100,
    sorter: (a, b) => a.shortHash.localeCompare(b.shortHash),
  },
  {
    title: '作者',
    dataIndex: 'author',
    key: 'author',
    minWidth: 120,
    sorter: (a, b) => a.author.localeCompare(b.author),
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    minWidth: 180,
    ellipsis: true,
  },
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
    minWidth: 180,
    sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  },
  {
    title: '提交消息',
    dataIndex: 'message',
    key: 'message',
    minWidth: 300,
    ellipsis: true,
  },
  {
    title: '文件变更',
    dataIndex: 'filesChanged',
    key: 'filesChanged',
    minWidth: 100,
    sorter: (a, b) => a.filesChanged - b.filesChanged,
  },
  {
    title: '新增',
    dataIndex: 'insertions',
    key: 'insertions',
    minWidth: 80,
    sorter: (a, b) => a.insertions - b.insertions,
  },
  {
    title: '删除',
    dataIndex: 'deletions',
    key: 'deletions',
    minWidth: 80,
    sorter: (a, b) => a.deletions - b.deletions,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
  },
]);
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

.pagination-container {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md);
  background: white;
  border-top: var(--border);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 表格单元格样式 */
.repo-cell {
  display: flex;
  align-items: center;
}

.repo-cell .ant-tag {
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

.date-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.date-cell:hover {
  color: var(--primary-color);
  transform: translateX(3px);
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
}

.insertion {
  color: var(--success);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
}

.deletion {
  color: var(--danger);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
}

tr:hover .insertion {
  text-shadow: 0 0 1px rgba(46, 204, 113, 0.5);
}

tr:hover .deletion {
  text-shadow: 0 0 1px rgba(231, 76, 60, 0.5);
}

.action-cell {
  display: flex;
  justify-content: center;
  gap: 8px;
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

.selection-count {
  font-size: var(--font-size-sm);
  color: var(--info);
  font-weight: var(--font-weight-medium);
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
</style>
