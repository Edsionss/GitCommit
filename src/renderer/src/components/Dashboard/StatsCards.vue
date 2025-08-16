<template>
  <div class="stats-cards">
    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-container">
            <div class="stats-icon commits-icon">
              <el-icon><List /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ stats.totalCommits }}</div>
              <div class="stats-label">总提交数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-container">
            <div class="stats-icon files-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ stats.totalFiles }}</div>
              <div class="stats-label">文件总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-container">
            <div class="stats-icon contributors-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ stats.totalContributors }}</div>
              <div class="stats-label">贡献者数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-container">
            <div class="stats-icon lines-icon">
              <el-icon><Histogram /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ formatNumber(stats.totalLines) }}</div>
              <div class="stats-label">代码行数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Document, User, List, Histogram } from '@element-plus/icons-vue'

defineProps({
  stats: {
    type: Object,
    required: true
  },
  formatNumber: {
    type: Function,
    required: true
  }
});
</script>

<style scoped>
.stats-cards {
  margin-bottom: 20px;
}

.stats-card {
  height: 100px;
  display: flex;
  align-items: center;
  padding: 16px;
}
.stats-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  font-size: 24px;
}

.commits-icon {
  background-color: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.files-icon {
  background-color: rgba(14, 165, 233, 0.1);
  color: #0ea5e9;
}

.contributors-icon {
  background-color: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.lines-icon {
  background-color: rgba(234, 88, 12, 0.1);
  color: #ea580c;
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1.2;
}

.stats-label {
  font-size: 14px;
  color: var(--color-text-light);
}

@media (max-width: 768px) {
  .stats-card {
    margin-bottom: 16px;
  }
}
</style>
