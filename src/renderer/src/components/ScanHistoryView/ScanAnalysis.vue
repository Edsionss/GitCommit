<template>
  <div class="analysis-container">
    <div v-if="!record.analysisResult" class="empty-content">
      <a-empty description="暂无分析结果" />
      <a-button type="primary" @click="analysis"> <AlertOutlined />立即分析 </a-button>
    </div>
    <div v-else v-html="renderMarkdown(record.analysisResult)"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { AlertOutlined } from '@ant-design/icons-vue'
import { marked } from 'marked'
defineProps({
  record: { type: Object, default: null }
})
const AnalysisResult = ref<any>(null)

const emit = defineEmits(['analysis'])
const renderMarkdown = (text: string) => {
  if (!text) {
    return ''
  }
  return marked.parse(text, { gfm: true, breaks: true })
}
const analysis = () => {
  emit('analysis')
}
</script>

<style scoped lang="scss">
.analysis-container {
  background-color: var(--color-background-soft);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  height: 100%;
  overflow-y: auto;
  font-family: 'inherit', monospace;
  font-size: var(--font-size-sm);
  padding: 10px;
  user-select: text;
  .empty-content {
    text-align: center;
  }
}
</style>
