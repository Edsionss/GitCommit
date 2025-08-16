<template>
  <div class="sidebar" :class="{ expanded: isExpanded }">
    <div class="sidebar-header">
      <div class="logo">
        <img v-if="isExpanded" :src="logoFull" alt="GitCommit Logo" class="logo-icon" />
        <img v-else :src="logoFull" alt="GitCommit Icon" class="logo-icon" />
      </div>
      <div class="sidebar-toggle-button">
        <a-button class="toggle-button" type="text" size="small" @click="toggleSidebar">
          <template #icon>
            <LeftOutlined v-if="isExpanded" />
            <RightOutlined v-else />
          </template>
        </a-button>
      </div>
    </div>

    <div class="sidebar-menu">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="menu-item"
        :class="{ active: isActive(item.path) }"
      >
        <component :is="item.icon" />
        <span v-if="isExpanded" class="menu-label">{{ item.label }}</span>
      </router-link>
    </div>

    <div class="sidebar-footer">
      <router-link to="/settings" class="menu-item" :class="{ active: isActive('/settings') }">
        <SettingOutlined />
        <span v-if="isExpanded" class="menu-label">设置</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import logoFull from '@/assets/img/logo/LOGO1.png'
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ShareAltOutlined,
  AreaChartOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons-vue'

const isExpanded = ref(true)
const route = useRoute()

const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value
  localStorage.setItem('sidebarExpanded', isExpanded.value.toString())

  // 通知父组件侧边栏状态
  document.documentElement.dataset.sidebarExpanded = isExpanded.value.toString()

  // 全局事件分发
  window.dispatchEvent(
    new CustomEvent('sidebar-state-change', {
      detail: { expanded: isExpanded.value }
    })
  )
}

const menuItems = [
  { path: '/', label: '概览', icon: HomeOutlined },
  { path: '/commits', label: '提交记录', icon: FileTextOutlined },
  { path: '/branches', label: '分支管理', icon: ShareAltOutlined },
  { path: '/analysis', label: '代码分析', icon: BarChartOutlined },
  { path: '/reports', label: '报告生成', icon: AreaChartOutlined }
]

const isActive = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

// 组件初始化时读取侧边栏状态
const initSidebar = () => {
  const savedState = localStorage.getItem('sidebarExpanded')
  if (savedState !== null) {
    isExpanded.value = savedState === 'true'
  }

  // 通知父组件侧边栏状态
  document.documentElement.dataset.sidebarExpanded = isExpanded.value.toString()

  // 全局事件分发
  window.dispatchEvent(
    new CustomEvent('sidebar-state-change', {
      detail: { expanded: isExpanded.value }
    })
  )
}

// 组件初始化时读取侧边栏状态
initSidebar()
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 60px;
  background-color: var(--color-background-soft);
  border-right: 1px solid var(--color-border);
  transition: width 0.3s ease;
  overflow: hidden;
  z-index: 40; /* 确保高于header */
}

.sidebar.expanded {
  width: 200px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  position: relative;
  z-index: 30;
  min-height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-icon {
  height: 24px;
  width: 24px;
}

.toggle-button {
  z-index: 40;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 增强阴影效果 */
}

.toggle-button .anticon {
  font-size: 14px;
}

.sidebar-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  overflow-y: auto;
}

.sidebar-footer {
  padding: 16px 0;
  border-top: 1px solid var(--color-border);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: var(--color-text);
  text-decoration: none;
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: var(--color-background-mute);
}

.menu-item.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.anticon {
  font-size: 18px;
}
</style>