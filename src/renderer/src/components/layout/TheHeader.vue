<template>
  <div class="header">
    <div class="header-title">
      <a-layout-header style="background: #fff; padding: 0">
        <menu-unfold-outlined
          v-if="isExpanded"
          class="trigger"
          @click="() => (isExpanded = !isExpanded)"
        />
        <menu-fold-outlined v-else class="trigger" @click="() => (isExpanded = !isExpanded)" />
      </a-layout-header>
      <h1 class="app-title">
        {{ PROJECT_NAME }} <a-tag :bordered="false" color="cyan">{{ PROJECT_VERSION }}</a-tag>
      </h1>
      <span class="page-title">{{ currentPageTitle }}</span>
      <span class="code-container">{{ route.fullPath }}</span>
    </div>
    <div class="header-actions">
      <div class="user-menu">
        <a-dropdown trigger="click">
          <div class="user-avatar">
            <a-avatar :size="40" :src="CognitoOcean"></a-avatar>
            <DownOutlined />
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item key="settings" @click="goToSettings">
                <SettingOutlined />
                <span>设置</span>
              </a-menu-item>
              <a-menu-item key="refresh" @click="refreshApp">
                <ReloadOutlined />
                <span>刷新</span>
              </a-menu-item>
              <a-menu-item key="exit" @click="exitApp">
                <LogoutOutlined />
                <span>退出</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CognitoOcean from '@/assets/img/logo/CognitoOcean.png'

import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  PlusOutlined,
  DownOutlined,
  SettingOutlined,
  ReloadOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'
const PROJECT_NAME = import.meta.env.NAME
const PROJECT_VERSION = import.meta.env.VERSION

const isExpanded = defineModel<boolean>()

const router = useRouter()
const route = useRoute()

const currentPageTitle = computed(() => {
  return route.meta.title || ''
})

const currentRepo = ref(1)

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
  background-color: var(--bg-content);
  border-bottom: 1px solid var(--border-color);
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
  color: var(--text-primary);
}

.page-title {
  font-size: 16px;
  color: var(--text-secondary);
  padding-left: 12px;
  border-left: 1px solid var(--border-color);
  pointer-events: none;
  user-select: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
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

/* 当侧边栏展开时调整头部位置 */
:deep([data-sidebar-expanded='true'] ~ .main-container .header) {
  left: 200px;
}
</style>
