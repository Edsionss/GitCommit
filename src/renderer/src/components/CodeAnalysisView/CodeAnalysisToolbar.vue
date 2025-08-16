<template>
  <div class="code-analysis-header">
    <h2 class="page-title">代码分析</h2>
    <div class="code-analysis-actions">
      <el-select v-model="selectedRepo" placeholder="选择仓库" class="filter-item">
        <el-option
          v-for="repo in repositories"
          :key="repo.id"
          :label="repo.name"
          :value="repo.id"
        />
      </el-select>
      <el-button type="primary" @click="$emit('analyze')">
        <el-icon class="mr-5"><DataAnalysis /></el-icon>
        分析代码
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { DataAnalysis } from '@element-plus/icons-vue';

const props = defineProps({
  repositories: { type: Array, required: true },
  modelValue: { type: [String, Number], required: true }
});

const emit = defineEmits(['update:modelValue', 'analyze']);

const selectedRepo = ref(props.modelValue);

watch(selectedRepo, (newVal) => {
  emit('update:modelValue', newVal);
});
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
