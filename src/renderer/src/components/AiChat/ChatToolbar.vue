<template>
  <div class="chat-toolbar">
    <a-button @click="$emit('toggleSidebar')" type="text">
      <template #icon><MenuOutlined /></template>
    </a-button>
    <div class="toolbar-title">AI 助手</div>
    <a-button @click="$emit('saveSession')">
      <template #icon><SaveOutlined /></template>
      保存会话
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { MenuOutlined, SaveOutlined } from '@ant-design/icons-vue';

defineEmits(['toggleSidebar', 'saveSession']);
</script>

<style scoped>
.chat-toolbar {
  height: 50px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: var(--color-background);
  flex-shrink: 0; /* Prevent toolbar from shrinking */
}

.toolbar-title {
  flex: 1;
  text-align: center;
  font-weight: 600;
}
</style>
