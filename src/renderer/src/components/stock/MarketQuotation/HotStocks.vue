<template>
  <div class="hot-stocks-container">
    <h3 class="title">热门股票榜</h3>
    <a-tabs v-model:activeKey="activeKey" size="small">
      <a-tab-pane key="turnover" tab="成交额榜">
        <a-table :columns="columns" :data-source="turnoverData" :pagination="false" size="small" />
      </a-tab-pane>
      <a-tab-pane key="gainers" tab="涨幅榜">
        <a-table :columns="columns" :data-source="gainerData" :pagination="false" size="small" />
      </a-tab-pane>
      <a-tab-pane key="decliners" tab="跌幅榜">
        <a-table :columns="columns" :data-source="declineData" :pagination="false" size="small" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Tabs as ATabs, TabPane as ATabPane, Table as ATable } from 'ant-design-vue'

const activeKey = ref('turnover')

const columns = reactive([
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '最新价', dataIndex: 'price', key: 'price', align: 'right' },
  { title: '涨跌幅', dataIndex: 'changePercent', key: 'changePercent', align: 'right' }
])

const turnoverData = reactive([
  { key: '1', name: '赛力斯', price: '95.00', changePercent: '5.5%' },
  { key: '2', name: '贵州茅台', price: '1650.50', changePercent: '3.1%' },
  { key: '3', name: '中芯国际', price: '55.20', changePercent: '-1.2%' }
])

const gainerData = reactive([
  { key: '1', name: '某某科技', price: '12.50', changePercent: '10.01%' },
  { key: '2', name: '某某股份', price: '8.80', changePercent: '9.98%' },
  { key: '3', name: '某某能源', price: '22.30', changePercent: '9.95%' }
])

const declineData = reactive([
  { key: '1', name: '某某材料', price: '30.10', changePercent: '-10.00%' },
  { key: '2', name: '某某集团', price: '15.40', changePercent: '-9.97%' },
  { key: '3', name: '某某药业', price: '45.60', changePercent: '-9.95%' }
])
</script>

<style scoped lang="scss">
.hot-stocks-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
</style>