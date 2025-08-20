<template>
  <a-card title="AI 设置" class="settings-card">
    <a-form :model="form" layout="vertical">
      <a-form-item label="AI 提供商">
        <a-select v-model:value="form.provider" placeholder="请选择 AI 提供商">
          <a-select-option value="openai">OpenAI</a-select-option>
          <a-select-option value="gemini">Google Gemini</a-select-option>
          <a-select-option value="anthropic">Anthropic Claude</a-select-option>
          <a-select-option value="custom">自定义</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        label="API Key"
        :rules="[{ required: true, message: '请输入 API Key!' }]"
      >
        <a-input-password
          v-model:value="form.apiKey"
          placeholder="请输入您的 API Key"
        />
      </a-form-item>

      <div v-if="form.provider === 'custom'">
        <a-form-item
          label="API Endpoint"
          :rules="[{ required: true, message: '请输入 API Endpoint!' }]"
        >
          <a-input
            v-model:value="form.endpoint"
            placeholder="请输入自定义 API Endpoint"
          />
        </a-form-item>
      </div>

      <a-form-item label="默认模型">
        <a-input
          v-model:value="form.model"
          placeholder="请输入默认使用的模型名称 (例如 gpt-4, gemini-pro)"
        />
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { reactive, watch, PropType } from 'vue';

interface AiSettings {
  provider: 'openai' | 'gemini' | 'anthropic' | 'custom' | null;
  apiKey: string;
  endpoint?: string;
  model?: string;
}

const props = defineProps({
  settings: {
    type: Object as PropType<AiSettings>,
    required: true,
  },
});

const emit = defineEmits(['update:settings']);

// Local reactive form state that mirrors the props
const form = reactive<AiSettings>({ ...props.settings });

// Watch for changes in props (from parent) and update the local form
watch(
  () => props.settings,
  (newSettings) => {
    Object.assign(form, newSettings);
  },
  { deep: true }
);

// Watch for changes in the local form (from user input) and emit to parent
watch(
  form,
  (newFormState) => {
    emit('update:settings', newFormState);
  },
  { deep: true }
);
</script>

<style scoped>
.settings-card {
  margin-bottom: 20px;
}
</style>