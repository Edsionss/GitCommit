<template>
  <a-card class="control-panel" :bordered="false">
    <div class="controls">
      <div class="filter-section">
        <a-input-group compact class="search-input">
          <a-select :value="searchField" style="width: 120px" @change="updateSearchField">
            <a-select-option value="all">全部字段</a-select-option>
            <a-select-option value="message">提交消息</a-select-option>
            <a-select-option value="author">作者</a-select-option>
            <a-select-option value="commitId">提交ID</a-select-option>
            <a-select-option value="email">邮箱</a-select-option>
          </a-select>
          <a-input
            :value="searchQuery"
            placeholder="搜索提交信息、作者或ID"
            allow-clear
            @change="updateSearchQuery"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-input-group>

        <div class="advanced-filters" v-if="hasFilters">
          <span class="filter-label">高级筛选:</span>
          <a-tag
            v-if="filters.author"
            closable
            @close="$emit('removeFilter', 'author')"
            class="filter-tag"
            color="blue"
          >
            作者: {{ filters.author }}
          </a-tag>
          <a-tag
            v-if="filters.dateRange"
            closable
            @close="$emit('removeFilter', 'dateRange')"
            class="filter-tag"
            color="green"
          >
            日期: {{ formatDateRange(filters.dateRange) }}
          </a-tag>
          <a-tag
            v-if="filters.repository"
            closable
            @close="$emit('removeFilter', 'repository')"
            class="filter-tag"
            color="orange"
          >
            仓库: {{ filters.repository }}
          </a-tag>
          <a-button size="small" type="link" @click="$emit('clearAllFilters')">
            清除全部
          </a-button>
        </div>
      </div>

      <div class="action-section">
        <div class="count-info">总数: {{ filteredDataLength }} 条提交记录</div>
        <div class="button-group">
          <a-button
            type="primary"
            @click="$emit('exportData')"
            :disabled="filteredDataLength === 0"
          >
            <template #icon><DownloadOutlined /></template> 导出数据
          </a-button>
          <a-tooltip title="使用统计">
            <a-button @click="$emit('goToResults')" :disabled="filteredDataLength === 0">
              <template #icon><BarChartOutlined /></template>
            </a-button>
          </a-tooltip>
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleMenuClick">
                <a-menu-item key="settings">设置</a-menu-item>
                <a-menu-item key="toggleColumns">选择列</a-menu-item>
                <a-menu-item key="exportCSV">导出为CSV</a-menu-item>
                <a-menu-item key="exportExcel">导出为Excel</a-menu-item>
                <a-menu-item key="refresh">刷新数据</a-menu-item>
              </a-menu>
            </template>
            <a-button>
              <SettingOutlined />
              <DownOutlined />
            </a-button>
          </a-dropdown>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import {
  SearchOutlined,
  DownloadOutlined,
  BarChartOutlined,
  SettingOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  searchQuery: { type: String, required: true },
  searchField: { type: String, required: true },
  filters: { type: Object, required: true },
  hasFilters: { type: Boolean, required: true },
  filteredDataLength: { type: Number, required: true },
  formatDateRange: { type: Function, required: true }
})

const emit = defineEmits([
  'update:searchQuery',
  'update:searchField',
  'removeFilter',
  'clearAllFilters',
  'exportData',
  'goToResults',
  'handleCommand'
])

const updateSearchQuery = (e: Event) => {
  emit('update:searchQuery', (e.target as HTMLInputElement).value)
}

const updateSearchField = (value: string) => {
  emit('update:searchField', value)
}

const handleMenuClick = ({ key }: { key: string }) => {
  emit('handleCommand', key)
}
</script>

<style scoped>
.control-panel {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.control-panel :deep(.ant-card-body) {
  padding: var(--spacing-md);
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
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
}

.count-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.button-group {
  display: flex;
  gap: var(--spacing-sm);
}
</style>