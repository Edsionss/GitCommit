<template>
  <a-card title="发送消息" size="small">
    <a-form :model="messageForm" layout="vertical" @finish="handleSendMessage">
      <a-form-item
        label="推送主题"
        name="topic"
        :rules="[{ required: true, message: '请输入推送主题' }]"
      >
        <a-input
          v-model:value="messageForm.topic"
          placeholder="例如: mytopic"
          :disabled="sending"
        />
      </a-form-item>

      <a-form-item
        label="消息内容"
        name="message"
        :rules="[{ required: true, message: '请输入消息内容' }]"
      >
        <a-textarea
          v-model:value="messageForm.message"
          placeholder="请输入要推送的消息内容"
          :rows="4"
          :disabled="sending"
        />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="sending"> 发送消息 </a-button>
        <a-button style="margin-left: 8px" @click="resetForm" :disabled="sending">
          重置
        </a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { sendNtfyMessage } from '@/api/ntfyNotification'

// 消息表单
const messageForm = reactive({
  topic: '',
  message: ''
})

// 发送状态
const sending = ref(false)

// 定义emits
const emit = defineEmits<{
  messageSent: []
}>()

// 发送消息
const handleSendMessage = async () => {
  sending.value = true
  try {
    const response = await sendNtfyMessage({
      topic: messageForm.topic,
      message: messageForm.message
    })

    if (response.success) {
      message.success('消息发送成功')
      resetForm()
      emit('messageSent')
    } else {
      message.error(`消息发送失败: ${response.error}`)
    }
  } catch (error) {
    console.error('发送消息出错:', error)
    message.error('发送消息时发生错误')
  } finally {
    sending.value = false
  }
}

// 重置表单
const resetForm = () => {
  messageForm.topic = ''
  messageForm.message = ''
}
</script>