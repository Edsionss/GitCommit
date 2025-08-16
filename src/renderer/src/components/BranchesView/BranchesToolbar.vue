<template>
  <div class="branches-header">
    <h2 class="page-title">分支管理</h2>
    <div class="branches-actions">
      <a-select v-model:value="internalSelectedRepo" placeholder="选择仓库" class="filter-item" show-search>
        <a-select-option v-for="repo in repositories" :key="repo.id" :value="repo.id">{{
          repo.name
        }}</a-select-option>
      </a-select>
      <a-button type="primary" @click="$emit('refresh')">
        <template #icon><ReloadOutlined /></template>
        刷新分支
      </a-button>
      <a-button type="primary" @click="$emit('create')">
        <template #icon><PlusOutlined /></template>
        新建分支
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue'
import type { PropType } from 'vue'

interface Repository {
  id: number;
  name: string;
}

const props = defineProps({
  repositories: { type: Array as PropType<Repository[]>, required: true },
  selectedRepo: { type: [String, Number], required: true }
})

const emit = defineEmits(['update:selectedRepo', 'refresh', 'create'])

const internalSelectedRepo = ref(props.selectedRepo)

watch(internalSelectedRepo, (newVal) => {
  emit('update:selectedRepo', newVal)
})

watch(() => props.selectedRepo, (newVal) => {
  internalSelectedRepo.value = newVal
})
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
