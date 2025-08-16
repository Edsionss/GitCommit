<template>
  <div class="toolbar">
    <div class="repo-selector">
      <a-select
        v-model:value="filters.repo"
        placeholder="选择仓库"
        show-search
        :filter-option="filterOption"
      >
        <a-select-option v-for="repo in repositories" :key="repo.id" :value="repo.id">{{
          repo.name
        }}</a-select-option>
      </a-select>
    </div>

    <div class="filters">
      <a-range-picker
        v-model:value="filters.dateRange"
        :ranges="dateRanges"
        value-format="YYYY-MM-DD"
        format="YYYY-MM-DD"
        :placeholder="['开始日期', '结束日期']"
      />

      <a-select
        v-model:value="filters.branch"
        placeholder="分支"
        show-search
        :filter-option="filterOption"
      >
        <a-select-option v-for="branch in branches" :key="branch" :value="branch">{{
          branch
        }}</a-select-option>
      </a-select>

      <a-select
        v-model:value="filters.author"
        placeholder="作者"
        show-search
        :filter-option="filterOption"
        mode="tags"
      >
        <a-select-option v-for="author in authors" :key="author" :value="author">{{
          author
        }}</a-select-option>
      </a-select>

      <a-input
        v-model:value="filters.keyword"
        placeholder="搜索提交信息"
        allow-clear
        class="search-input"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </a-input>
    </div>

    <div class="actions">
      <a-button type="primary" @click="$emit('refresh')">
        <template #icon><ReloadOutlined /></template>
        刷新
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { PropType } from 'vue'

interface Repository {
  id: number;
  name: string;
}

interface Filters {
  repo: number | string;
  dateRange: [string, string] | null;
  branch: string;
  author: string[];
  keyword: string;
}

const props = defineProps({
  repositories: { type: Array as PropType<Repository[]>, required: true },
  branches: { type: Array as PropType<string[]>, required: true },
  authors: { type: Array as PropType<string[]>, required: true },
  modelValue: { type: Object as PropType<Filters>, required: true }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const filters = ref(props.modelValue)

watch(
  filters,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true }
)

const dateRanges = {
  '最近一周': [dayjs().subtract(1, 'week'), dayjs()],
  '最近一个月': [dayjs().subtract(1, 'month'), dayjs()],
  '最近三个月': [dayjs().subtract(3, 'month'), dayjs()]
}

const filterOption = (input: string, option: any) => {
  return option.children[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}
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
