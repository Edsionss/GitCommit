<template>
  <div class="commits-container">
    <CommitsToolbar 
      :repositories="repositories"
      :branches="branches"
      :authors="authors"
      v-model="filters"
      @refresh="refreshCommits"
    />

    <div class="main-content" v-loading="loading">
      <CommitsList 
        :commits="filteredCommits"
        :selected-commit-index="selectedCommitIndex"
        :format-date="formatDate"
        :get-avatar-url="getAvatarUrl"
        @select-commit="selectCommit"
        @refresh="refreshCommits"
      />

      <CommitDetails 
        :commit="selectedCommit"
        :format-date="formatDate"
        @copy="copyToClipboard"
        @load-commit="loadCommit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import CommitsToolbar from '@/components/CommitsView/CommitsToolbar.vue'
import CommitsList from '@/components/CommitsView/CommitsList.vue'
import CommitDetails from '@/components/CommitsView/CommitDetails.vue'

import repositoriesData from '@/mock/repositories.json'
import branchesData from '@/mock/branches.json'
import authorsData from '@/mock/authors.json'
import commitsData from '@/mock/commits.json'

// 加载状态
const loading = ref(false)

// 数据
const repositories = ref(repositoriesData)
const branches = ref(branchesData)
const authors = ref(authorsData)
const commits = ref(commitsData)

// 筛选器状态
const filters = reactive({
  repo: 1,
  branch: 'main',
  author: '',
  dateRange: [
    dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD')
  ],
  keyword: ''
});

// 选中的提交
const selectedCommitIndex = ref(0);
const selectedCommit = computed(() => {
  return selectedCommitIndex.value >= 0 && selectedCommitIndex.value < filteredCommits.value.length
    ? filteredCommits.value[selectedCommitIndex.value]
    : null;
});

// 提交过滤
const filteredCommits = computed(() => {
  let result = commits.value;

  if (filters.author) {
    result = result.filter((commit) => commit.author === filters.author);
  }

  if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
    const startDate = dayjs(filters.dateRange[0]);
    const endDate = dayjs(filters.dateRange[1]).endOf('day');

    result = result.filter((commit) => {
      const commitDate = dayjs(commit.date);
      return commitDate.isAfter(startDate) && commitDate.isBefore(endDate);
    });
  }

  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    result = result.filter(
      (commit) =>
        commit.title.toLowerCase().includes(keyword) ||
        (commit.fullMessage && commit.fullMessage.toLowerCase().includes(keyword))
    );
  }

  return result;
});

// 方法
const selectCommit = (index: number) => {
  selectedCommitIndex.value = index;
};

const refreshCommits = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('提交记录已刷新');
  }, 1000);
};

const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElMessage.success('已复制到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败');
    });
};

const formatDate = (dateString: string, format = 'YYYY-MM-DD HH:mm') => {
  return dayjs(dateString).format(format);
};

const getAvatarUrl = (email: string) => {
  const hash = btoa(email).substring(0, 12);
  return `https://i.pravatar.cc/150?u=${hash}`;
};

const loadCommit = (hash: string) => {
  ElMessage.info(`加载提交: ${hash}`);
};

// 监听筛选器变化
watch(filters, () => {
  refreshCommits();
}, { deep: true });

// 挂载时获取数据
onMounted(() => {
  refreshCommits();
});
</script>

<style scoped>
.commits-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.additions {
  color: var(--color-success);
}

.deletions {
  color: var(--color-danger);
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .commits-list {
    width: 100%;
    max-height: 300px;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
}
</style>