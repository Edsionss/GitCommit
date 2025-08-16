<template>
  <div class="repo-overview">
    <el-card>
      <template #header>
        <div class="overview-header">
          <span>项目概览</span>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <h3 class="section-title">主要贡献者</h3>
          <div class="contributors-list">
            <div
              v-for="contributor in topContributors"
              :key="contributor.email"
              class="contributor-item"
            >
              <el-avatar :size="32" :src="getAvatarUrl(contributor.email)"></el-avatar>
              <div class="contributor-info">
                <div class="contributor-name">{{ contributor.name }}</div>
                <div class="contribution-stats">
                  <span>{{ contributor.commits }} 提交</span>
                  <span class="additions">+{{ contributor.additions }}</span>
                  <span class="deletions">-{{ contributor.deletions }}</span>
                </div>
              </div>
              <div class="contributor-percentage">
                <el-progress
                  :percentage="contributor.percentage"
                  :color="contributor.color"
                  :stroke-width="8"
                  :show-text="false"
                />
                <span>{{ contributor.percentage }}%</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :md="12">
          <h3 class="section-title">活跃分支</h3>
          <div class="branches-list">
            <div v-for="branch in activeBranches" :key="branch.name" class="branch-item">
              <div class="branch-icon">
                <el-icon><Share /></el-icon>
              </div>
              <div class="branch-info">
                <div class="branch-name">{{ branch.name }}</div>
                <div class="branch-stats">最近提交: {{ formatDate(branch.lastCommitDate) }}</div>
              </div>
              <div class="branch-commit-count">{{ branch.commitCount }} 提交</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Share } from '@element-plus/icons-vue';

defineProps({
  topContributors: {
    type: Array,
    required: true
  },
  activeBranches: {
    type: Array,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  getAvatarUrl: {
    type: Function,
    required: true
  }
});
</script>

<style scoped>
.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 16px;
  font-weight: 600;
}

.contributors-list,
.branches-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contributor-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contributor-info {
  flex: 1;
}

.contributor-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.contribution-stats {
  font-size: 12px;
  color: var(--color-text-light);
  display: flex;
  gap: 8px;
}

.contributor-percentage {
  width: 120px;
  text-align: right;
}

.branch-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.branch-icon {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.branch-info {
  flex: 1;
}

.branch-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.branch-stats {
  font-size: 12px;
  color: var(--color-text-light);
}

.branch-commit-count {
  font-weight: 500;
}

.additions {
  color: var(--color-success);
}

.deletions {
  color: var(--color-danger);
}
</style>
