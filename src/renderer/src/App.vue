<template>
  <a-config-provider :theme="themeConfig">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { theme as antTheme } from 'ant-design-vue'
import { useTheme } from './composables/useTheme'

const { currentTheme } = useTheme()
const { token } = antTheme.useToken()

// 动态配置ConfigProvider的主题算法
const themeConfig = computed(() => ({
  algorithm: currentTheme.value === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm
}))

// 监听Ant Design的Token变化，并将其应用为CSS变量
watchEffect(() => {
  const root = document.documentElement
  root.style.setProperty('--primary-color', token.value.colorPrimary)
  root.style.setProperty('--bg-color', token.value.colorBgLayout)
  root.style.setProperty('--bg-content', token.value.colorBgContainer)
  root.style.setProperty('--card-bg', token.value.colorBgContainer)
  root.style.setProperty('--border-color', token.value.colorBorder)
  root.style.setProperty('--text-primary', token.value.colorText)
  root.style.setProperty('--text-secondary', token.value.colorTextSecondary)
  root.style.setProperty('--text-muted', token.value.colorTextTertiary)
  root.style.setProperty('--hover-bg', token.value.colorBgTextHover)

  // 生成--primary-color-rgb变量
  const primaryColor = token.value.colorPrimary
  if (primaryColor.startsWith('#')) {
    const r = parseInt(primaryColor.slice(1, 3), 16)
    const g = parseInt(primaryColor.slice(3, 5), 16)
    const b = parseInt(primaryColor.slice(5, 7), 16)
    root.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`)
  }
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
  background-color: var(--bg-color);
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
