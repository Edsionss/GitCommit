<template>
  <el-row :gutter="20" class="stats-row">
    <el-col :span="6">
      <el-card class="stats-card">
        <div class="stat-item">
          <div class="stat-icon contributors-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalContributors }}</div>
            <div class="stat-label">贡献者总数</div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card class="stats-card">
        <div class="stat-item">
          <div class="stat-icon commits-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalCommits }}</div>
            <div class="stat-label">提交总数</div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card class="stats-card">
        <div class="stat-item">
          <div class="stat-icon additions-icon">
            <el-icon><Plus /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(stats.totalAdditions) }}</div>
            <div class="stat-label">增加行数</div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card class="stats-card">
        <div class="stat-item">
          <div class="stat-icon deletions-icon">
            <el-icon><Minus /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(stats.totalDeletions) }}</div>
            <div class="stat-label">删除行数</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { User, Calendar, Plus, Minus } from '@element-plus/icons-vue';

defineProps({
  stats: { type: Object, required: true },
  formatNumber: { type: Function, required: true }
});
</script>

<style scoped>
.stats-row { margin-bottom: 20px; }
.stats-card { margin-bottom: 0; }
.stat-item { display: flex; align-items: center; }
.stat-icon { width: 50px; height: 50px; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-right: 15px; font-size: 24px; }
.stat-icon.contributors-icon { background-color: rgba(67, 97, 238, 0.1); color: #4361ee; }
.stat-icon.commits-icon { background-color: rgba(52, 152, 219, 0.1); color: #3498db; }
.stat-icon.additions-icon { background-color: rgba(46, 204, 113, 0.1); color: #2ecc71; }
.stat-icon.deletions-icon { background-color: rgba(231, 76, 60, 0.1); color: #e74c3c; }
.stat-info { flex: 1; }
.stat-value { font-size: 24px; font-weight: bold; line-height: 1.2; }
.stat-label { font-size: 14px; color: var(--color-text-light); }
</style>
