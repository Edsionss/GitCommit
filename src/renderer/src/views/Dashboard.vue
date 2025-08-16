<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2 class="page-title">数据概览</h2>
    </div>

    <StatsCards :stats="stats" :format-number="formatNumber" />

    <div class="chart-section">
      <a-row :gutter="16">
        <a-col :xs="24" :lg="12">
          <CommitTrendChart />
        </a-col>
        <a-col :xs="24" :lg="12">
          <LanguageDistChart />
        </a-col>
      </a-row>
    </div>

    <div class="recent-activity">
      <RecentActivity :recent-commits="recentCommits" :get-avatar-url="getAvatarUrl" />
    </div>

    <div class="repo-overview">
      <RepoOverview
        :top-contributors="topContributors"
        :active-branches="activeBranches"
        :get-avatar-url="getAvatarUrl"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import StatsCards from '@/components/Dashboard/StatsCards.vue'
import CommitTrendChart from '@/components/Dashboard/CommitTrendChart.vue'
import LanguageDistChart from '@/components/Dashboard/LanguageDistChart.vue'
import RecentActivity from '@/components/Dashboard/RecentActivity.vue'
import RepoOverview from '@/components/Dashboard/RepoOverview.vue'
import { Row as ARow, Col as ACol } from 'ant-design-vue'
import dayjs from 'dayjs'

const router = useRouter()

// 统计数据
const stats = reactive({
  totalCommits: 1285,
  totalFiles: 358,
  totalContributors: 15,
  totalLines: 125678
})

// 模拟数据
const recentCommits = ref([
  {
    title: '修复登录页面的UI显示错误',
    hash: 'a1b2c3d4e5f6',
    author: '张三',
    authorEmail: 'zhangsan@example.com',
    date: '2023-10-27T10:00:00Z'
  },
  {
    title: '新增用户个人信息编辑功能',
    hash: 'f6e5d4c3b2a1',
    author: '李四',
    authorEmail: 'lisi@example.com',
    date: '2023-10-27T09:30:00Z'
  }
])

const topContributors = ref([
  {
    name: '王五',
    email: 'wangwu@example.com',
    commits: 150,
    additions: 5000,
    deletions: 2000,
    percentage: 45,
    color: '#6366f1'
  },
  {
    name: '赵六',
    email: 'zhaoliu@example.com',
    commits: 120,
    additions: 3500,
    deletions: 1500,
    percentage: 30,
    color: '#8b5cf6'
  }
])

const activeBranches = ref([
  { name: 'main', lastCommitDate: '2023-10-26T18:00:00Z', commitCount: 500 },
  { name: 'dev', lastCommitDate: '2023-10-27T10:00:00Z', commitCount: 450 }
])

// 格式化数字（添加千位分隔符）
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取头像URL
const getAvatarUrl = (email: string): string => {
  // 使用简单的哈希或者其他方式为不同邮箱生成不同头像
  return `https://i.pravatar.cc/150?u=${email}`
}
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  padding-bottom: 20px;
  /* padding-top: 15px; */
}

.dashboard-header {
  margin-bottom: 20px;
  /* margin-top: 10px; */
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--color-text);
  font-weight: 600;
  line-height: 1.5;
}

.chart-section {
  margin-bottom: 20px;
}

.recent-activity {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .stats-card {
    margin-bottom: 16px;
  }
}
</style>
