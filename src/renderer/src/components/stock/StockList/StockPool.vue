<template>
  <div class="stockPool-container">
    <div class="stock-item" v-for="item in stockList" :key="item.code">
      <div class="stock-left">
        <div class="stock-name">
          {{ item.name }}
        </div>
        <div class="stock-info">
          <div class="stock-market">
            {{ item.market }}
          </div>
          <div class="stock-code">{{ item.code }}</div>
        </div>
      </div>
      <div class="stock-center">
        <div class="stock-price">{{ item.price }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
const stockList = reactive([
  {
    id: 1, // 建议为每个数据项添加一个唯一ID，便于列表渲染（key）和操作
    name: '贵州茅台',
    market: 'SH', // 上海证券交易所
    code: '600519',
    price: '1650.50'
  },
  {
    id: 2,
    name: '腾讯控股',
    market: 'HK', // 香港交易所
    code: '00700',
    price: '380.20'
  },
  {
    id: 3,
    name: '宁德时代',
    market: 'SZ', // 深圳证券交易所
    code: '300750',
    price: '190.80'
  },
  {
    id: 4,
    name: '比亚迪',
    market: 'SZ',
    code: '002594',
    price: '210.50'
  },
  {
    id: 5,
    name: '药明康德',
    market: 'SH',
    code: '603259',
    price: '45.60'
  },
  {
    id: 6,
    name: '招商银行',
    market: 'SH',
    code: '600036',
    price: '30.15'
  },
  {
    id: 7,
    name: '中国平安',
    market: 'SH',
    code: '601318',
    price: '48.70'
  },
  {
    id: 8,
    name: '阿里巴巴',
    market: 'US', // 美股
    code: 'BABA',
    price: '85.32'
  },
  {
    id: 9,
    name: '苹果公司',
    market: 'US',
    code: 'AAPL',
    price: '170.88'
  },
  {
    id: 10,
    name: '特斯拉',
    market: 'US',
    code: 'TSLA',
    price: '195.05'
  }
])
</script>

<style scoped lang="scss">
.stockPool-container {
  border-right: 1px solid #eee;
}
</style>
