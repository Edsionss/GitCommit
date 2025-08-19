<template>
  <a-card class="toolbar-card">
    <div class="toolbar-content">
      <div class="filter-item">
        <span class="filter-label">扫描仓库:</span>
        <a-select
          :value="selectedRepo"
          @update:value="$emit('update:selectedRepo', $event)"
          placeholder="选择仓库"
          style="width: 200px"
        >
          <a-select-option v-for="repo in repositories" :key="repo.id" :value="repo.id">
            {{ repo.name }}
          </a-select-option>
        </a-select>
      </div>

      <div class="filter-item">
        <span class="filter-label">扫描时间:</span>
        <a-range-picker
          :value="dateRange"
          @update:value="$emit('update:dateRange', $event)"
          :placeholder="['开始日期', '结束日期']"
          style="width: 240px"
        />
      </div>

            <a-button type="primary" @click="$emit('filter')">
        <template #icon><SearchOutlined /></template>
        查询
      </a-button>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { Dayjs } from 'dayjs'

interface Repository {
  id: string
  name: string
}

defineProps({
  repositories: { type: Array as PropType<Repository[]>, required: true },
  selectedRepo: { type: String, required: true },
  dateRange: { type: Array as PropType<[Dayjs, Dayjs] | null>, default: null },
})

defineEmits(['update:selectedRepo', 'update:dateRange', 'filter'])
</script>

<style scoped>
.toolbar-card {
  margin-bottom: var(--spacing-md);
}

.toolbar-content {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filter-label {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}
</style>
