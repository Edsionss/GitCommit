<template>
  <div class="dragon-tiger-list-container">
    <div class="list-view">
      <div v-for="stock in stocks" :key="stock.code" class="stock-item">
        <!-- Top Row -->
        <div class="top-row">
          <div class="stock-identity">
            <span class="stock-name">{{ stock.name }}</span>
            <span class="stock-code-market">
              <a-tag color="blue">{{ stock.market }}</a-tag>
              <span>{{ stock.code }}</span>
            </span>
          </div>

          <div class="price-summary">
            <div class="current-price-group">
              <span class="value price" :class="getPriceClass(stock.changePercent)">{{
                stock.closePrice.toFixed(2)
              }}</span>
              <span class="value percent" :class="getPriceClass(stock.changePercent)"
                >{{ stock.changePercent.toFixed(2) }}%</span
              >
            </div>
            <div class="opening-price-group">
              <span class="label">开</span>
              <span class="value opening-price">{{ stock.openingPrice.toFixed(2) }}</span>
            </div>
          </div>

          <div class="reason-item">
            <a-tag color="purple" :title="stock.reason">{{ stock.reason }}</a-tag>
          </div>

          <div class="action-buttons">
            <a-button type="primary" size="small">查看明细</a-button>
            <a-button size="small">+自选</a-button>
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="bottom-row">
          <div class="detail-item">
            <span class="label">净买入额</span>
            <span class="value buy">{{ formatCurrency(stock.netBuy) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">净卖出额</span>
            <span class="value sell">{{ formatCurrency(stock.netSell) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">总成交额</span>
            <span class="value">{{ formatCurrency(stock.totalVolume) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">换手率</span>
            <span class="value">{{ stock.turnoverRate.toFixed(2) }}%</span>
          </div>
          <div class="detail-item">
            <span class="label">流通市值</span>
            <span class="value">{{ formatCurrency(stock.floatMarketCap) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 模拟的龙虎榜数据 (新增 openingPrice)
const stocks = ref([
  {
    name: '贵州茅台',
    code: '600519',
    market: 'SH',
    reason: '日涨幅偏离值达7%的证券',
    netBuy: 123450000,
    netSell: 23450000,
    totalVolume: 345670000,
    turnoverRate: 2.5,
    floatMarketCap: 2100000000000,
    changePercent: 8.5,
    closePrice: 1700.5,
    openingPrice: 1650.0
  },
  {
    name: '宁德时代',
    code: '300750',
    market: 'SZ',
    reason: '连续三个交易日内，涨幅偏离值累计达到20%的证券',
    netBuy: 543210000,
    netSell: 123450000,
    totalVolume: 987650000,
    turnoverRate: 5.8,
    floatMarketCap: 950000000000,
    changePercent: -4.2,
    closePrice: 430.8,
    openingPrice: 450.1
  },
  {
    name: '中信证券',
    code: '600030',
    market: 'SH',
    reason: '日换手率达到20%的证券',
    netBuy: 87650000,
    netSell: 98760000,
    totalVolume: 432100000,
    turnoverRate: 21.3,
    floatMarketCap: 350000000000,
    changePercent: 2.1,
    closePrice: 25.15,
    openingPrice: 24.8
  },
  {
    name: '中信证券',
    code: '600030',
    market: 'SH',
    reason: '日换手率达到20%的证券',
    netBuy: 87650000,
    netSell: 98760000,
    totalVolume: 432100000,
    turnoverRate: 21.3,
    floatMarketCap: 350000000000,
    changePercent: 2.1,
    closePrice: 25.15,
    openingPrice: 24.8
  },
  {
    name: '中信证券',
    code: '600030',
    market: 'SH',
    reason: '日换手率达到20%的证券',
    netBuy: 87650000,
    netSell: 98760000,
    totalVolume: 432100000,
    turnoverRate: 21.3,
    floatMarketCap: 350000000000,
    changePercent: 2.1,
    closePrice: 25.15,
    openingPrice: 24.8
  },
  {
    name: '中信证券',
    code: '600030',
    market: 'SH',
    reason: '日换手率达到20%的证券',
    netBuy: 87650000,
    netSell: 98760000,
    totalVolume: 432100000,
    turnoverRate: 21.3,
    floatMarketCap: 350000000000,
    changePercent: 2.1,
    closePrice: 25.15,
    openingPrice: 24.8
  },
  {
    name: '中信证券',
    code: '600030',
    market: 'SH',
    reason: '日换手率达到20%的证券',
    netBuy: 87650000,
    netSell: 98760000,
    totalVolume: 432100000,
    turnoverRate: 21.3,
    floatMarketCap: 350000000000,
    changePercent: 2.1,
    closePrice: 25.15,
    openingPrice: 24.8
  },
  {
    name: '中信证券',
    code: '600030',
    market: 'SH',
    reason: '日换手率达到20%的证券',
    netBuy: 87650000,
    netSell: 98760000,
    totalVolume: 432100000,
    turnoverRate: 21.3,
    floatMarketCap: 350000000000,
    changePercent: 2.1,
    closePrice: 25.15,
    openingPrice: 24.8
  },
  {
    name: '中信证券',
    code: '600030',
    market: 'SH',
    reason: '日换手率达到20%的证券',
    netBuy: 87650000,
    netSell: 98760000,
    totalVolume: 432100000,
    turnoverRate: 21.3,
    floatMarketCap: 350000000000,
    changePercent: 2.1,
    closePrice: 25.15,
    openingPrice: 24.8
  }
])

// 格式化金额，转换为“万”或“亿”
const formatCurrency = (value) => {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}亿`
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万`
  }
  return value
}

// 根据涨跌幅返回对应的class
const getPriceClass = (change) => {
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return 'neutral'
}
</script>

<style scoped>
.dragon-tiger-list-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  height: 100%;
  overflow: auto;
}

.page-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.list-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stock-item {
  border-radius: 8px;
  padding: 15px;
  border: 1px #eee solid;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow 0.3s ease;
}

.stock-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.top-row,
.bottom-row {
  display: flex;
  width: 100%;
  align-items: center;
}

.top-row {
  justify-content: space-between;
  gap: 16px;
}

.bottom-row {
  justify-content: space-around;
  background-color: #fafafa;
  border-radius: 4px;
  padding: 8px 0;
  margin-top: 8px;
}

.price-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-shrink: 0;
  order: 2; /* 交换位置 */
}

.stock-identity {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  order: 1; /* 交换位置 */
}

.current-price-group {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-summary .price {
  font-size: 18px;
  font-weight: bold;
}

.price-summary .percent {
  font-size: 14px;
  font-weight: 500;
}

.opening-price-group {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 2px;
}

.opening-price-group .label {
  font-size: 12px;
  color: #888;
}

.value.opening-price {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.stock-name {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
}

.stock-code-market {
  font-size: 13px;
  color: #888;
  display: flex;
  align-items: center;
  font-weight: bold;
}

.reason-item {
  flex-grow: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  order: 3;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  order: 4;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
}

.label {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.value.positive {
  color: #e53935;
}
.value.negative {
  color: #43a047;
}
.value.buy {
  color: #e53935;
}
.value.sell {
  color: #43a047;
}
</style>
