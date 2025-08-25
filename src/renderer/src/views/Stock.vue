
<template>
  <div class="stock-view">
    <a-layout style="height: 100%">
      <!-- 顶部工具栏 -->
      <a-layout-header class="toolbar">
        <a-button type="primary" @click="showAddStockWizard">添加自选</a-button>
      </a-layout-header>

      <!-- 主体内容 -->
      <a-layout>
        <!-- 左侧自选列表 -->
        <a-layout-sider width="25%" class="watchlist-panel">
          <Watchlist @stock-selected="handleStockSelected" />
        </a-layout-sider>

        <!-- 右侧详情 -->
        <a-layout-content class="stock-detail-panel">
          <div v-if="!activeStockCode" class="empty-state">
            <p>请从左侧选择一支股票查看详情</p>
          </div>
          <StockDetail v-else :stock-data="activeStockData" />
        </a-layout-content>
      </a-layout>
    </a-layout>

    <!-- 添加自选步骤条 -->
    <AddStockWizard v-model:visible="isWizardVisible" @finish="onWizardFinish" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStockStore } from '@/stores/stock'
import Watchlist from '@/components/stock/Watchlist.vue'
import StockDetail from '@/components/stock/StockDetail.vue'
import AddStockWizard from '@/components/stock/AddStockWizard.vue'
import { Button as AButton, Layout as ALayout } from 'ant-design-vue'

const stockStore = useStockStore()
const { activeStockCode, watchlist } = storeToRefs(stockStore)

const isWizardVisible = ref(false)

// 获取当前选中股票的完整数据
const activeStockData = computed(() => {
  if (activeStockCode.value) {
    return watchlist.value.get(activeStockCode.value)
  }
  return null
})

const showAddStockWizard = () => {
  isWizardVisible.value = true
}

const onWizardFinish = () => {
  // 可以选择性地刷新列表或执行其他操作
  console.log('Wizard finished')
}

// 处理从Watchlist组件传来的事件
const handleStockSelected = (stockCode: string) => {
  stockStore.setActiveStock(stockCode)
}
</script>

<style scoped lang="scss">
.stock-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.toolbar {
  background-color: #fff;
  padding: 10px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.watchlist-panel {
  background: #fdfdfd;
  border-right: 1px solid #f0f0f0;
  padding: 10px;
  overflow-y: auto;
}

.stock-detail-panel {
  padding: 20px;
  background: #fff;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
}
</style>

