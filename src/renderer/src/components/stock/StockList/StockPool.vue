<template>
  <div class="stock-pool-wrapper">
    <div class="toolbar">
      <a-input-search placeholder="搜索股票..." style="width: 100%" />
      <a-button type="primary">
        <template #icon><PlusOutlined /></template>
      </a-button>
    </div>
    <div class="stockPool-container">
      <div
        class="stock-item"
        v-for="item in stockList"
        :key="item.code"
        @click="handleStockClick(item)"
        :class="{ active: selectedStock?.code === item.code }"
      >
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
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { InputSearch as AInputSearch, Button as AButton } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'

const emit = defineEmits(['stock-selected'])

const stockList = reactive([
  {
    id: 1,
    name: '贵州茅台',
    market: 'SH',
    code: '600519',
    price: '1650.50'
  },
  {
    id: 2,
    name: '腾讯控股',
    market: 'HK',
    code: '00700',
    price: '380.20'
  },
  {
    id: 3,
    name: '宁德时代',
    market: 'SZ',
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
    market: 'US',
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

const selectedStock = ref(null)

const handleStockClick = (stock) => {
  selectedStock.value = stock
  emit('stock-selected', stock)
}
</script>

<style scoped lang="scss">
.stock-pool-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px dashed#eee;
}

.toolbar {
  display: flex;
  padding: 10px;
  gap: 10px;
  border-bottom: 1px dashed#eee;
}

.stockPool-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  color: #333;
}

.stock-item {
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 0.5rem;

  &:hover {
    background-color: var(--primary-bg-hover);
    color: var(--primary-color) !important;
  }

  &.active {
    background-color: var(--primary-bg-hover);
    color: var(--primary-color) !important;
  }
}

.stock-left {
  display: flex;
  flex-direction: column;
}

.stock-name {
  font-size: 14px;
  font-weight: 500;
}

.stock-info {
  display: flex;
  align-items: center;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.stock-market {
  margin-right: 5px;
  padding: 2px 4px;
  border-radius: 3px;
  background-color: #f0f0f0;
  font-size: 10px;
}

.stock-center {
  .stock-price {
    font-size: 16px;
    font-weight: bold;
    color: #ff4d4f; // 红色表示价格，可以根据涨跌情况动态改变颜色
  }
}
</style>
