<template>
  <el-card class="control-panel">
    <template #header>
      <div class="card-header">
        <span>数据控制</span>
      </div>
    </template>
    <div class="controls">
      <div class="filter-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索提交信息、作者或ID"
          class="search-input"
          clearable
          :prefix-icon="Search"
        >
          <template #prepend>
            <el-select v-model="searchField" placeholder="搜索字段" style="width: 120px">
              <el-option label="全部字段" value="all" />
              <el-option label="提交消息" value="message" />
              <el-option label="作者" value="author" />
              <el-option label="提交ID" value="commitId" />
              <el-option label="邮箱" value="email" />
            </el-select>
          </template>
        </el-input>

        <div class="advanced-filters">
          <div class="filter-label">高级筛选：</div>
          <el-tag
            v-if="filters.author"
            closable
            @close="$emit('removeFilter', 'author')"
            class="filter-tag"
            type="primary"
          >
            作者: {{ filters.author }}
          </el-tag>
          <el-tag
            v-if="filters.dateRange"
            closable
            @close="$emit('removeFilter', 'dateRange')"
            class="filter-tag"
            type="success"
          >
            日期: {{ formatDateRange(filters.dateRange) }}
          </el-tag>
          <el-tag
            v-if="filters.repository"
            closable
            @close="$emit('removeFilter', 'repository')"
            class="filter-tag"
            type="warning"
          >
            仓库: {{ filters.repository }}
          </el-tag>
          <el-button v-if="hasFilters" size="small" type="info" @click="$emit('clearAllFilters')">
            清除全部
          </el-button>
        </div>
      </div>

      <div class="action-section">
        <div class="count-info">总数: {{ filteredDataLength }} 条提交记录</div>
        <div class="button-group">
          <el-button type="primary" @click="$emit('exportData')" :disabled="filteredDataLength === 0">
            <el-icon><Download /></el-icon> 导出数据
          </el-button>
          <el-tooltip content="使用统计" placement="top">
            <el-button @click="$emit('goToResults')" :disabled="filteredDataLength === 0">
              <el-icon><DataAnalysis /></el-icon>
            </el-button>
          </el-tooltip>
          <el-dropdown @command="$emit('handleCommand', $event)">
            <el-button>
              <el-icon><Setting /></el-icon>
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item command="toggleColumns">选择列</el-dropdown-item>
                <el-dropdown-item command="exportCSV">导出为CSV</el-dropdown-item>
                <el-dropdown-item command="exportExcel">导出为Excel</el-dropdown-item>
                <el-dropdown-item command="refresh">刷新数据</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Search, Download, DataAnalysis, Setting, ArrowDown } from '@element-plus/icons-vue';

const props = defineProps({
  searchQuery: { type: String, required: true },
  searchField: { type: String, required: true },
  filters: { type: Object, required: true },
  hasFilters: { type: Boolean, required: true },
  filteredDataLength: { type: Number, required: true },
  formatDateRange: { type: Function, required: true }
});

const emit = defineEmits([
  'update:searchQuery',
  'update:searchField',
  'removeFilter',
  'clearAllFilters',
  'exportData',
  'goToResults',
  'handleCommand'
]);

const searchQuery = ref(props.searchQuery);
const searchField = ref(props.searchField);

watch(searchQuery, (newVal) => emit('update:searchQuery', newVal));
watch(searchField, (newVal) => emit('update:searchField', newVal));
</script>

<style scoped>
.control-panel {
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.control-panel:hover {
  box-shadow: var(--shadow-md);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.search-input :deep(.el-input-group__prepend) {
  background-color: #f8f9fa;
}

.advanced-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 32px;
  background-color: #f8f9fa;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
}

.filter-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-right: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
}

.filter-tag {
  cursor: pointer;
  transition: var(--transition-bounce);
  position: relative;
}

.filter-tag:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-sm);
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-top: var(--border);
  margin-top: var(--spacing-sm);
}

.count-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background-color: #f8f9fa;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  font-weight: var(--font-weight-medium);
}

.button-group {
  display: flex;
  gap: var(--spacing-sm);
}
</style>
