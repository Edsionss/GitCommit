<template>
  <div class="chat-history-sidebar" :class="{ visible: isVisible }">
    <div class="sidebar-header">
      <h3>会话历史</h3>
      <a-button @click="$emit('newSession')" type="primary" size="small">
        <template #icon><PlusOutlined /></template>
        新会话
      </a-button>
    </div>
    <div class="sidebar-content">
      <a-list :data-source="sessionHistory" item-layout="horizontal">
        <template #renderItem="{ item }">
          <a-list-item
            class="history-item"
            :class="{ active: item.id === activeSessionId }"
            @click="$emit('selectSession', item.id)"
          >
            <a-list-item-meta :title="item.name" />
            <a-popconfirm title="确定删除此会话吗?" @confirm.stop="$emit('deleteSession', item.id)">
              <a-button type="text" danger size="small" @click.stop>
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </a-popconfirm>
          </a-list-item>
        </template>
      </a-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'

defineProps<{ isVisible: boolean }>()
defineEmits(['selectSession', 'newSession', 'deleteSession'])

const chatStore = useChatStore()
const { sessionHistory, activeSessionId } = storeToRefs(chatStore)
</script>

<style scoped>
.chat-history-sidebar {
  width: 225px;
  height: 100%;
  border-right: 1px solid var(--border-secondary);
  background-color: var(--bg-container);
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
  border-bottom: 1px solid var(--border-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
}

.history-item {
  cursor: pointer;
  padding: 8px 16px;
  border-left: 3px solid transparent;
  border-radius: 0.5rem;
  margin-bottom: 5px;
  border-bottom: none;
}

.history-item.active {
  background-color: var(--brand-primary-bg);
  border-left-color: var(--brand-primary);
}

.history-item:hover {
  background-color: var(--brand-primary-bg);
}
:deep(.ant-list-item) {
  padding: 10px 5px;
}
</style>
