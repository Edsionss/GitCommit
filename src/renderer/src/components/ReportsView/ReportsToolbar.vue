<template>
  <div class="reports-header">
    <div class="filter-container">
      <el-select v-model="selectedRepo" placeholder="选择仓库" class="filter-item">
        <el-option
          v-for="repo in repositories"
          :key="repo.id"
          :label="repo.name"
          :value="repo.id"
        />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="filter-item"
      />
      <el-button type="primary" @click="$emit('generatePreview')">
        <el-icon class="mr-5"><RefreshRight /></el-icon>
        生成预览
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { RefreshRight } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const props = defineProps({
  repositories: { type: Array, required: true },
  selectedRepo: { type: [String, Number], required: true },
  dateRange: { type: Array, required: true }
});

const emit = defineEmits(['update:selectedRepo', 'update:dateRange', 'generatePreview']);

const selectedRepo = ref(props.selectedRepo);
const dateRange = ref(props.dateRange);

watch(selectedRepo, (newVal) => {
  emit('update:selectedRepo', newVal);
});

watch(dateRange, (newVal) => {
  emit('update:dateRange', newVal);
});
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

.mr-5 {
  margin-right: 5px;
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
