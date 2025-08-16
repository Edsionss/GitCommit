<template>
  <div class="repository-header">
    <h2 class="page-title">代码仓库</h2>
    <div class="repository-actions">
      <el-button type="primary" @click="$emit('addRepo')">
        <el-icon class="mr-5"><FolderAdd /></el-icon>
        添加仓库
      </el-button>
      <el-button @click="$emit('refreshRepos')">
        <el-icon class="mr-5"><Refresh /></el-icon>
        刷新
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderAdd, Refresh } from '@element-plus/icons-vue'

defineEmits(['addRepo', 'refreshRepos'])
</script>

<style scoped>
.repository-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.repository-actions {
  display: flex;
  gap: 10px;
}

.mr-5 {
  margin-right: 5px;
}
</style>
