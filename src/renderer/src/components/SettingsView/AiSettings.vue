<template>
  <a-card title="AI 设置" class="settings-card">
    <a-form :model="form" layout="vertical">
      <a-form-item label="AI 提供商">
        <a-select v-model:value="form.provider" placeholder="请选择 AI 提供商">
          <a-select-option :value="item.value" v-for="item in aiProviderOption">{{
            item.label
          }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="API Key" :rules="[{ required: true, message: '请输入 API Key!' }]">
        <a-input-password v-model:value="form.apiKey" placeholder="请输入您的 API Key" />
      </a-form-item>

      <div v-if="form.provider === 'custom'">
        <a-form-item
          label="API Endpoint"
          :rules="[{ required: true, message: '请输入 API Endpoint!' }]"
        >
          <a-input v-model:value="form.endpoint" placeholder="请输入自定义 API Endpoint" />
        </a-form-item>
      </div>

      <a-form-item label="使用模型">
        <a-select v-model:value="form.model" placeholder="请选择模型">
          <a-select-option :value="model.value" v-for="model in modelOption">{{
            model.label
          }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="启用会话记忆">
        <template #extra>
          开启后，AI 将记住之前的对话内容。但这会消耗更多的 Token。
        </template>
        <a-switch v-model:checked="form.enableAiHistory" />
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { reactive, watch, PropType, computed } from 'vue'

interface AiSettings {
  provider: 'openai' | 'gemini' | 'anthropic' | 'custom' | null
  apiKey: string
  endpoint?: string
  model?: string
  enableAiHistory?: boolean
}

const props = defineProps({
  settings: {
    type: Object as PropType<AiSettings>,
    required: true
  }
})

const emit = defineEmits(['update:settings'])

// Local reactive form state that mirrors the props
const form = reactive<AiSettings>({ ...props.settings })

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
  return aiModelDict[form.provider as string]
})

// Watch for changes in props (from parent) and update the local form
watch(
  () => props.settings,
  (newSettings) => {
    Object.assign(form, newSettings)
  },
  { deep: true }
)

// Watch for changes in the local form (from user input) and emit to parent
watch(
  form,
  (newFormState) => {
    emit('update:settings', newFormState)
  },
  { deep: true }
)
</script>

<style scoped>
.settings-card {
  margin-bottom: 20px;
}
</style>
