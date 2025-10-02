<template>
  <a-modal
    title="添加自选股票"
    :open="visible"
    @cancel="handleCancel"
    @ok="handleOk"
    class="add-stock-modal"
  >
    <div class="search-container">
      <a-input-search
        v-model:value="searchQuery"
        placeholder="输入股票名称或代码"
        enter-button="搜索"
        @search="onSearch"
        :loading="searching"
        class="search-input"
      />
      <a-list class="search-results" :data-source="searchResults" v-if="searchResults.length > 0">
        <template #renderItem="{ item }">
          <a-list-item
            @click="selectStock(item)"
            :class="{ active: item.code === selectedStock?.code }"
            class="stock-item"
          >
            <div class="stock-info">
              <div class="stock-name">{{ item.name }}</div>
              <div class="stock-code">{{ item.code }}</div>
              <div class="stock-market">{{ item.market }}</div>
            </div>
          </a-list-item>
        </template>
      </a-list>
      <div v-else-if="searchQuery && !searching" class="no-results">
        <span class="no-results-text">未找到相关股票</span>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { stockApi } from '@api/stock'
import { reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'

const visible = defineModel({})

const searchQuery = ref('')
const searching = ref(false)
const searchResults = ref<any[]>([])
const selectedStock = ref<any | null>(null)

const onSearch = async () => {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }
  searching.value = true
  searchResults.value = await stockApi.searchStokes(searchQuery.value)

  searching.value = false
}

const selectStock = (stock: any) => {
  selectedStock.value = stock
}

const handleOk = () => {
  if (selectedStock.value) {
    visible.value = false
  } else {
    message.warning('请先选择一支股票')
  }
}

const handleCancel = () => {
  visible.value = false
}

const resetModal = () => {
  searchQuery.value = ''
  searchResults.value = []
  selectedStock.value = null
}

watch(visible, () => {
  resetModal()
})
</script>

<style scoped lang="scss">
.add-stock-modal {
  .search-container {
    padding: 8px 0;
  }

  .search-input {
    margin-bottom: 16px;
  }

  .search-results {
    margin-top: 0;
    max-height: 320px;
    overflow-y: auto;
    border: 1px solid var(--border-secondary);
    border-radius: 6px;
    background-color: var(--bg-container);
  }

  .stock-item {
    cursor: pointer;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-secondary);
    transition: all 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: var(--bg-hover);
      transform: translateY(-1px);
    }

    &.active {
      background-color: var(--brand-primary-bg);
      border-left: 3px solid var(--brand-primary);

      .stock-name {
        color: var(--brand-primary);
        font-weight: var(--font-weight-medium);
      }
    }
  }

  .stock-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .stock-name {
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    font-size: var(--font-size-base);
    flex: 1;
  }

  .stock-code {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    font-family: 'Courier New', monospace;
    background-color: var(--bg-layout);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .stock-price {
    color: var(--text-primary);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-sm);
    min-width: 80px;
    text-align: right;
  }

  .no-results {
    text-align: center;
    padding: 24px 16px;
    color: var(--text-secondary);
    background-color: var(--bg-container);
    border: 1px solid var(--border-secondary);
    border-radius: 6px;
    margin-top: 16px;
  }

  .no-results-text {
    font-size: var(--font-size-sm);
  }

  // 自定义滚动条样式
  .search-results::-webkit-scrollbar {
    width: 6px;
  }

  .search-results::-webkit-scrollbar-track {
    background: var(--bg-layout);
    border-radius: 3px;
  }

  .search-results::-webkit-scrollbar-thumb {
    background: var(--border-secondary);
    border-radius: 3px;

    &:hover {
      background: var(--border-primary);
    }
  }

  // 暗色模式下的特殊处理
  [data-theme='dark'] & {
    .stock-item {
      &.active {
        background-color: rgba(var(--brand-primary-rgb), 0.15);
      }
    }

    .stock-code {
      background-color: rgba(var(--text-secondary-rgb), 0.1);
    }
  }
}
</style>
