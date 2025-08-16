<template>
  <div class="toolbar">
    <div class="repo-selector">
      <el-select v-model="filters.repo" placeholder="选择仓库" filterable>
        <el-option
          v-for="repo in repositories"
          :key="repo.id"
          :label="repo.name"
          :value="repo.id"
        />
      </el-select>
    </div>

    <div class="filters">
      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        :shortcuts="dateShortcuts"
      />

      <el-select v-model="filters.branch" placeholder="分支" filterable>
        <el-option v-for="branch in branches" :key="branch" :label="branch" :value="branch" />
      </el-select>

      <el-select v-model="filters.author" placeholder="作者" filterable allow-create>
        <el-option v-for="author in authors" :key="author" :label="author" :value="author" />
      </el-select>

      <el-input v-model="filters.keyword" placeholder="搜索提交信息" clearable class="search-input">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="actions">
      <el-button type="primary" @click="$emit('refresh')">
        <el-icon><RefreshRight /></el-icon>
        刷新
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Search, RefreshRight } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const props = defineProps({
  repositories: { type: Array, required: true },
  branches: { type: Array, required: true },
  authors: { type: Array, required: true },
  modelValue: { type: Object, required: true }
});

const emit = defineEmits(['update:modelValue', 'refresh']);

const filters = ref(props.modelValue);

watch(filters, (newVal) => {
  emit('update:modelValue', newVal);
}, { deep: true });

const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    }
  }
];
</script>

<style scoped>
.toolbar {
  background-color: var(--color-background-soft);
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.repo-selector {
  min-width: 200px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.search-input {
  min-width: 200px;
}
</style>
