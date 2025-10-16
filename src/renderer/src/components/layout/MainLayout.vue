<template>
  <div class="layout-container" :class="layoutClasses">
    <div class="sidebar">
      <TheSidebar v-model="isExpanded" />
    </div>
    <div class="body">
      <div class="header">
        <TheHeader v-model:="isExpanded" />
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
import { computed, ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settingsStore'
import TheSidebar from './TheSidebar/index.vue'
import TheHeader from './TheHeader.vue'

// --- Layout State ---
const isExpanded = ref(true)
const settingsStore = useSettingsStore()
const { DisplayConfig } = storeToRefs(settingsStore)
const sidebarPosition = computed(() => DisplayConfig?.value?.sidebarPosition || 'left')
const layoutClasses = computed(() => ({
  'sidebar-right': sidebarPosition.value === 'right'
}))

// --- Error Handling ---
const router = useRouter()
onErrorCaptured((err, instance, info) => {
  console.error('An error was captured in a child component:', err, instance, info)
  // Navigate to the dedicated error route
  router.push({ name: 'Error' })
  // Prevent the error from propagating further
  return false
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
}

.layout-container.sidebar-right .sidebar {
  border-right: none;
  border-left: 1px solid var(--border-primary);
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
  border: 1px solid var(--border-primary);
  flex: 1;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  overflow: auto;
}
</style>
