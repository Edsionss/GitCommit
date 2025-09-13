<template>
  <div class="market-quotation-container">
    <Tabs v-model="activeTab" :tabs="tabItems">
      <template #default="{ activeTab }">
        <IndustrySector v-show="activeTab === 'industry-sector'" />
        <DragonTigerList v-show="activeTab === 'dragon-tiger-list'" />
        <CapitalFlow v-show="activeTab === 'capital-flow'" />
        <GlobalMarkets v-show="activeTab === 'global-markets'" />
        <HotStocks v-show="activeTab === 'hot-stocks'" />
      </template>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Tabs from '@components/common/Tabs.vue'
import IndustrySector from './IndustrySector.vue'
import DragonTigerList from './DragonTigerList.vue'
import CapitalFlow from './CapitalFlow.vue'
import GlobalMarkets from './GlobalMarkets.vue'
import HotStocks from './HotStocks.vue'

const activeTab = ref('industry-sector') // 默认选中第一个tab

const tabItems = ref([
  { key: 'industry-sector', title: '行业板块' },
  { key: 'dragon-tiger-list', title: '龙虎榜' },
  { key: 'capital-flow', title: '资金流向' },
  { key: 'global-markets', title: '全球股市' },
  { key: 'hot-stocks', title: '热门股票' }
])
</script>

<style scoped lang="scss">
.market-quotation-container {
  height: 100%;
  width: 100%;
}
</style>
