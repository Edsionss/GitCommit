<template>
  <div class="branches-header">
    <h2 class="page-title">分支管理</h2>
    <div class="branches-actions">
      <el-select v-model="selectedRepo" placeholder="选择仓库" class="filter-item">
        <el-option
          v-for="repo in repositories"
          :key="repo.id"
          :label="repo.name"
          :value="repo.id"
        />
      </el-select>
      <el-button type="primary" @click="$emit('refresh')">
        <el-icon class="mr-5"><RefreshRight /></el-icon>
        刷新分支
      </el-button>
      <el-button type="success" @click="$emit('create')">
        <el-icon class="mr-5"><Plus /></el-icon>
        新建分支
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { RefreshRight, Plus } from '@element-plus/icons-vue';

const props = defineProps({
  repositories: { type: Array, required: true },
  modelValue: { type: [String, Number], required: true }
});

const emit = defineEmits(['update:modelValue', 'refresh', 'create']);

const selectedRepo = ref(props.modelValue);

watch(selectedRepo, (newVal) => {
  emit('update:modelValue', newVal);
});
</script>

<style scoped>
.branches-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--color-text);
  font-weight: 600;
}

.branches-actions {
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

@media (max-width: 768px) {
  .branches-actions {
    flex-direction: column;
  }

  .filter-item {
    width: 100%;
  }
}
</style>
