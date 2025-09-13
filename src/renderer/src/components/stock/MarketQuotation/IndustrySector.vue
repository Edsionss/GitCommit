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
          <template v-if="sortState.key === btn.key">
            <arrow-up-outlined v-if="sortState.order === 'asc'" />
            <arrow-down-outlined v-else />
          </template>
        </a-button>
      </a-space>
    </div>

    <div class="sector-list">
      <div v-for="(sector, index) in sortedSectors" :key="sector.name" class="sector-card">
        <div class="ranking-number">{{ index + 1 }}</div>
        
        <!-- Left Side: Industry Data -->
        <div class="industry-data">
          <div class="industry-header">
            <span class="sector-name">{{ sector.name }}</span>
            <span class="sector-change" :class="getChangeClass(sector.change)">
              {{ sector.change.toFixed(2) }}%
            </span>
          </div>
          <div class="industry-grid">
            <div class="grid-item">
              <span class="label">热度</span>
              <span class="value">{{ sector.hotness }}</span>
            </div>
            <div class="grid-item">
              <span class="label">5日</span>
              <span class="value" :class="getChangeClass(sector.change_5d)">{{ sector.change_5d.toFixed(2) }}%</span>
            </div>
            <div class="grid-item">
              <span class="label">20日</span>
              <span class="value" :class="getChangeClass(sector.change_20d)">{{ sector.change_20d.toFixed(2) }}%</span>
            </div>
            <div class="grid-item">
              <span class="label">净流入</span>
              <span class="value" :class="getChangeClass(sector.netInflow)">{{ formatCurrency(sector.netInflow) }}</span>
            </div>
          </div>
        </div>

        <!-- Right Side: Leading Stock Data -->
        <div class="leading-stock-data">
            <div class="stock-title">领涨股</div>
            <div class="stock-name-line">
                <span class="stock-name">{{ sector.leadingStock.name }}</span>
                <span class="stock-code">{{ sector.leadingStock.market }} {{ sector.leadingStock.code }}</span>
            </div>
            <div class="stock-price-line">
                <span class="stock-price" :class="getChangeClass(sector.leadingStock.change)">{{ sector.leadingStock.price.toFixed(2) }}</span>
                <span class="stock-change" :class="getChangeClass(sector.leadingStock.change)">{{ sector.leadingStock.change.toFixed(2) }}%</span>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
// No component imports as per instruction

interface LeadingStock {
  name: string;
  market: string;
  code: string;
  price: number;
  openingPrice: number;
  change: number;
}

interface Sector {
  name: string;
  hotness: number;
  change: number;
  change_5d: number;
  change_20d: number;
  leadingStock: LeadingStock;
  netInflow: number;
}

const sortOptions = [
  { key: 'netInflow', label: '净流入' },
  { key: 'hotness', label: '热度' },
  { key: 'change', label: '涨幅' },
];

const sortState = reactive({
  key: 'netInflow' as 'netInflow' | 'hotness' | 'change',
  order: 'desc' as 'asc' | 'desc',
});

const sectors = reactive<Sector[]>([
  { name: '半导体', hotness: 95, change: 2.5, change_5d: 5.8, change_20d: -2.1, leadingStock: { name: '中芯国际', market: 'SH', code: '688981', price: 45.88, openingPrice: 45.0, change: 3.1 }, netInflow: 7.1e8 },
  { name: '医疗器械', hotness: 88, change: -1.2, change_5d: -3.4, change_20d: 8.9, leadingStock: { name: '迈瑞医疗', market: 'SZ', code: '300760', price: 310.5, openingPrice: 315.0, change: -1.5 }, netInflow: -2.8e8 },
  { name: '白酒', hotness: 92, change: 3.1, change_5d: 2.5, change_20d: 4.6, leadingStock: { name: '贵州茅台', market: 'SH', code: '600519', price: 1750.0, openingPrice: 1730.0, change: 2.8 }, netInflow: 7.2e8 },
  { name: '新能源车', hotness: 98, change: 1.8, change_5d: -0.5, change_20d: 12.3, leadingStock: { name: '比亚迪', market: 'SZ', code: '002594', price: 255.4, openingPrice: 250.0, change: 2.0 }, netInflow: 8.5e8 },
  { name: '光伏', hotness: 85, change: -0.5, change_5d: -2.1, change_20d: -5.0, leadingStock: { name: '隆基绿能', market: 'SH', code: '601012', price: 25.8, openingPrice: 26.1, change: -0.8 }, netInflow: -3.1e8 },
  { name: '人工智能', hotness: 99, change: 4.2, change_5d: 10.2, change_20d: 15.7, leadingStock: { name: '科大讯飞', market: 'SZ', code: '002230', price: 55.3, openingPrice: 54.0, change: 4.5 }, netInflow: 12.2e8 },
]);

const sortedSectors = computed(() => {
  return [...sectors].sort((a, b) => {
    const aValue = a[sortState.key];
    const bValue = b[sortState.key];
    if (sortState.order === 'asc') {
      return aValue - bValue;
    }
    return bValue - aValue;
  });
});

const handleSort = (key: 'netInflow' | 'hotness' | 'change') => {
  if (sortState.key === key) {
    sortState.order = sortState.order === 'asc' ? 'desc' : 'asc';
  } else {
    sortState.key = key;
    sortState.order = 'desc';
  }
};

const getChangeClass = (value: number) => {
  return { 'is-up': value > 0, 'is-down': value < 0 };
};

const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1e8) return `${(value / 1e8).toFixed(2)}亿`;
  if (Math.abs(value) >= 1e4) return `${(value / 1e4).toFixed(2)}万`;
  return value.toFixed(2);
};

</script>

<style scoped lang="scss">
.industry-sector-container {
  padding: 15px;
}

.sorter-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;

  .active-sort {
    color: #1890ff;
    font-weight: 500;
  }
}

.sector-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sector-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  position: relative;
  padding: 20px;
  padding-left: 30px; // Space for ranking number
  overflow: hidden;
}

.ranking-number {
  position: absolute;
  top: -1px;
  left: -1px;
  background-color: #1890ff;
  color: white;
  padding: 2px 8px;
  border-bottom-right-radius: 8px;
  font-size: 12px;
  font-weight: bold;
}

.industry-data {
  flex: 6; // Takes more space
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.industry-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  .sector-name { font-size: 18px; font-weight: 600; }
  .sector-change { font-size: 20px; font-weight: bold; }
}

.industry-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  .label { font-size: 13px; color: #888; margin-bottom: 4px; }
  .value { font-size: 15px; font-weight: 500; }
}

.leading-stock-data {
  flex: 4; // Takes less space
  padding-left: 20px;
  border-left: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;

  .stock-title {
    font-size: 13px;
    color: #888;
    margin-bottom: 4px;
  }
  .stock-name-line {
    display: flex;
    align-items: baseline;
    gap: 8px;
    .stock-name { font-size: 16px; font-weight: 500; }
    .stock-code { font-size: 12px; color: #aaa; }
  }
  .stock-price-line {
    display: flex;
    align-items: baseline;
    gap: 8px;
    .stock-price { font-size: 18px; font-weight: bold; }
    .stock-change { font-size: 14px; }
  }
}

.is-up { color: #e53935; }
.is-down { color: #43a047; }

</style>
