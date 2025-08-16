<template>
  <el-card class="contributors-list-card">
    <template #header>
      <div class="card-header">
        <span>贡献者列表</span>
        <div class="header-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索贡献者"
            prefix-icon="Search"
            class="search-input"
          />
          <el-select
            v-model="sortBy"
            size="default"
            placeholder="排序方式"
            style="width: 140px"
          >
            <el-option label="提交数" value="commits" />
            <el-option label="增加行数" value="additions" />
            <el-option label="删除行数" value="deletions" />
            <el-option label="最近活跃" value="lastActive" />
          </el-select>
        </div>
      </div>
    </template>

    <el-table
      v-loading="loading"
      :data="filteredContributors"
      style="width: 100%"
      @row-click="$emit('select', $event)"
    >
      <el-table-column label="贡献者" min-width="200">
        <template #default="scope">
          <div class="contributor-info">
            <el-avatar :size="36" class="contributor-avatar">
              {{ getInitials(scope.row.name) }}
            </el-avatar>
            <div class="contributor-details">
              <div class="contributor-name">{{ scope.row.name }}</div>
              <div class="contributor-email text-secondary">{{ scope.row.email }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="commits" label="提交数" width="100" sortable />
      <el-table-column label="代码行数变更" width="160">
        <template #default="scope">
          <div class="line-changes">
            <span class="additions">+{{ formatNumber(scope.row.additions) }}</span>
            <span class="deletions">-{{ formatNumber(scope.row.deletions) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="提交占比" width="180">
        <template #default="scope">
          <el-progress
            :percentage="getCommitPercentage(scope.row.commits)"
            :color="getContributorColor(scope.row.id)"
          />
        </template>
      </el-table-column>
      <el-table-column label="最近活跃" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.lastActive) }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

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
