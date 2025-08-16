<template>
  <div class="commits-container">
    <CommitsToolbar
      :repositories="repositories"
      :branches="branches"
      :authors="authors"
      :date-range="dateRange"
      :search-keyword="searchKeyword"
      @update:selectedRepo="selectedRepo = $event"
      @update:dateRange="dateRange = $event"
      @update:selectedBranch="selectedBranch = $event"
      @update:selectedAuthor="selectedAuthor = $event"
      @update:searchKeyword="searchKeyword = $event"
      @refresh="refreshCommits"
    />

    <div class="main-content" v-loading="loading">
      <CommitsList
        :commits="filteredCommits"
        :selected-commit-index="selectedCommitIndex"
        @select-commit="selectCommit"
      />

      <CommitDetails
        v-if="selectedCommit"
        :commit="selectedCommit"
        :file-filter="fileFilter"
        @update:fileFilter="fileFilter = $event"
        @select-file="selectFile"
        @load-commit="loadCommit"
      />

      <div class="empty-state" v-else-if="!loading && commits.length === 0">
        <a-empty description="暂无提交记录">
          <a-button type="primary" @click="refreshCommits">刷新提交记录</a-button>
        </a-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import { message, Empty as AEmpty, Button as AButton } from 'ant-design-vue'
import CommitsToolbar from '@/components/CommitsView/CommitsToolbar.vue'
import CommitsList from '@/components/CommitsView/CommitsList.vue'
import CommitDetails from '@/components/CommitsView/CommitDetails.vue'

import repositoriesData from '@/mock/repositoriesData.json'
import branchesData from '@/mock/repositoryAvailableTags.json'
import authorsData from '@/mock/reportsTopContributors.json'
import commitsData from '@/mock/tableViewCommits.json'

// 加载状态
const loading = ref(false)

// 仓库数据
const repositories = ref(repositoriesData)
const selectedRepo = ref(1)

// 分支数据
const branches = ref(branchesData)
const selectedBranch = ref('main')

// 作者数据
const authors = ref(authorsData.map(c => c.name))
const selectedAuthor = ref('')

// 日期范围
const dateRange = ref([
  dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD')
])

// 搜索关键词
const searchKeyword = ref('')

// 提交数据
const commits = ref(commitsData)

// 选中的提交
const selectedCommitIndex = ref(0)
const selectedCommit = computed(() => {
  return selectedCommitIndex.value >= 0 && selectedCommitIndex.value < filteredCommits.value.length
    ? filteredCommits.value[selectedCommitIndex.value]
    : null
})

// 选中的文件
const selectedFileIndex = ref(0)
const selectedFile = computed(() => {
  if (!selectedCommit.value) return null

  // This is a placeholder, as the file structure in the mock is different
  const files = (selectedCommit.value as any).files || [];
  return selectedFileIndex.value >= 0 && selectedFileIndex.value < files.length
    ? files[selectedFileIndex.value]
    : null
})

// 文件过滤
const fileFilter = ref('')
const filteredFiles = computed(() => {
    if (!selectedCommit.value) return [];
    const files = (selectedCommit.value as any).files || [];
    if (!fileFilter.value) return files;
    return files.filter((file: any) =>
        file.path.toLowerCase().includes(fileFilter.value.toLowerCase())
    );
});


// 提交过滤
const filteredCommits = computed(() => {
  let result = commits.value

  // 按作者过滤
  if (selectedAuthor.value) {
    result = result.filter((commit) => commit.author === selectedAuthor.value)
  }

  // 按日期范围过滤
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const startDate = dayjs(dateRange.value[0])
    const endDate = dayjs(dateRange.value[1]).endOf('day')

    result = result.filter((commit) => {
      const commitDate = dayjs(commit.date)
      return commitDate.isAfter(startDate) && commitDate.isBefore(endDate)
    })
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (commit) =>
        commit.message.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 方法
const selectCommit = (index: number) => {
  selectedCommitIndex.value = index
  selectedFileIndex.value = 0
}

const selectFile = (index: number) => {
  selectedFileIndex.value = index
}

const refreshCommits = () => {
  loading.value = true

  // 模拟API请求
  setTimeout(() => {
    loading.value = false;
    message.success('提交记录已刷新');
  }, 1000);
};

const loadCommit = (hash: string) => {
  message.info(`加载提交: ${hash}`);
};

// 监听仓库变化
watch(selectedRepo, () => {
  refreshCommits()
})

// 监听分支变化
watch(selectedBranch, () => {
  refreshCommits()
})

// 挂载时获取数据
onMounted(() => {
  refreshCommits()
})
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

.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
}
</style>
