<template>
  <div class="ntfy-notification-container">
    <a-card title="Ntfy消息推送" :bordered="false">
      <!-- 消息推送表单 -->
      <a-row :gutter="16" style="margin-bottom: 24px">
        <a-col :span="24">
          <MessageForm @message-sent="handleMessageSent" />
        </a-col>
      </a-row>

      <!-- 推送历史记录 -->
      <a-row :gutter="16">
        <a-col :span="24">
          <MessageHistory ref="messageHistoryRef" />
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MessageForm from '@components/NtfyNotification/MessageForm.vue'
import MessageHistory from '@components/NtfyNotification/MessageHistory.vue'

// 引用历史记录组件
const messageHistoryRef = ref<InstanceType<typeof MessageHistory> | null>(null)

// 处理消息发送成功事件
const handleMessageSent = () => {
  // 刷新历史记录
  if (messageHistoryRef.value) {
    messageHistoryRef.value.refreshLogs()
  }
}
</script>

<style scoped>
.ntfy-notification-container {
}
</style>
