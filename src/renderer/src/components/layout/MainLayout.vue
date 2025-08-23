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
          <router-view v-slot="{ Component, route }">
            <keep-alive v-if="route.meta.keepAlive">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
            <component v-if="!route.meta.keepAlive" :is="Component" :key="route.fullPath" />
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settingsStore'
import TheSidebar from './TheSidebar.vue'
import TheHeader from './TheHeader.vue'
import { useTheme } from '@composables/useTheme'

// Initialize theme composable
useTheme()

const settingsStore = useSettingsStore()
const { appSettings } = storeToRefs(settingsStore)

const sidebarPosition = computed(() => appSettings.value?.appearance?.sidebarPosition || 'left')

const layoutClasses = computed(() => ({
  'sidebar-right': sidebarPosition.value === 'right'
}))

onMounted(() => {
  // Ensure theme is applied to body, which is handled by useTheme now
  // The store loads initial state, and watchers in composables handle the rest.
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
