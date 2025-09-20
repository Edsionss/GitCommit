
<template>
  <a-card title="环境变量设置" class="tool-card">
    <a-form layout="vertical">
      <a-form-item label="变量名 (Key)">
        <a-select v-model:value="selectedKey" @change="onKeySelectionChange">
          <a-select-option v-for="key in presetKeys" :key="key" :value="key">{{ key }}</a-select-option>
          <a-select-option :value="CUSTOM_KEY_FLAG">自定义...</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item v-if="selectedKey === CUSTOM_KEY_FLAG" label="自定义变量名">
        <a-input v-model:value="customKeyInput" placeholder="例如: MY_APP_SECRET" />
      </a-form-item>

      <a-form-item label="变量值 (Value)">
        <a-input-password v-model:value="valueInput" placeholder="输入变量的值" />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" @click="handleSaveEnvVar" :loading="isSaving">保存变量</a-button>
      </a-form-item>
    </a-form>
    <p class="ant-form-item-extra">提示: 保存后需要重启应用或终端才能使环境变量生效。</p>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSystemToolsStore } from '@/stores/systemToolsStore'
import { message } from 'ant-design-vue'

// --- Constants ---
const CUSTOM_KEY_FLAG = '_custom'
const presetKeys = ['GEMINI_API_KEY', 'CLAUDE_API_KEY']

// --- Store ---
const store = useSystemToolsStore()
const { geminiApiKey, claudeApiKey } = storeToRefs(store)

// --- Env Var State ---
const selectedKey = ref(presetKeys[0])
const customKeyInput = ref('')
const valueInput = ref('')
const isSaving = ref(false)

// --- Computed ---
const finalKeyToSave = computed(() => {
  return selectedKey.value === CUSTOM_KEY_FLAG ? customKeyInput.value.trim() : selectedKey.value
})

// --- Lifecycle ---
onMounted(async () => {
  await store.fetchEnvVars()
  onKeySelectionChange(selectedKey.value)
})

// --- Env Var Methods ---
function onKeySelectionChange(selection: string) {
  if (selection === CUSTOM_KEY_FLAG) {
    valueInput.value = ''
  } else if (selection === 'GEMINI_API_KEY') {
    valueInput.value = geminiApiKey.value
  } else if (selection === 'CLAUDE_API_KEY') {
    valueInput.value = claudeApiKey.value
  }
}

const handleSaveEnvVar = async () => {
  if (!finalKeyToSave.value) {
    message.warn('变量名不能为空。')
    return
  }
  isSaving.value = true
  await store.saveEnvVar(finalKeyToSave.value as any, valueInput.value)
  isSaving.value = false
}
</script>

<style scoped>
.tool-card {
  width: 100%;
}
</style>
