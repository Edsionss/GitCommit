<template>
  <div class="watchList-container">
    <a-list item-layout="horizontal" :data-source="stockList" :loading="loading">
      <template #renderItem="{ item }">
        <a-list-item
          :class="{ active: item.code === activeStockCode }"
          @click="selectStock(item.code)"
          @contextmenu.prevent="onContextMenu($event, item.code)"
        >
          <a-list-item-meta>
            <template #title>{{ item.name }}</template>
            <template #description>{{ item.code }}</template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useStockStore } from '@/stores/stock'
import { List as AList } from 'ant-design-vue'
import { ContextMenu } from '@imengyu/vue3-context-menu'

const emit = defineEmits(['stock-selected', 'run-ai-analysis'])

const stockStore = useStockStore()
const { watchList, activeStockCode } = storeToRefs(stockStore)

const loading = ref(false) // 可用于控制加载状态

const stockList = computed(() => Array.from(watchList.value.values()))

const selectStock = (stockCode: string) => {
  stockStore.setActiveStock(stockCode)
  emit('stock-selected', stockCode)
}

const onContextMenu = (event: MouseEvent, stockCode: string) => {
  ContextMenu.show({
    x: event.x,
    y: event.y,
    items: [
      {
        label: '删除自选',
        onClick: () => {
          stockStore.removeStock(stockCode)
        }
      },
      {
        label: '更新数据',
        onClick: async () => {
          loading.value = true
          await stockStore.fetchLatestData(stockCode)
          loading.value = false
        }
      },
      {
        label: 'AI 智能分析',
        onClick: () => {
          // 触发事件，通知父组件处理
          emit('run-ai-analysis', stockCode)
        }
      }
    ]
  })
}
</script>

<style scoped lang="scss">
.watchList-container {
  height: 100%;
}

.ant-list-item {
  cursor: pointer;
  padding: 12px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f0f2f5;
  }

  &.active {
    background-color: #e6f7ff;
    border-right: 3px solid #1890ff;
  }
}
</style>
