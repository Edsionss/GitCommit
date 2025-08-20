<template>
  <div class="chat-toolbar">
    <a-button @click="$emit('toggle-sidebar')" type="text">
      <template #icon><MenuOutlined /></template>
    </a-button>
    <div class="toolbar-title">AI Chat</div>
    <a-button @click="$emit('save-session')">
      <template #icon><SaveOutlined /></template>
      保存会话
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { MenuOutlined, SaveOutlined } from '@ant-design/icons-vue'

defineEmits(['toggle-sidebar', 'save-session'])
</script>

<style scoped>
.chat-toolbar {
  height: 50px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: var(--color-background);
}

.toolbar-title {
  flex: 1;
  text-align: center;
  font-weight: 600;
}
</style>
