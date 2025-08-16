<template>
  <div class="contributors-container">
    <div class="contributors-header">
      <h2 class="page-title">贡献者分析</h2>
      <div class="contributors-actions">
        <el-select v-model="selectedRepo" placeholder="选择仓库" class="filter-item">
          <el-option
            v-for="repo in repositories"
            :key="repo.id"
            :label="repo.name"
            :value="repo.id"
          />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="filter-item"
        />
        <el-button type="primary" @click="analyzeContributors">
          <el-icon class="mr-5"><DataAnalysis /></el-icon>
          分析
        </el-button>
      </div>
    </div>

    <ContributorsStats :stats="contributorStats" :format-number="formatNumber" />

    <el-row :gutter="20" class="content-row">
      <el-col :span="16">
        <ContributorsList 
          :contributors="contributors"
          :loading="loading"
          :total-commits="contributorStats.totalCommits"
          :format-date="formatDate"
          :format-number="formatNumber"
          :get-initials="getInitials"
          :get-contributor-color="getContributorColor"
          @select="selectContributor"
        />
      </el-col>

      <el-col :span="8">
        <ContributorDetails 
          :contributor="selectedContributor"
          :all-contributors="contributors"
          :get-initials="getInitials"
          :format-number="formatNumber"
          :get-contributor-color="getContributorColor"
          @clear="clearSelectedContributor"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import ContributorsStats from '@/components/ContributorsView/ContributorsStats.vue'
import ContributorsList from '@/components/ContributorsView/ContributorsList.vue'
import ContributorDetails from '@/components/ContributorsView/ContributorDetails.vue'

import repositoriesData from '@/mock/repositories.json'
import contributorsData from '@/mock/contributors.json'

// 数据
const repositories = ref(repositoriesData)
const contributors = ref(contributorsData.map(c => ({ ...c, lastActive: new Date(c.lastActive) })))

// 筛选器
const selectedRepo = ref(1)
const dateRange = ref(null)
const loading = ref(false);

// 汇总统计
const contributorStats = reactive({
  totalContributors: contributors.value.length,
  totalCommits: contributors.value.reduce((sum, contributor) => sum + contributor.commits, 0),
  totalAdditions: contributors.value.reduce((sum, contributor) => sum + contributor.additions, 0),
  totalDeletions: contributors.value.reduce((sum, contributor) => sum + contributor.deletions, 0)
});

// 选中的贡献者
const selectedContributor = ref(null);

// 获取名字首字母作为头像
const getInitials = (name) => {
  return name.charAt(0).toUpperCase();
};

// 格式化数字
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 格式化日期
const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 获取贡献者标识颜色
const getContributorColor = (id) => {
  const colors = ['#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', '#7209b7'];
  return colors[(id - 1) % colors.length];
};

// 选择贡献者
const selectContributor = (row) => {
  selectedContributor.value = row;
};

// 清除选中贡献者
const clearSelectedContributor = () => {
  selectedContributor.value = null;
};

// 分析贡献者
const analyzeContributors = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('贡献者分析已完成');
  }, 800);
};
</script>

<style scoped>
.contributors-container {
  width: 100%;
}

.contributors-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.contributors-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 180px;
}

.stats-row {
  margin-bottom: 20px;
}

.content-row {
  margin-bottom: 20px;
}

.stats-card {
  margin-bottom: 0;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  font-size: 24px;
}

.stat-icon.contributors-icon {
  background-color: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}

.stat-icon.commits-icon {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.stat-icon.additions-icon {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.stat-icon.deletions-icon {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.contributors-list-card,
.charts-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 200px;
}

.contributor-info {
  display: flex;
  align-items: center;
}

.contributor-avatar {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
  margin-right: 12px;
}

.contributor-details {
  display: flex;
  flex-direction: column;
}

.contributor-name {
  font-weight: var(--font-weight-medium);
}

.contributor-email {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.line-changes {
  display: flex;
  gap: 8px;
}

.additions {
  color: #2ecc71;
}

.deletions {
  color: #e74c3c;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.chart {
  width: 100%;
  height: 100%;
}

.contributor-detail-card {
  margin-bottom: 20px;
}

.contributor-profile {
  padding: 10px 0;
}

.contributor-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.large-avatar {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
  margin-right: 15px;
}

.contributor-meta {
  flex: 1;
}

.contributor-stats {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-box {
  flex: 1;
  background-color: var(--bg-color);
  padding: 15px;
  border-radius: var(--radius-md);
  text-align: center;
}

.activity-chart {
  height: 200px;
  margin-bottom: 20px;
}

.contributor-detail-section {
  margin-top: 20px;
}

.contributor-detail-section h4 {
  margin-bottom: 10px;
  color: var(--text-primary);
}

.mr-5 {
  margin-right: 5px;
}

.text-secondary {
  color: var(--text-secondary);
}

/* 暗色主题适配 */
[data-theme='dark'] .stat-icon.contributors-icon {
  background-color: rgba(76, 201, 240, 0.15);
  color: #4cc9f0;
}

[data-theme='dark'] .stat-icon.commits-icon {
  background-color: rgba(52, 152, 219, 0.15);
  color: #3498db;
}

[data-theme='dark'] .stat-icon.additions-icon {
  background-color: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
}

[data-theme='dark'] .stat-icon.deletions-icon {
  background-color: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}
</style>
