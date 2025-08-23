<template>
  <div class="reports-header">
    <div class="filter-container">
      <a-select
        :value="selectedRepo"
        @change="(value) => $emit('update:selectedRepo', value)"
        placeholder="选择仓库"
        class="filter-item"
      >
        <a-select-option v-for="repo in repositories" :key="repo.id" :value="repo.id">
          {{ repo.name }}
        </a-select-option>
      </a-select>
      <a-range-picker
        :value="dateRange"
        @change="(dates) => $emit('update:dateRange', dates)"
        class="filter-item"
      />
      <a-button type="primary" @click="$emit('generatePreview')">
        <template #icon><SyncOutlined /></template>
        生成预览
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { SyncOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const props = defineProps({
  repositories: { type: Array, required: true },
  selectedRepo: { type: [String, Number], required: true },
  dateRange: { type: Array, required: true }
})

const emit = defineEmits(['update:selectedRepo', 'update:dateRange', 'generatePreview'])

// Ant Design's RangePicker works directly with v-model or :value/@change,
// so local refs and watchers are not strictly necessary if the parent handles the state.
</script>

<style scoped>
.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 180px;
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    width: 100%;
  }
}
</style>
