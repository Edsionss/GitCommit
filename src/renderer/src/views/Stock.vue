<template>
  <div class="stock-view">
    <a-layout style="height: 100%">
      <!-- 顶部工具栏 -->
      <a-layout-header class="toolbar">
        <a-button type="primary" @click="showAddStockModal">添加自选</a-button>
      </a-layout-header>

      <!-- 主体内容 -->
      <a-layout>
        <!-- 左侧自选列表 -->
        <a-layout-sider width="25%" class="watchList-panel">
          <WatchList @stock-selected="handleStockSelected" />
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

    <!-- 添加自选弹窗 -->
    <a-modal
      v-model:visible="isModalVisible"
      title="添加自选股"
      @ok="handleAddStock"
      @cancel="handleCancel"
    >
      <a-input v-model:value="newStockName" placeholder="请输入股票名称或代码" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStockStore } from '@/stores/stock'
import WatchList from '@renderer/components/stock/WatchList.vue'
import StockDetail from '@/components/stock/StockDetail.vue'
import {
  Modal as AModal,
  Input as AInput,
  Button as AButton,
  Layout as ALayout
} from 'ant-design-vue'

const stockStore = useStockStore()
const { activeStockCode, watchList } = storeToRefs(stockStore)

const isModalVisible = ref(false)
const newStockName = ref('')

// 获取当前选中股票的完整数据
const activeStockData = computed(() => {
  if (activeStockCode.value) {
    return watchList.value.get(activeStockCode.value)
  }
  return null
})

const showAddStockModal = () => {
  isModalVisible.value = true
}

const handleAddStock = async () => {
  if (newStockName.value.trim()) {
    await stockStore.addStock(newStockName.value.trim())
    newStockName.value = ''
    isModalVisible.value = false
  } else {
    AModal.warning({ title: '提示', content: '股票名称或代码不能为空' })
  }
}

const handleCancel = () => {
  isModalVisible.value = false
  newStockName.value = ''
}

// 处理从WatchList组件传来的事件
const handleStockSelected = (stockCode: string) => {
  stockStore.setActiveStock(stockCode)
}
</script>

<style scoped lang="scss">
.stock-view {
  // height: 100vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 0.54rem;
}

.toolbar {
  background-color: #fff;
  // padding: 10px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.watchList-panel {
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
