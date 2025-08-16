<template>
  <a-card class="contributors-list-card">
    <template #title>
      <div class="card-header">
        <span>贡献者列表</span>
        <div class="header-actions">
          <a-input
            v-model:value="searchQuery"
            placeholder="搜索贡献者"
            class="search-input"
            allow-clear
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <a-select
            v-model:value="sortBy"
            size="default"
            placeholder="排序方式"
            style="width: 140px"
          >
            <a-select-option value="commits">提交数</a-select-option>
            <a-select-option value="additions">增加行数</a-select-option>
            <a-select-option value="deletions">删除行数</a-select-option>
            <a-select-option value="lastActive">最近活跃</a-select-option>
          </a-select>
        </div>
      </div>
    </template>

    <a-table
      :loading="loading"
      :data-source="filteredContributors"
      :columns="columns"
      :pagination="false"
      @customRow="(record) => ({ onClick: () => $emit('select', record) })"
      :scroll="{ x: 'max-content' }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'contributor'">
          <div class="contributor-info">
            <a-avatar :size="36" class="contributor-avatar">
              {{ getInitials(record.name) }}
            </a-avatar>
            <div class="contributor-details">
              <div class="contributor-name">{{ record.name }}</div>
              <div class="contributor-email text-secondary">{{ record.email }}</div>
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'lineChanges'">
          <div class="line-changes">
            <span class="additions">+{{ formatNumber(record.additions) }}</span>
            <span class="deletions">-{{ formatNumber(record.deletions) }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'commitPercentage'">
          <a-progress
            :percent="getCommitPercentage(record.commits)"
            :stroke-color="getContributorColor(record.id)"
            :stroke-width="8"
            :show-info="false"
          />
        </template>
        <template v-else-if="column.key === 'lastActive'">
          {{ formatDate(record.lastActive) }}
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Card, Input, Select, Table, Avatar, Progress } from 'ant-design-vue';
import { SearchOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  contributors: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  totalCommits: { type: Number, required: true },
  formatDate: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  getInitials: { type: Function, required: true },
  getContributorColor: { type: Function, required: true }
});

defineEmits(['select']);

const searchQuery = ref('');
const sortBy = ref('commits');

const getCommitPercentage = (commits) => {
  if (props.totalCommits === 0) return 0;
  return Math.round((commits / props.totalCommits) * 100);
};

const filteredContributors = computed(() => {
  let result = [...props.contributors];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (c) => c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query)
    );
  }

  return result.sort((a, b) => {
    switch (sortBy.value) {
      case 'commits': return b.commits - a.commits;
      case 'additions': return b.additions - a.additions;
      case 'deletions': return b.deletions - a.deletions;
      case 'lastActive': return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      default: return b.commits - a.commits;
    }
  });
});

const columns = ref([
  {
    title: '贡献者',
    key: 'contributor',
    minWidth: 200,
  },
  {
    title: '提交数',
    dataIndex: 'commits',
    key: 'commits',
    width: 100,
    sorter: (a, b) => a.commits - b.commits,
  },
  {
    title: '代码行数变更',
    key: 'lineChanges',
    width: 160,
  },
  {
    title: '提交占比',
    key: 'commitPercentage',
    width: 180,
  },
  {
    title: '最近活跃',
    key: 'lastActive',
    width: 180,
  },
]);
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.header-actions { display: flex; gap: 10px; align-items: center; }
.search-input { width: 200px; }
.contributor-info { display: flex; align-items: center; }
.contributor-avatar { background-color: var(--primary-color); color: white; font-weight: bold; margin-right: 12px; }
.contributor-details { display: flex; flex-direction: column; }
.contributor-name { font-weight: 500; }
.contributor-email { font-size: 12px; color: var(--text-secondary); }
.line-changes { display: flex; gap: 8px; }
.additions { color: #2ecc71; }
.deletions { color: #e74c3c; }
.text-secondary { color: var(--text-secondary); }
</style>