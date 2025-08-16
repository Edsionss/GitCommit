<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2 class="page-title">数据概览</h2>
    </div>

    <StatsCards :stats="stats" :format-number="formatNumber" />

    <div class="chart-section">
      <el-row :gutter="16">
        <el-col :xs="24" :lg="12">
          <CommitTrendChart />
        </el-col>
        <el-col :xs="24" :lg="12">
          <LanguageDistChart />
        </el-col>
      </el-row>
    </div>

    <RecentActivity 
      :recent-commits="recentCommits" 
      :format-date="formatDate" 
      :get-avatar-url="getAvatarUrl"
      @view-all-commits="viewAllCommits"
      @view-commit-detail="viewCommitDetail"
    />

    <RepoOverview 
      :top-contributors="topContributors"
      :active-branches="activeBranches"
      :format-date="formatDate"
      :get-avatar-url="getAvatarUrl"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import CommitTrendChart from '@/components/Dashboard/CommitTrendChart.vue'
import LanguageDistChart from '@/components/Dashboard/LanguageDistChart.vue'
import RepoOverview from '@/components/Dashboard/RepoOverview.vue'
import RecentActivity from '@/components/Dashboard/RecentActivity.vue'
import StatsCards from '@/components/Dashboard/StatsCards.vue'

import statsData from '@/mock/dashboardStats.json'
import recentCommitsData from '@/mock/recentCommits.json'
import topContributorsData from '@/mock/topContributors.json'
import activeBranchesData from '@/mock/activeBranches.json'

const router = useRouter()

// 统计数据
const stats = reactive(statsData)

// 最近提交数据
const recentCommits = ref(recentCommitsData)

// 主要贡献者
const topContributors = ref(topContributorsData)

// 活跃分支
const activeBranches = ref(activeBranchesData)

// 格式化数字（添加千位分隔符）
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 格式化日期
const formatDate = (dateString: string): string => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

// 获取头像URL
const getAvatarUrl = (email: string): string => {
  const hash = btoa(email).substring(0, 12)
  return `https://i.pravatar.cc/150?u=${hash}`
}

// 查看所有提交
const viewAllCommits = () => {
  router.push('/commits')
}

// 查看提交详情
const viewCommitDetail = (commit: any) => {
  router.push(`/commits?hash=${commit.hash}`)
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









@media (max-width: 768px) {
  .stats-card {
    margin-bottom: 16px;
  }
}
</style>
