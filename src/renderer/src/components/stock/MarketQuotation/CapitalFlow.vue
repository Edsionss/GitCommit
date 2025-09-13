<template>
  <div class="capital-flow-container">
    <!-- 大盘信息 -->
    <div class="summary-cards">
      <a-card size="small" class="market-card">
        <a-statistic
          title="大盘净流入"
          :value="marketInfo.netInflow"
          :value-style="getTextColor(marketInfo.netInflow)"
          :precision="2"
          suffix="亿"
        />
      </a-card>
      <a-card size="small" class="market-card">
        <a-statistic
          title="三市成交额"
          :value="marketInfo.totalTurnover"
          :precision="2"
          suffix="亿"
        />
      </a-card>
    </div>

    <!-- 个股资金流向列表 -->
    <div class="stock-list">
      <div
        v-for="stock in stocks"
        :key="stock.code"
        class="stock-list-item"
        :style="getCardBackgroundByChange(stock.changePercent)"
      >
        <div class="stock-info">
          <div class="stock-name">{{ stock.name }}</div>
          <div class="stock-code">{{ stock.market }}: {{ stock.code }}</div>
        </div>

        <div class="stock-stat">
          <span class="value" :class="getTextClass(stock.netInflow)">
            {{ formatCurrency(stock.netInflow) }}
          </span>
          <span class="label">净流入</span>
        </div>

        <div class="stock-stat">
          <span class="value">{{ stock.price.toFixed(2) }}</span>
          <span class="label">当前价格</span>
        </div>

        <div class="stock-stat">
          <span class="value" :class="getTextClass(stock.changePercent)">
            {{ stock.changePercent.toFixed(2) }}%
          </span>
          <span class="label">涨幅</span>
        </div>

        <div class="stock-meta">
          <div class="meta-item">
            <span class="label">行业:</span>
            <span class="value">{{ stock.industry }}</span>
          </div>
          <div class="meta-item">
            <span class="label">概念:</span>
            <span class="value">{{ stock.concept }}</span>
          </div>
        </div>

        <div class="stock-actions">
          <a-button type="primary" size="small" ghost @click="showDetails(stock)"
            >详细信息</a-button
          >
        </div>
      </div>
    </div>

    <!-- 详细信息弹窗 -->
    <a-modal v-model:open="isModalVisible" :title="`${selectedStock?.name} - 详细信息`" footer="">
      <a-descriptions
        v-if="selectedStock"
        :column="2"
        bordered
        size="small"
        class="modal-descriptions"
      >
        <a-descriptions-item label="量比">{{ selectedStock.volumeRatio }}</a-descriptions-item>
        <a-descriptions-item label="市盈率(TTM)">{{ selectedStock.peRatio }}</a-descriptions-item>
        <a-descriptions-item label="流通市值">
          {{ formatCurrency(selectedStock.floatMarketCap) }}
        </a-descriptions-item>
        <a-descriptions-item label="总市值">
          {{ formatCurrency(selectedStock.totalMarketCap) }}
        </a-descriptions-item>
        <a-descriptions-item label="市净率">{{ selectedStock.pbRatio }}</a-descriptions-item>
        <a-descriptions-item label="5日涨幅">
          <span :class="getTextClass(selectedStock.change5d)">
            {{ selectedStock.change5d.toFixed(2) }}%
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="10日涨幅">
          <span :class="getTextClass(selectedStock.change10d)">
            {{ selectedStock.change10d.toFixed(2) }}%
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="5日净量">
          {{ formatCurrency(selectedStock.netVolume5d) }}
        </a-descriptions-item>
        <a-descriptions-item label="10日净量">
          {{ formatCurrency(selectedStock.netVolume10d) }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getCardBackgroundByChange } from '@/utils'

// --- 响应式状态 ---
const marketInfo = ref({
  netInflow: -150.2,
  totalTurnover: 8500.5
})

const stocks = ref([
  {
    name: '贵州茅台',
    market: 'SH',
    code: '600519',
    netInflow: 320450000,
    price: 1650.5,
    changePercent: 1.5,
    industry: '酿酒行业',
    concept: '白酒',
    volumeRatio: 1.2,
    peRatio: 35.5,
    floatMarketCap: 2000000000000,
    totalMarketCap: 2100000000000,
    pbRatio: 10.2,
    change5d: 3.2,
    change10d: -1.5,
    netVolume5d: 1200000000,
    netVolume10d: -500000000
  },
  {
    name: '宁德时代',
    market: 'SZ',
    code: '300750',
    netInflow: -210340000,
    price: 190.8,
    changePercent: -2.1,
    industry: '电池',
    concept: '新能源车',
    volumeRatio: 0.9,
    peRatio: 25.1,
    floatMarketCap: 800000000000,
    totalMarketCap: 880000000000,
    pbRatio: 5.8,
    change5d: -4.5,
    change10d: 2.1,
    netVolume5d: -800000000,
    netVolume10d: 300000000
  },
  {
    name: '比亚迪',
    market: 'SZ',
    code: '002594',
    netInflow: 89760000,
    price: 210.5,
    changePercent: 0.8,
    industry: '汽车整车',
    concept: '新能源车',
    volumeRatio: 1.5,
    peRatio: 30.2,
    floatMarketCap: 600000000000,
    totalMarketCap: 620000000000,
    pbRatio: 4.5,
    change5d: 5.1,
    change10d: 6.2,
    netVolume5d: 950000000,
    netVolume10d: 1500000000
  }
])

const isModalVisible = ref(false)
const selectedStock = ref<(typeof stocks.value)[0] | null>(null)

// --- 方法 ---
const showDetails = (stock) => {
  selectedStock.value = stock
  isModalVisible.value = true
}

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1e8) return `${(value / 1e8).toFixed(2)} 亿`
  if (Math.abs(value) >= 1e4) return `${(value / 1e4).toFixed(2)} 万`
  return value.toString()
}

const getTextColor = (value: number) => {
  if (value > 0) return { color: '#cf1322' }
  if (value < 0) return { color: '#389e0d' }
  return {}
}

const getTextClass = (value: number) => {
  if (value > 0) return 'is-up'
  if (value < 0) return 'is-down'
  return ''
}
</script>

<style scoped lang="scss">
.capital-flow-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.market-card {
  :deep(.ant-statistic-title) {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
  }
  :deep(.ant-statistic-content) {
    font-size: 24px;
    font-weight: 500;
  }
}

.stock-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stock-list-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  transition:
    box-shadow 0.3s,
    transform 0.3s,
    background-color 0.3s;
  background-color: #fff;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
}

.stock-info {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  .stock-name {
    font-size: 16px;
    font-weight: 500;
  }
  .stock-code {
    font-size: 12px;
    color: #888;
  }
}

.stock-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: right;
  .value {
    font-size: 16px;
    font-weight: 500;
  }
  .label {
    font-size: 12px;
    color: #888;
  }
}

.stock-meta {
  flex: 1.5;
  padding-left: 24px;
  font-size: 12px;
  .meta-item {
    display: flex;
    justify-content: space-between;
    .label {
      color: #888;
      margin-right: 8px;
    }
    .value {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.stock-actions {
  flex: 0 0 80px;
  text-align: right;
  padding-left: 16px;
}

.modal-descriptions {
  margin-top: 24px;
}

.is-up {
  color: #cf1322;
}
.is-down {
  color: #389e0d;
}
</style>
