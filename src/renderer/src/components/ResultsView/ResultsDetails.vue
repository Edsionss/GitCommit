<template>
  <div class="details-container">
    <a-tabs type="card">
      <a-tab-pane key="author" tab="作者统计">
        <a-table :data-source="stats.authorStats" :columns="authorColumns" bordered :pagination="false" :scroll="{ x: 'max-content' }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'percentage'">
              {{ (record.percentage * 100).toFixed(2) }}%
            </template>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="repo" tab="仓库统计">
        <a-table :data-source="stats.repositoryStats" :columns="repoColumns" bordered :pagination="false" :scroll="{ x: 'max-content' }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'percentage'">
              {{ (record.percentage * 100).toFixed(2) }}%
            </template>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="date" tab="日期统计">
        <a-table :data-source="stats.dateStats" :columns="dateColumns" bordered :pagination="false" :scroll="{ x: 'max-content' }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'percentage'">
              {{ (record.percentage * 100).toFixed(2) }}%
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Tabs, TabPane, Table } from 'ant-design-vue';

const props = defineProps({
  stats: { type: Object, required: true }
});

const authorColumns = ref([
  { title: '作者', dataIndex: 'name', key: 'name', minWidth: 200, sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: '提交数', dataIndex: 'count', key: 'count', width: 100, sorter: (a, b) => a.count - b.count },
  { title: '占比', dataIndex: 'percentage', key: 'percentage', width: 100, sorter: (a, b) => a.percentage - b.percentage },
  { title: '文件变更', dataIndex: 'filesChanged', key: 'filesChanged', width: 100, sorter: (a, b) => a.filesChanged - b.filesChanged },
  { title: '新增行数', dataIndex: 'insertions', key: 'insertions', width: 100, sorter: (a, b) => a.insertions - b.insertions },
  { title: '删除行数', dataIndex: 'deletions', key: 'deletions', width: 100, sorter: (a, b) => a.deletions - b.deletions },
]);

const repoColumns = ref([
  { title: '仓库', dataIndex: 'name', key: 'name', minWidth: 200, sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: '提交数', dataIndex: 'count', key: 'count', width: 100, sorter: (a, b) => a.count - b.count },
  { title: '占比', dataIndex: 'percentage', key: 'percentage', width: 100, sorter: (a, b) => a.percentage - b.percentage },
  { title: '文件变更', dataIndex: 'filesChanged', key: 'filesChanged', width: 100, sorter: (a, b) => a.filesChanged - b.filesChanged },
  { title: '新增行数', dataIndex: 'insertions', key: 'insertions', width: 100, sorter: (a, b) => a.insertions - b.insertions },
  { title: '删除行数', dataIndex: 'deletions', key: 'deletions', width: 100, sorter: (a, b) => a.deletions - b.deletions },
]);

const dateColumns = ref([
  { title: '日期', dataIndex: 'name', key: 'name', minWidth: 200, sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: '提交数', dataIndex: 'count', key: 'count', width: 100, sorter: (a, b) => a.count - b.count },
  { title: '占比', dataIndex: 'percentage', key: 'percentage', width: 100, sorter: (a, b) => a.percentage - b.percentage },
  { title: '文件变更', dataIndex: 'filesChanged', key: 'filesChanged', width: 100, sorter: (a, b) => a.filesChanged - b.filesChanged },
  { title: '新增行数', dataIndex: 'insertions', key: 'insertions', width: 100, sorter: (a, b) => a.insertions - b.insertions },
  { title: '删除行数', dataIndex: 'deletions', key: 'deletions', width: 100, sorter: (a, b) => a.deletions - b.deletions },
]);
</script>

<style scoped>
.details-container {
  padding: var(--spacing-lg) 0;
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>