<!-- eslint-disable vue/no-mutating-props -->
<template>
  <!-- <a-card class="page-card"> -->
  <div class="commits-container">
    <CommitsToolbar
      v-model="filters"
      :repositories="repositories"
      :branches="branches"
      :authors="authors"
      @refresh="refreshCommits"
    />

    <a-spin :spinning="loading" class="main-content-spin">
      <a-card>
        <div class="main-content">
          <CommitsList
            :commits="filteredCommits"
            :selected-commit-index="selectedCommitIndex"
            :format-date="formatDate"
            :get-avatar-url="getAvatarUrl"
            @select-commit="selectCommit"
          />

          <CommitDetails
            v-if="selectedCommit"
            :commit="selectedCommit"
            :format-date="formatDate"
            @copy="copyToClipboard"
            @load-commit="loadCommit"
          />

          <div v-else-if="!loading && commits.length === 0" class="empty-state">
            <a-empty description="暂无提交记录">
              <a-button type="primary" @click="refreshCommits">刷新提交记录</a-button>
            </a-empty>
          </div>
        </div>
      </a-card>
    </a-spin>
  </div>
  <!-- </a-card> -->
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import {
  message,
  Empty as AEmpty,
  Button as AButton,
  Spin as ASpin,
  Card as ACard
} from 'ant-design-vue'
import CommitsToolbar from '@/components/CommitsView/CommitsToolbar.vue'
import CommitsList from '@/components/CommitsView/CommitsList.vue'
import CommitDetails from '@/components/CommitsView/CommitDetails.vue'
import { useFormatters } from '@/composables/useFormatters'

import repositoriesData from '@/mock/repositoriesData.json'
import branchesData from '@/mock/repositoryAvailableTags.json'
import authorsData from '@/mock/reportsTopContributors.json'
import commitsData from '@/mock/tableViewCommits.json'

// Composables
const { formatDate } = useFormatters()

// Loading State
const loading = ref(false)

// Static Mock Data
const repositories = ref(repositoriesData)
const branches = ref(branchesData)
const authors = ref(authorsData.map((c) => c.name))

// Filters
const filters = ref({
  repo: 1,
  dateRange: [] as [string, string] | [],
  branch: 'main',
  author: [] as string[],
  keyword: ''
})

// Commits Data
const commits = ref<any[]>([])

// Selection State
const selectedCommitIndex = ref(-1)
const selectedCommit = computed(() => {
  return selectedCommitIndex.value > -1 ? filteredCommits.value[selectedCommitIndex.value] : null
})

// Computed property for filtered commits
const filteredCommits = computed(() => {
  let result = commits.value

  if (filters.value.author && filters.value.author.length > 0) {
    result = result.filter((commit) => filters.value.author.includes(commit.author))
  }

  if (filters.value.dateRange && filters.value.dateRange.length === 2) {
    const [startDate, endDate] = filters.value.dateRange.map((d) => dayjs(d))
    result = result.filter((commit) => {
      const commitDate = dayjs(commit.date)
      return (
        commitDate.isAfter(startDate.startOf('day')) && commitDate.isBefore(endDate.endOf('day'))
      )
    })
  }

  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    result = result.filter(
      (commit) =>
        commit.title.toLowerCase().includes(keyword) ||
        commit.fullMessage.toLowerCase().includes(keyword)
    )
  }

  return result
})

// Methods
const getAvatarUrl = (author: string): string => {
  if (!author) return '' // Prevent requests with undefined seed
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author)}`
}

const selectCommit = (index: number) => {
  selectedCommitIndex.value = index
}

const normalizeCommit = (commit: any) => ({
  title: commit.title || 'No Title',
  hash: commit.hash || `nohash_${Math.random().toString(36).substring(2, 9)}`,
  author: commit.author || 'Unknown Author',
  authorEmail: commit.authorEmail || 'unknown@example.com',
  date: commit.date || new Date().toISOString(),
  message: commit.message || '',
  fullMessage: commit.fullMessage || commit.message || '',
  files: commit.files || [],
  additions: commit.additions || 0,
  deletions: commit.deletions || 0,
  parents: commit.parents || [],
  branches: commit.branches || []
})

const refreshCommits = () => {
  loading.value = true
  setTimeout(() => {
    commits.value = commitsData.map(normalizeCommit)
    if (commits.value.length > 0) {
      selectCommit(0)
    } else {
      selectCommit(-1)
    }
    loading.value = false
    message.success('提交记录已刷新')
  }, 500)
}

const loadCommit = (hash: string) => {
  const index = commits.value.findIndex((c) => c.hash === hash)
  if (index > -1) {
    selectCommit(index)
    message.info(`已加载提交: ${hash.substring(0, 7)}`)
  } else {
    message.error('找不到指定的提交')
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success('已复制到剪贴板')
  } catch (err) {
    message.error('复制失败')
  }
}

// Watchers
watch(
  () => filters.value.repo,
  () => refreshCommits(),
  { deep: true }
)

watch(
  () => filters.value.branch,
  () => refreshCommits(),
  { deep: true }
)

// Lifecycle Hooks
onMounted(() => {
  refreshCommits()
})
</script>

<style scoped>
.page-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-card :deep(.ant-card-body) {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.commits-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.main-content-spin {
  flex: 1;
  overflow: auto;
}

.main-content-spin :deep(.ant-spin-container) {
  height: 100%;
}

.main-content {
  height: 100%;
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
