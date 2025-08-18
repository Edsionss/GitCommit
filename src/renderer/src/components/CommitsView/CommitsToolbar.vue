<template>
  <a-card>
    <div class="toolbar">
      <div class="main-filters">
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
        <div class="other-filters">
          <a-range-picker
            v-model:value="filters.dateRange"
            :presets="rangePresets"
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
        </div>
      </div>
      <div class="search-group">
        <a-input
          v-model:value="filters.keyword"
          placeholder="搜索提交信息"
          allow-clear
          class="search-input"
          @press-enter="$emit('refresh')"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <div class="search">
          <a-button type="primary" @click="$emit('refresh')">
            <template #icon><ReloadOutlined /></template>
            搜索
          </a-button>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { PropType } from 'vue'

interface Repository {
  id: number
  name: string
}

interface Filters {
  repo: number | string
  dateRange: [string, string] | null
  branch: string
  author: string[]
  keyword: string
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

const rangePresets = [
  { label: '最近一周', value: [dayjs().subtract(1, 'week'), dayjs()] },
  { label: '最近一个月', value: [dayjs().subtract(1, 'month'), dayjs()] },
  { label: '最近三个月', value: [dayjs().subtract(3, 'month'), dayjs()] }
]

const filterOption = (input: string, option: any) => {
  return option.children[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}
</script>

<style scoped>
.toolbar {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.main-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.repo-selector {
  min-width: 200px;
}

.other-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
  align-items: center;
}

.other-filters > :deep(.ant-select),
.other-filters > :deep(.ant-picker-range) {
  flex: 1;
  min-width: 180px;
}

.search-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  flex: 1;
}
</style>
