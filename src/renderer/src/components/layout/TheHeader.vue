<template>
  <div class="header">
    <div class="header-title">
      <h1 class="app-title">GitCommit</h1>
      <span class="page-title">{{ currentPageTitle }}</span>
    </div>
    <div class="header-actions">
      <div class="repo-selector">
        <el-select v-model="currentRepo" placeholder="选择仓库" filterable>
          <el-option
            v-for="repo in repositories"
            :key="repo.id"
            :label="repo.name"
            :value="repo.id"
          />
        </el-select>
        <el-button class="add-repo-btn" circle size="small" @click="openAddRepoDialog">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>

      <div class="user-menu">
        <el-dropdown trigger="click">
          <div class="user-avatar">
            <el-avatar :size="36" :src="userAvatar"></el-avatar>
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToSettings">
                <el-icon><Setting /></el-icon>
                <span>设置</span>
              </el-dropdown-item>
              <el-dropdown-item @click="refreshApp">
                <el-icon><RefreshRight /></el-icon>
                <span>刷新</span>
              </el-dropdown-item>
              <el-dropdown-item divided @click="exitApp">
                <el-icon><SwitchButton /></el-icon>
                <span>退出</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Plus, ArrowDown, Setting, RefreshRight, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 页面标题
const pageMap = {
  '/': '仪表盘',
  '/commits': '提交记录',
  '/branches': '分支管理',
  '/analysis': '代码分析',
  '/reports': '报告生成',
  '/settings': '设置'
}

const currentPageTitle = computed(() => {
  const path = route.path
  return pageMap[path] || '页面'
})

// 仓库列表
const repositories = ref([
  { id: 1, name: 'GitCommit' },
  { id: 2, name: 'electron-app' },
  { id: 3, name: 'vue-project' }
])

const currentRepo = ref(1)

// 用户头像
const userAvatar = ref('https://i.pravatar.cc/150?u=gitcommit')

// 打开添加仓库对话框
const openAddRepoDialog = () => {
  // 实际应用中会打开一个添加仓库的对话框
  console.log('Open add repository dialog')
}

// 跳转到设置页面
const goToSettings = () => {
  router.push('/settings')
}

// 刷新应用
const refreshApp = () => {
  window.location.reload()
}

// 退出应用
const exitApp = () => {
  // 在实际的Electron应用中，这里可以调用window.electron.ipcRenderer.send('quit-app')
  console.log('Exit application')
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 64px;
  min-height: 64px;
  max-height: 64px;
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

.page-title {
  font-size: 16px;
  color: var(--color-text-light);
  padding-left: 12px;
  border-left: 1px solid var(--color-border);
  pointer-events: none;
  user-select: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.repo-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-repo-btn {
  font-size: 12px;
}

.user-menu {
  display: flex;
  align-items: center;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.el-dropdown-menu .el-icon {
  margin-right: 8px;
}

/* 当侧边栏展开时调整头部位置 */
:deep([data-sidebar-expanded='true'] ~ .main-container .header) {
  left: 200px;
}
</style>
