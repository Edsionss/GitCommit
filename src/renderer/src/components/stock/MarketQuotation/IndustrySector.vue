<template>
  <div class="industry-sector-container">
    <div class="sector-grid">
      <div v-for="sector in sectors" :key="sector.name" class="sector-card">
        <div class="card-header">
          <span class="sector-name">{{ sector.name }}</span>
          <span class="sector-change" :class="getChangeClass(sector.change)">
            {{ sector.change.toFixed(2) }}%
          </span>
        </div>

        <div class="leading-stock-info">
          <span class="label">领涨股:</span>
          <a-tag :color="getChangeClass(sector.change, true)">{{ sector.leadingStock }}</a-tag>
          <span class="stock-price" :class="getChangeClass(sector.change)">{{
            sector.leadingStockPrice.toFixed(2)
          }}</span>
        </div>

        <div class="data-grid">
          <div class="grid-item">
            <span class="label">5日</span>
            <span class="value" :class="getChangeClass(sector.change_5d)"
              >{{ sector.change_5d.toFixed(2) }}%</span
            >
          </div>
          <div class="grid-item">
            <span class="label">20日</span>
            <span class="value" :class="getChangeClass(sector.change_20d)"
              >{{ sector.change_20d.toFixed(2) }}%</span
            >
          </div>
          <div class="grid-item">
            <span class="label">净流入</span>
            <span class="value" :class="getChangeClass(sector.netInflow)">{{
              formatCurrency(sector.netInflow)
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
// 根据指示，不再导入组件，假定已全局注册

interface Sector {
  name: string
  change: number
  change_5d: number
  change_20d: number
  leadingStock: string
  leadingStockPrice: number
  inflow: number
  outflow: number
  netInflow: number
}

const sectors = reactive<Sector[]>([
  {
    name: '半导体',
    change: 2.5,
    change_5d: 5.8,
    change_20d: -2.1,
    leadingStock: '中芯国际',
    leadingStockPrice: 45.88,
    inflow: 35.2e8,
    outflow: 28.1e8,
    netInflow: 7.1e8
  },
  {
    name: '医疗器械',
    change: -1.2,
    change_5d: -3.4,
    change_20d: 8.9,
    leadingStock: '迈瑞医疗',
    leadingStockPrice: 310.5,
    inflow: 12.5e8,
    outflow: 15.3e8,
    netInflow: -2.8e8
  },
  {
    name: '白酒',
    change: 3.1,
    change_5d: 2.5,
    change_20d: 4.6,
    leadingStock: '贵州茅台',
    leadingStockPrice: 1750.0,
    inflow: 50.1e8,
    outflow: 42.9e8,
    netInflow: 7.2e8
  },
  {
    name: '新能源车',
    change: 1.8,
    change_5d: -0.5,
    change_20d: 12.3,
    leadingStock: '比亚迪',
    leadingStockPrice: 255.4,
    inflow: 88.6e8,
    outflow: 80.1e8,
    netInflow: 8.5e8
  },
  {
    name: '光伏',
    change: -0.5,
    change_5d: -2.1,
    change_20d: -5.0,
    leadingStock: '隆基绿能',
    leadingStockPrice: 25.8,
    inflow: 45.1e8,
    outflow: 48.2e8,
    netInflow: -3.1e8
  },
  {
    name: '人工智能',
    change: 4.2,
    change_5d: 10.2,
    change_20d: 15.7,
    leadingStock: '科大讯飞',
    leadingStockPrice: 55.3,
    inflow: 102.5e8,
    outflow: 90.3e8,
    netInflow: 12.2e8
  }
])

const getChangeClass = (value: number, forTag = false) => {
  if (forTag) {
    return value > 0 ? 'red' : 'green'
  }
  return {
    'is-up': value > 0,
    'is-down': value < 0
  }
}

const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1e8) {
    return `${(value / 1e8).toFixed(2)}亿`
  }
  if (Math.abs(value) >= 1e4) {
    return `${(value / 1e4).toFixed(2)}万`
  }
  return value.toFixed(2)
}
</script>

<style scoped lang="scss">
.industry-sector-container {
  height: 100%;
  overflow-y: auto;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 15px 0;
}

.sector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.sector-card {
  background-color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #eee;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;

  .sector-name {
    font-size: 17px;
    font-weight: 600;
    color: #333;
  }
  .sector-change {
    font-size: 18px;
    font-weight: bold;
    font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
  }
}

.leading-stock-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 6px;
  font-size: 14px;

  .label {
    font-size: 13px;
    color: #666;
  }
  .stock-price {
    font-weight: 500;
  }
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .label {
    font-size: 12px;
    color: #888;
    margin-bottom: 2px;
  }
  .value {
    font-size: 14px;
    font-weight: 500;
  }
}

.is-up {
  color: #e53935;
}
.is-down {
  color: #43a047;
}
</style>
