<template>
  <div class="dragon-tiger-list-container">
    <h3 class="title">龙虎榜</h3>
    <a-table :columns="columns" :data-source="data" :pagination="false" size="small">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'netBuy'">
          <span :class="{ 'is-up': record.netBuy > 0, 'is-down': record.netBuy < 0 }">
            {{ (record.netBuy / 10000).toFixed(2) }} 万
          </span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Table as ATable } from 'ant-design-vue'

const columns = reactive([
  {
    title: '股票名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '代码',
    dataIndex: 'code',
    key: 'code'
  },
  {
    title: '解读',
    dataIndex: 'interpretation',
    key: 'interpretation'
  },
  {
    title: '净买入额',
    dataIndex: 'netBuy',
    key: 'netBuy',
    align: 'right'
  }
])

const data = reactive([
  {
    key: '1',
    name: '赛力斯',
    code: '601127',
    interpretation: '三日榜',
    netBuy: 120340000
  },
  {
    key: '2',
    name: '中芯国际',
    code: '688981',
    interpretation: '机构买入',
    netBuy: -58760000
  },
  {
    key: '3',
    name: '立讯精密',
    code: '002475',
    interpretation: '北向买入',
    netBuy: 23450000
  },
  {
    key: '4',
    name: '天孚通信',
    code: '300394',
    interpretation: '游资接力',
    netBuy: 88900000
  },
  {
    key: '5',
    name: '药明康德',
    code: '603259',
    interpretation: '机构卖出',
    netBuy: -150000000
  }
])
</script>

<style scoped lang="scss">
.dragon-tiger-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.is-up {
  color: #ff4d4f;
}

.is-down {
  color: #52c41a;
}
</style>