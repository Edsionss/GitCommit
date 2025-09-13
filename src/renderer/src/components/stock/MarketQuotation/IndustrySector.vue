<template>
  <div class="industry-sector-container">
    <div class="sorter-wrapper">
      <a-space>
        <a-button
          v-for="btn in sortOptions"
          :key="btn.key"
          type="text"
          :class="{ 'active-sort': sortState.key === btn.key }"
          @click="handleSort(btn.key)"
        >
          {{ btn.label }}
          <template #icon>
            <span v-if="sortState.key === btn.key">
              <arrow-up-outlined v-if="sortState.order === 'asc'" />
              <arrow-down-outlined v-else />
            </span>
          </template>
        </a-button>
      </a-space>
    </div>

    <div class="sector-list">
      <div
        v-for="(sector, index) in sortedSectors"
        :key="sector.name"
        class="sector-card"
        :style="getCardBackground(sector.change)"
      >
        <div class="ranking-number">{{ index + 1 }}</div>

        <!-- Left Side: Industry Data -->
        <div class="industry-data">
          <div class="industry-header">
            <span class="sector-name">{{ sector.name }}</span>
            <span class="sector-change" :class="getChangeClass(sector.change)">
              {{ sector.change.toFixed(2) }}%
            </span>
          </div>
          <div class="industry-details-row">
            <div class="detail-item">
              <span class="label">热度</span>
              <span class="value">{{ sector.hotness }}</span>
            </div>
            <div class="detail-item">
              <span class="label">5日</span>
              <span class="value" :class="getChangeClass(sector.change_5d)"
                >{{ sector.change_5d.toFixed(2) }}%</span
              >
            </div>
            <div class="detail-item">
              <span class="label">20日</span>
              <span class="value" :class="getChangeClass(sector.change_20d)"
                >{{ sector.change_20d.toFixed(2) }}%</span
              >
            </div>
            <div class="detail-item">
              <span class="label">净流入</span>
              <span class="value" :class="getChangeClass(sector.netInflow)">{{
                formatCurrency(sector.netInflow)
              }}</span>
            </div>
          </div>
        </div>

        <!-- Right Side: Leading Stock Data -->
        <div class="leading-stock-data">
          <div class="stock-header">
            <div>
              <div class="stock-name-line">
                <span class="stock-name">{{ sector.leadingStock.name }}</span>
                <a-tag color="gold">领涨</a-tag>
              </div>
              <div class="stock-market-code">
                <a-tag>{{ sector.leadingStock.market }}</a-tag>
                <span class="stock-code">{{ sector.leadingStock.code }}</span>
              </div>
            </div>
            <a-button size="small" type="dashed">+自选</a-button>
          </div>
          <div class="stock-details">
            <div class="price-item">
              <span class="price-value" :class="getChangeClass(sector.leadingStock.change)">{{
                sector.leadingStock.price.toFixed(2)
              }}</span>
              <span class="price-label">现价</span>
            </div>
            <div class="price-item">
              <span class="price-value" :class="getChangeClass(sector.leadingStock.change)"
                >{{ sector.leadingStock.change.toFixed(2) }}%</span
              >
              <span class="price-label">涨幅</span>
            </div>
            <div class="price-item">
              <span class="price-value">{{ sector.leadingStock.openingPrice.toFixed(2) }}</span>
              <span class="price-label">开盘</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue'

interface LeadingStock {
  name: string
  market: string
  code: string
  price: number
  openingPrice: number
  change: number
}

interface Sector {
  name: string
  hotness: number
  change: number
  change_5d: number
  change_20d: number
  leadingStock: LeadingStock
  netInflow: number
}

const sortOptions = [
  { key: 'netInflow', label: '净流入' },
  { key: 'hotness', label: '热度' },
  { key: 'change', label: '涨幅' }
]

const sortState = reactive({
  key: 'netInflow' as 'netInflow' | 'hotness' | 'change',
  order: 'desc' as 'asc' | 'desc'
})

const sectors = reactive<Sector[]>([
  {
    name: '半导体',
    hotness: 95,
    change: 2.5,
    change_5d: 5.8,
    change_20d: -2.1,
    leadingStock: {
      name: '中芯国际',
      market: 'SH',
      code: '688981',
      price: 45.88,
      openingPrice: 45.0,
      change: 3.1
    },
    netInflow: 7.1e8
  },
  {
    name: '医疗器械',
    hotness: 88,
    change: -1.2,
    change_5d: -3.4,
    change_20d: 8.9,
    leadingStock: {
      name: '迈瑞医疗',
      market: 'SZ',
      code: '300760',
      price: 310.5,
      openingPrice: 315.0,
      change: -1.5
    },
    netInflow: -2.8e8
  },
  {
    name: '白酒',
    hotness: 92,
    change: 3.1,
    change_5d: 2.5,
    change_20d: 4.6,
    leadingStock: {
      name: '贵州茅台',
      market: 'SH',
      code: '600519',
      price: 1750.0,
      openingPrice: 1730.0,
      change: 2.8
    },
    netInflow: 7.2e8
  },
  {
    name: '新能源车',
    hotness: 98,
    change: 1.8,
    change_5d: -0.5,
    change_20d: 12.3,
    leadingStock: {
      name: '比亚迪',
      market: 'SZ',
      code: '002594',
      price: 255.4,
      openingPrice: 250.0,
      change: 2.0
    },
    netInflow: 8.5e8
  },
  {
    name: '光伏',
    hotness: 85,
    change: -0.5,
    change_5d: -2.1,
    change_20d: -5.0,
    leadingStock: {
      name: '隆基绿能',
      market: 'SH',
      code: '601012',
      price: 25.8,
      openingPrice: 26.1,
      change: -0.8
    },
    netInflow: -3.1e8
  },
  {
    name: '人工智能',
    hotness: 99,
    change: 4.2,
    change_5d: 10.2,
    change_20d: 15.7,
    leadingStock: {
      name: '科大讯飞',
      market: 'SZ',
      code: '002230',
      price: 55.3,
      openingPrice: 54.0,
      change: 4.5
    },
    netInflow: 12.2e8
  }
])

const sortedSectors = computed(() => {
  return [...sectors].sort((a, b) => {
    const aValue = a[sortState.key]
    const bValue = b[sortState.key]
    if (sortState.order === 'asc') {
      return aValue - bValue
    }
    return bValue - aValue
  })
})

const handleSort = (key: 'netInflow' | 'hotness' | 'change') => {
  if (sortState.key === key) {
    sortState.order = sortState.order === 'asc' ? 'desc' : 'asc'
  } else {
    sortState.key = key
    sortState.order = 'desc'
  }
}

const getChangeClass = (value: number) => {
  return { 'is-up': value > 0, 'is-down': value < 0 }
}

const getCardBackground = (change: number) => {
  if (change > 0) return { backgroundColor: 'rgba(207, 19, 34, 0.04)' }
  if (change < 0) return { backgroundColor: 'rgba(56, 158, 13, 0.04)' }
  return {}
}

const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1e8) return `${(value / 1e8).toFixed(2)}亿`
  if (Math.abs(value) >= 1e4) return `${(value / 1e4).toFixed(2)}万`
  return value.toFixed(2)
}
</script>

<style scoped lang="scss">
.industry-sector-container {
  height: 100%;
}

.sorter-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  .active-sort {
    color: #1890ff;
    font-weight: 500;
  }
}

.sector-list {
  overflow-y: auto;
  height: calc(100% - 50px);
  // margin-bottom: 16px;
  // display: flex;
  // flex-direction: column;
  // gap: 16px;
}

.sector-card {
  margin-bottom: 16px;

  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  position: relative;
  padding: 16px;
  padding-left: 24px; // Space for ranking number
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.ranking-number {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #1890ff;
  color: white;
  padding: 2px 8px;
  border-bottom-right-radius: 8px;
  font-size: 12px;
  font-weight: bold;
}

.industry-data {
  flex: 6;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.industry-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  .sector-name {
    font-size: 18px;
    font-weight: 600;
  }
  .sector-change {
    font-size: 20px;
    font-weight: bold;
  }
}

.industry-details-row {
  padding: 28px 10px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .detail-item {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
  .label {
    font-size: 13px;
    color: #888;
  }
  .value {
    font-size: 14px;
    font-weight: 500;
  }
}

.leading-stock-data {
  flex: 4;
  padding-left: 20px;
  border-left: 2px dashed #cdd1d7;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stock-name-line {
  display: flex;
  align-items: center;
  gap: 8px;
  .stock-name {
    font-size: 16px;
    font-weight: 500;
  }
}

.stock-market-code {
  display: flex;
  align-items: center;
  margin-top: 4px;
  .stock-code {
    font-size: 12px;
    color: #888;
  }
}

.stock-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.price-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  .price-value {
    font-size: 16px;
    font-weight: bold;
  }
  .price-label {
    font-size: 12px;
    color: #888;
    margin-top: 2px;
  }
}

.is-up {
  color: #cf1322;
}
.is-down {
  color: #389e0d;
}
</style>
