<template>
  <div class="chat-history-sidebar" :class="{ visible: isVisible }">
    <div class="sidebar-header">
      <h3>会话历史</h3>
    </div>
    <div class="sidebar-content">
      <a-list :data-source="history" item-layout="horizontal">
        <template #renderItem="{ item }">
          <a-list-item class="history-item">
            <a-list-item-meta :title="item.title" :description="item.lastActivity" />
          </a-list-item>
        </template>
      </a-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ isVisible: boolean }>()

// Dummy data for now
const history = ref([
  { id: '1', title: '关于项目的重构计划', lastActivity: '2 hours ago' },
  { id: '2', title: '如何使用 Pinia', lastActivity: 'Yesterday' },
  { id: '3', title: 'Vue 3 Composition API 最佳实践', lastActivity: '3 days ago' }
])
</script>

<style scoped>
.chat-history-sidebar {
  width: 225px;
  height: 100%;
  border-right: 1px solid var(--color-border);
  background-color: var(--color-background);
  display: flex;
  flex-direction: column;
  transition:
    width 0.3s ease,
    margin-left 0.3s ease;
  margin-left: -225px;
}

.chat-history-sidebar.visible {
  margin-left: 0;
}

.sidebar-header {
  padding: 11.5px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.history-item {
  cursor: pointer;
  padding: 12px 16px;
}

.history-item:hover {
  background-color: var(--color-background-soft);
}
</style>
