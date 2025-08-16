<template>
  <div class="repository-list">
    <el-row :gutter="20">
      <el-col v-for="repo in repositories" :key="repo.id" :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="repo-card">
          <div class="repo-header">
            <el-avatar :size="40" class="repo-avatar">
              {{ repo.name.charAt(0).toUpperCase() }}
            </el-avatar>
            <div class="repo-info">
              <h3 class="repo-name">{{ repo.name }}</h3>
              <p class="repo-path text-secondary">{{ repo.path }}</p>
            </div>
            <el-dropdown trigger="click">
              <el-button type="info" text circle>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$emit('openRepo', repo)">
                    <el-icon><View /></el-icon>
                    查看仓库
                  </el-dropdown-item>
                  <el-dropdown-item @click="$emit('analyzeRepo', repo)">
                    <el-icon><DataAnalysis /></el-icon>
                    分析仓库
                  </el-dropdown-item>
                  <el-dropdown-item @click="$emit('exportRepoData', repo)">
                    <el-icon><Download /></el-icon>
                    导出数据
                  </el-dropdown-item>
                  <el-dropdown-item @click="$emit('openSettingsDialog', repo)" divided>
                    <el-icon><Setting /></el-icon>
                    仓库设置
                  </el-dropdown-item>
                  <el-dropdown-item @click="$emit('confirmRemoveRepo', repo)" divided type="danger">
                    <el-icon><Delete /></el-icon>
                    删除仓库
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="repo-body">
            <div class="repo-stats">
              <div class="stat-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ repo.commits }} 提交</span>
              </div>
              <div class="stat-item">
                <el-icon><User /></el-icon>
                <span>{{ repo.contributors }} 贡献者</span>
              </div>
              <div class="stat-item">
                <el-icon><Document /></el-icon>
                <span>{{ repo.files }} 文件</span>
              </div>
            </div>
            <div class="repo-tags">
              <el-tag v-for="tag in repo.tags" :key="tag" size="small" class="mr-5">
                {{ tag }}
              </el-tag>
            </div>
            <div class="repo-updated">最后更新: {{ formatDate(repo.lastUpdated) }}</div>
          </div>
          <div class="repo-footer">
            <el-button type="primary" @click="$emit('analyzeRepo', repo)">分析仓库</el-button>
            <el-button @click="$emit('openRepo', repo)">查看详情</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {
  Calendar,
  User,
  Document,
  MoreFilled,
  View,
  DataAnalysis,
  Download,
  Setting,
  Delete
} from '@element-plus/icons-vue'

defineProps({
  repositories: { type: Array, required: true },
  formatDate: { type: Function, required: true }
})

defineEmits([
  'openRepo',
  'analyzeRepo',
  'exportRepoData',
  'openSettingsDialog',
  'confirmRemoveRepo'
])
</script>

<style scoped>
.repository-list {
  margin-top: 20px;
}

.repo-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.repo-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg) !important;
}

.repo-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.repo-avatar {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
}

.repo-info {
  margin-left: 12px;
  flex: 1;
}

.repo-name {
  margin: 0 0 5px 0;
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.repo-path {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  word-break: break-all;
}

.repo-body {
  flex: 1;
  margin-bottom: 15px;
}

.repo-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stat-item .el-icon {
  margin-right: 5px;
}

.repo-tags {
  margin-bottom: 10px;
}

.repo-updated {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.repo-footer {
  display: flex;
  gap: 10px;
}

.text-secondary {
  color: var(--text-secondary);
}

.mr-5 {
  margin-right: 5px;
}
</style>
