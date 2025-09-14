<template>
  <div class="ai-chat-page">
    <ChatHistorySidebar
      :is-visible="isSidebarVisible"
      @select-session="setActiveSession"
      @new-session="createNewSession"
      @delete-session="deleteSession"
    />

    <div class="main-chat-area">
      <ChatToolbar
        @toggle-sidebar="isSidebarVisible = !isSidebarVisible"
        @save-session="saveCurrentSession"
      />
      <ChatBox :isSidebarVisible="isSidebarVisible"></ChatBox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, computed } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import { useChatStore } from '@/stores/chatStore'
import ChatHistorySidebar from '@/components/AiChat/ChatHistorySidebar.vue'
import ChatToolbar from '@/components/AiChat/ChatToolbar.vue'
import ChatBox from '@/components/AiChat/ChatBox.vue'

const chatStore = useChatStore()

const isSidebarVisible = ref(true)

const saveCurrentSession = () => {
  chatStore._saveToLocalStorage()
  antMessage.success('会话保存成功！')
}

const setActiveSession = (sessionId: string) => {
  chatStore.setActiveSession(sessionId)
}

const createNewSession = () => {
  chatStore.createNewSession()
}

const deleteSession = (sessionId: string) => {
  chatStore.deleteSession(sessionId)
}
</script>

<style scoped>
.ai-chat-page {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 0.5rem;
}

.main-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Important for flex children */
}
</style>
