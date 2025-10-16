<template>
  <div class="header">
    <div class="header-title">
      <a-layout-header style="padding: 0">
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
      <AppMetricsDisplay />
    </div>
    <div class="header-actions">
      <div class="application-menu">
        <div class="theme menu-box" @click="toggleTheme">
          <i-heroicons-solid-sun v-if="DisplayConfig.theme === 'dark'" />
          <i-heroicons-solid-moon v-else />
        </div>
        <div class="menu-box">
          <SettingOutlined @click="goToSettings" />
        </div>
        <div class="menu-box">
          <ReloadOutlined @click="refreshApp" />
        </div>
      </div>
      <a-divider style="border-color: #87868673; height: 20px" type="vertical" />
      <WindowControls />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useRouter, useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settingsStore'
import AppMetricsDisplay from '@/components/Common/AppMetricsDisplay.vue'
import WindowControls from './WindowControls.vue'
import { storeToRefs } from 'pinia'
import {
  SettingOutlined,
  ReloadOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons-vue'

const PROJECT_NAME = import.meta.env.NAME
const PROJECT_VERSION = import.meta.env.VERSION

// Initialize performance metrics listener
const appStore = useAppStore()
appStore.listenForAppMetrics()

const isExpanded = defineModel<boolean>()

const router = useRouter()
const route = useRoute()

const settingsStore = useSettingsStore()
const { DisplayConfig } = storeToRefs(settingsStore)

const currentPageTitle = computed(() => {
  return route.meta.title || ''
})

// 切换主题
const toggleTheme = () => {
  DisplayConfig.value.theme = DisplayConfig.value.theme === 'light' ? 'dark' : 'light'
  settingsStore.saveTheme()
}

// 跳转到设置页面
const goToSettings = () => {
  router.push('/settings')
}

// 刷新应用
const refreshApp = () => {
  window.location.reload()
}
</script>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 64px;
  min-height: 64px;
  max-height: 64px;
  background-color: var(--bg-container);
  z-index: 100;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  -webkit-app-region: drag;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  -webkit-app-region: no-drag;
}

.app-title {
  font-family: Crystal;
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  white-space: nowrap;
  color: var(--text-primary);
}

.page-title {
  font-size: 16px;
  color: var(--text-secondary);
  padding-left: 12px;
  border-left: 1px solid var(--border-secondary);
  pointer-events: none;
  user-select: none;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  -webkit-app-region: no-drag;
}

.application-menu {
  display: flex;
  align-items: center;
  cursor: pointer;

  .theme,
  .menu-box {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 50%;
    -webkit-app-region: no-drag;
    pointer-events: auto;
  }
  .menu-box:hover {
    background-color: var(--bg-hover);
  }
}

/* 当侧边栏展开时调整头部位置 */
:deep([data-sidebar-expanded='true'] ~ .main-container .header) {
  left: 200px;
}
</style>
