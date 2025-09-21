<template>
  <div class="stock-container">
    <a-tabs v-model:activeKey="paneKey" centered>
      <a-tab-pane :key="item.key" :tab="item.label" v-for="item in stockTabs">
        <component :is="item.component"></component>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, markRaw } from 'vue'
import StockList from '@components/stock/StockList/index.vue'
import MarketQuotation from '@components/stock/MarketQuotation/index.vue'
import MarketNewsflash from '@components/stock/MarketNewsflash/index.vue'
const paneKey = ref('marketQuotation')

const stockTabs = reactive([
  {
    key: 'marketNewsflash',
    label: '市场快讯',
    component: markRaw(MarketNewsflash)
  },
  {
    key: 'marketQuotation',
    label: '市场行情',
    component: markRaw(MarketQuotation)
  },
  {
    key: 'stockList',
    label: '自选股票',
    component: markRaw(StockList)
  }
])
</script>

<style scoped lang="scss">
.stock-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  // background-color: var(--color-background);
  :deep(.ant-tabs) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :deep(.ant-tabs-content) {
    height: 100%;
  }
}
</style>
