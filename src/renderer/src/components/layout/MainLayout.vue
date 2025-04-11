<template>
  <div class="layout-container">
    <div class="sidebar">
      <TheSidebar />
    </div>
    <div class="body">
      <div class="header">
        <TheHeader />
      </div>
      <div class="main">
        <div class="content-area">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import TheSidebar from './TheSidebar.vue'
import TheHeader from './TheHeader.vue'
import { useTheme } from '../../composables/useTheme'

const { currentTheme } = useTheme()

onMounted(() => {
  // 确保主题应用到body上
  const dataTheme = document.documentElement.getAttribute('data-theme')
  if (dataTheme) {
    document.body.setAttribute('data-theme', dataTheme)
  }
})
</script>

<style scoped>
.layout-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  height: 100%;
  z-index: 20;
}

.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.header {
  width: 100%;
  z-index: 10;
  position: sticky;
  top: 0;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.content-area {
  flex: 1;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
  overflow: auto;
}
</style>
