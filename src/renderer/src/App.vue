<template>
  <a-config-provider :theme="themeConfig">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, watchEffect, onMounted } from 'vue'
import { theme as antTheme } from 'ant-design-vue'
import { useTheme } from './composables/useTheme'
import { useWebSocketStore } from '@/stores/webSocketStore'

// 初始化 WebSocket store
const wsStore = useWebSocketStore()

onMounted(() => {
  // 开启对直接广播的监听
  wsStore.listenForDirectBroadcasts()
})

const { effectiveTheme } = useTheme()
const { token } = antTheme.useToken()

// 动态配置ConfigProvider的主题算法
const themeConfig = computed(() => ({
  algorithm: effectiveTheme.value === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm
}))

// 监听Ant Design的Token变化，并将其应用为CSS变量
watchEffect(() => {
  if (!token.value) return // 增加一个健壮性检查
  const root = document.documentElement
  const tk = token.value
  // --- 1. 背景色 (Surfaces) ---
  root.style.setProperty('--bg-layout', tk.colorBgLayout) // 整个页面的最底层背景
  root.style.setProperty('--bg-container', tk.colorBgContainer) // 内容区域、卡片、输入框、弹窗等
  root.style.setProperty('--bg-elevated', tk.colorBgElevated) // 悬浮层，如 Dropdown、Popover
  root.style.setProperty('--bg-spotlight', tk.colorBgSpotlight) // Spotlight 背景色，用于引导
  root.style.setProperty('--bg-hover', tk.colorBgTextHover) // 列表项等元素的 hover 背景

  // --- 2. 文本色 (Typography) ---
  root.style.setProperty('--text-primary', tk.colorText) // 主要文本
  root.style.setProperty('--text-secondary', tk.colorTextSecondary) // 次要文本
  root.style.setProperty('--text-tertiary', tk.colorTextTertiary) // 第三级文本，如占位符
  root.style.setProperty('--text-quaternary', tk.colorTextQuaternary) // 第四级文本，如禁用状态

  // --- 3. 边框与分割线色 (Borders & Dividers) ---
  root.style.setProperty('--border-primary', tk.colorBorder) // 主要边框，用于输入框等
  root.style.setProperty('--border-secondary', tk.colorBorderSecondary) // 次要边框，用于分割线
  root.style.setProperty('--divider', tk.colorSplit) // 分割线颜色，与 border-secondary 类似

  // --- 4. 品牌色与交互色 (Brand & Interactive) ---
  root.style.setProperty('--brand-primary', tk.colorPrimary) // 品牌主色
  root.style.setProperty('--brand-primary-hover', tk.colorPrimaryHover) // 主色悬浮
  root.style.setProperty('--brand-primary-active', tk.colorPrimaryActive) // 主色点击
  root.style.setProperty('--brand-primary-bg', tk.colorPrimaryBg) // 主色的浅色背景
  root.style.setProperty('--text-on-brand', tk.colorWhite) // 在品牌色背景上的文字颜色（通常是白色）
  root.style.setProperty('--link', tk.colorLink) // 链接颜色
  root.style.setProperty('--link-hover', tk.colorLinkHover) // 链接悬浮
  root.style.setProperty('--link-active', tk.colorLinkActive) // 链接点击

  // --- 5. 状态色 (Status) ---
  root.style.setProperty('--color-success', tk.colorSuccess)
  root.style.setProperty('--color-warning', tk.colorWarning)
  root.style.setProperty('--color-error', tk.colorError)
  root.style.setProperty('--color-info', tk.colorInfo)
  root.style.setProperty('--color-danger', tk.colorError) // 保持兼容性，--color-danger映射到--color-error

  // --- 6. 辅助：生成RGB变量，用于 background-color: rgba() ---
  const generateRGBVariable = (color: string, variableName: string) => {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      root.style.setProperty(variableName, `${r}, ${g}, ${b}`)
    }
  }
  
  generateRGBVariable(tk.colorPrimary, '--brand-primary-rgb')
  generateRGBVariable(tk.colorSuccess, '--color-success-rgb')
  generateRGBVariable(tk.colorWarning, '--color-warning-rgb')
  generateRGBVariable(tk.colorError, '--color-error-rgb')
  generateRGBVariable(tk.colorInfo, '--color-info-rgb')
})
</script>

<style>
/* 全局样式重置，确保根元素占满视口 */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  background-color: var(--bg-layout);
  color: var(--text-primary);
  transition:
    background-color 0.3s,
    color 0.3s;
}

/* 添加全局页面容器样式 */
.page-container {
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}
</style>
