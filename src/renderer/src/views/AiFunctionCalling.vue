<template>
  <div class="ai-function-calling-page">
    <div class="page-header">
      <h1>AI Function Calling 功能测试</h1>
      <p>测试AI模型的工具调用能力</p>
    </div>

    <div class="content-area">
      <div class="config-section">
        <h3>AI配置</h3>
        <a-form layout="vertical">
          <a-form-item label="AI提供商">
            <a-select v-model:value="aiConfig.provider" style="width: 200px">
              <a-select-option value="openai">OpenAI</a-select-option>
              <a-select-option value="gemini">Gemini</a-select-option>
              <a-select-option value="kimi">KiMi</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="API密钥">
            <a-input-password v-model:value="aiConfig.apiKey" placeholder="请输入API密钥" />
          </a-form-item>
          <a-form-item label="模型">
            <a-input v-model:value="aiConfig.model" placeholder="例如: gpt-3.5-turbo" />
          </a-form-item>
        </a-form>
      </div>

      <div class="tools-section">
        <h3>可用工具</h3>
        <a-checkbox-group v-model:value="selectedTools">
          <a-checkbox value="test">随机数生成工具 (test)</a-checkbox>
        </a-checkbox-group>
      </div>

      <div class="chat-section">
        <h3>对话区域</h3>
        <div class="chat-messages">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message"
            :class="message.role"
          >
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div v-if="message.tool_calls" class="tool-calls">
                <h4>工具调用:</h4>
                <div v-for="(tool, toolIndex) in message.tool_calls" :key="toolIndex" class="tool-call">
                  <strong>{{ tool.function.name }}</strong>
                  <pre>{{ tool.function.arguments }}</pre>
                  <div v-if="tool.result" class="tool-result">
                    <strong>结果:</strong>
                    <pre>{{ tool.result }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="input-area">
          <a-input
            v-model:value="currentMessage"
            placeholder="输入消息，例如：请生成一个1到100之间的随机数"
            @press-enter="sendMessage"
            :disabled="isLoading"
          />
          <a-button
            type="primary"
            @click="sendMessage"
            :loading="isLoading"
            style="margin-left: 8px"
          >
            发送
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import { aiApi } from '@/api/ai'
import type { AiConfig } from '@sharedType/ai'

// AI配置
const aiConfig = reactive<AiConfig>({
  provider: 'openai',
  apiKey: '',
  model: 'gpt-3.5-turbo'
})

// 选中的工具
const selectedTools = ref<string[]>(['test'])

// 当前输入的消息
const currentMessage = ref('')

// 消息历史
const messages = ref<any[]>([])

// 加载状态
const isLoading = ref(false)

// 发送消息
const sendMessage = async () => {
  if (!currentMessage.value.trim()) {
    antMessage.warning('请输入消息内容')
    return
  }

  if (!aiConfig.apiKey) {
    antMessage.warning('请先配置API密钥')
    return
  }

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: currentMessage.value
  })

  const userMessage = currentMessage.value
  currentMessage.value = ''
  isLoading.value = true

  try {
    // 准备工具参数
    const tools = selectedTools.value.length > 0 ? [
      {
        type: 'function',
        function: {
          name: 'test',
          description: '生成指定范围内的随机整数',
          parameters: {
            type: 'object',
            properties: {
              min: {
                type: 'number',
                description: '最小值'
              },
              max: {
                type: 'number',
                description: '最大值'
              }
            },
            required: ['min', 'max']
          }
        }
      }
    ] : undefined

    // 调用AI API
    const response = await aiApi.aiChatWithTools({
      prompt: userMessage,
      aiConfig,
      history: messages.value.slice(0, -1), // 排除刚添加的用户消息
      isStream: false,
      tools
    })

    // 添加AI响应
    messages.value.push({
      role: 'assistant',
      content: response.content || '',
      tool_calls: response.tool_calls
    })

    antMessage.success('消息发送成功')
  } catch (error) {
    console.error('发送消息失败:', error)
    antMessage.error('发送消息失败，请检查配置和网络连接')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.ai-function-calling-page {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.page-header p {
  margin: 0;
  color: var(--text-color-secondary);
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-section,
.tools-section,
.chat-section {
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 16px;
  box-shadow: var(--shadow-1);
}

.config-section h3,
.tools-section h3,
.chat-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
}

.chat-messages {
  height: 300px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  background-color: var(--background-color);
}

.message {
  margin-bottom: 16px;
}

.message.user {
  text-align: right;
}

.message-content {
  display: inline-block;
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 8px;
}

.message.user .message-content {
  background-color: var(--primary-color);
  color: white;
}

.message.assistant .message-content {
  background-color: var(--background-color-light);
  color: var(--text-color);
}

.message-text {
  white-space: pre-wrap;
}

.tool-calls {
  margin-top: 8px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.tool-call {
  margin-bottom: 8px;
}

.tool-call pre {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 12px;
  margin: 4px 0;
  padding: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.tool-result {
  margin-top: 4px;
  color: var(--success-color);
}

.input-area {
  display: flex;
  align-items: center;
}
</style>