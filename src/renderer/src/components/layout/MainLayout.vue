<template>
  <div class="layout-container" :class="layoutClasses">
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import TheSidebar from './TheSidebar.vue'
import TheHeader from './TheHeader.vue'
import { useTheme } from '../../composables/useTheme'

const { currentTheme } = useTheme()

const sidebarPosition = ref('left')

const layoutClasses = computed(() => ({
  'sidebar-right': sidebarPosition.value === 'right'
}))

const updateSidebarPosition = () => {
  try {
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}')
    sidebarPosition.value = settings?.appearance?.sidebarPosition || 'left'
  } catch (e) {
    console.error('Failed to parse settings for sidebar position:', e)
    sidebarPosition.value = 'left'
  }
}

onMounted(() => {
  // Ensure theme is applied to body
  const dataTheme = document.documentElement.getAttribute('data-theme')
  if (dataTheme) {
    document.body.setAttribute('data-theme', dataTheme)
  }

  // Handle sidebar position
  updateSidebarPosition()
  window.addEventListener('storage', updateSidebarPosition)
})

onUnmounted(() => {
  window.removeEventListener('storage', updateSidebarPosition)
})
</script>

<style scoped>
.layout-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  flex-direction: row;
}

.layout-container.sidebar-right {
  flex-direction: row-reverse;
}

.sidebar {
  height: 100%;
  z-index: 20;
  border-right: 1px solid var(--color-border);
}

.layout-container.sidebar-right .sidebar {
  border-right: none;
  border-left: 1px solid var(--color-border);
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
  background-color: var(--bg-color);
}

.content-area {
  flex: 1;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  overflow: auto;
}
</style>
