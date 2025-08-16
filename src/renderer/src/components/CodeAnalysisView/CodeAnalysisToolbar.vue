<template>
  <div class="code-analysis-header">
    <h2 class="page-title">代码分析</h2>
    <div class="code-analysis-actions">
      <a-select v-model:value="internalSelectedRepo" placeholder="选择仓库" class="filter-item" show-search>
        <a-select-option v-for="repo in repositories" :key="repo.id" :value="repo.id">{{
          repo.name
        }}</a-select-option>
      </a-select>
      <a-button type="primary" @click="$emit('analyze')">
        <template #icon><BarChartOutlined /></template>
        分析代码
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { BarChartOutlined } from '@ant-design/icons-vue'
import type { PropType } from 'vue'

interface Repository {
  id: number;
  name: string;
}

const props = defineProps({
  repositories: { type: Array as PropType<Repository[]>, required: true },
  modelValue: { type: [String, Number], required: true }
})

const emit = defineEmits(['update:modelValue', 'analyze'])

const internalSelectedRepo = ref(props.modelValue)

watch(internalSelectedRepo, (newVal) => {
  emit('update:modelValue', newVal)
})

watch(() => props.modelValue, (newVal) => {
  internalSelectedRepo.value = newVal
})
</script>

<style scoped>
.code-analysis-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.code-analysis-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 180px;
}

.mr-5 {
  margin-right: 5px;
}
</style>
