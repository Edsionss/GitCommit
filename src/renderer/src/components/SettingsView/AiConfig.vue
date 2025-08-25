<template>
  <a-card title="AI 设置" class="AiConfig-card">
    <a-form :model="AiConfig" layout="vertical">
      <a-form-item label="AI 提供商">
        <a-select v-model:value="AiConfig.provider" placeholder="请选择 AI 提供商">
          <a-select-option :value="item.value" v-for="item in aiProviderOption">{{
            item.label
          }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="API Key" :rules="[{ required: true, message: '请输入 API Key!' }]">
        <a-input-password v-model:value="AiConfig.apiKey" placeholder="请输入您的 API Key" />
      </a-form-item>

      <div v-if="AiConfig.provider === 'custom'">
        <a-form-item
          label="API Endpoint"
          :rules="[{ required: true, message: '请输入 API Endpoint!' }]"
        >
          <a-input v-model:value="AiConfig.endpoint" placeholder="请输入自定义 API Endpoint" />
        </a-form-item>
      </div>

      <a-form-item label="使用模型">
        <a-select v-model:value="AiConfig.model" placeholder="请选择模型" mode="combobox">
          <a-select-option :value="model.value" v-for="model in modelOption">{{
            model.label
          }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="启用会话记忆">
        <template #extra> 开启后，AI 将记住之前的对话内容。但这会消耗更多的 Token。 </template>
        <a-switch v-model:checked="AiConfig.enableAiHistory" />
      </a-form-item>
      <a-form-item label="自动保存会话">
        <template #extra> 开启后，AI 将自动保存会话，不需要手动保存。 </template>
        <a-switch v-model:checked="AiConfig.enableAutoSave" />
      </a-form-item>

      <a-form-item label="流式传输">
        <template #extra> 开启后，AI 将进行流式渲染，否则是阻塞渲染。 </template>
        <a-switch v-model:checked="AiConfig.enableStreaming" />
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { storeToRefs } from 'pinia'
const settingStore = useSettingsStore()
const { AiConfig } = storeToRefs(settingStore)

const aiModelDict = {
  openai: [{ value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' }],
  gemini: [{ value: 'gemini-2.5-flash', label: 'gemini-2.5-flash' }],
  kimi: [{ value: 'kimi-k2-0711-preview', label: 'kimi-k2-0711-preview' }]
}

const aiProviderOption = reactive([
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'kimi', label: 'kimi' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'custom', label: 'Custom' }
])

const modelOption = computed(() => {
  return aiModelDict[AiConfig.value.provider as string]
})
</script>

<style scoped>
.AiConfig-card {
  margin-bottom: 20px;
}
</style>
