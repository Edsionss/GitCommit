<template>
  <div class="industry-sector-container">
    <div class="sorter-wrapper">
      <a-space>
        <a-button
          v-for="btn in sortOptions"
          :key="btn.key"
          :type="sortState.key === btn.key ? 'primary' : 'default'"
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

    <div class="sector-grid">
      <div v-for="sector in sortedSectors" :key="sector.name" class="sector-card">
        <div class="card-header">
          <span class="sector-name">{{ sector.name }}</span>
          <span class="sector-change" :class="getChangeClass(sector.change)">
            {{ sector.change.toFixed(2) }}%
          </span>
        </div>

        <div class="leading-stock-info">
          <div class="stock-identity">
            <div class="stock-name-tag">
              <a-tag :color="getChangeClass(sector.leadingStock.change, true)">{{ sector.leadingStock.name }}</a-tag>
            </div>
            <div class="stock-code-market">{{ sector.leadingStock.market }} {{ sector.leadingStock.code }}</div>
          </div>

          <div class="stock-price-details">
            <div class="price-main">
              <span class="price-current" :class="getChangeClass(sector.leadingStock.change)">{{ sector.leadingStock.price.toFixed(2) }}</span>
              <span class="price-change" :class="getChangeClass(sector.leadingStock.change)">{{ sector.leadingStock.change.toFixed(2) }}%</span>
            </div>
            <div class="price-opening">开: {{ sector.leadingStock.openingPrice.toFixed(2) }}</div>
          </div>

          <div class="stock-action">
            <a-button size="small">+自选</a-button>
          </div>
        </div>

        <div class="data-grid">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
// 根据指示，不再导入组件，假定已全局注册

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
  { key: 'netInflow', label: '按流入金额' },
  { key: 'hotness', label: '按热度' },
  { key: 'change', label: '按涨幅' },
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

const getChangeClass = (value: number, forTag = false) => {
  if (forTag) {
    return value > 0 ? 'red' : 'green';
  }
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
  position: relative;
}

.sorter-wrapper {
  position: sticky;
  top: 0;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.sector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.sector-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  .sector-name { font-size: 17px; font-weight: 600; }
  .sector-change { font-size: 18px; font-weight: bold; }
}

.leading-stock-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.stock-identity {
  display: flex;
  flex-direction: column;
  gap: 4px;
  .stock-code-market { font-size: 12px; color: #888; }
}

.stock-price-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  .price-main {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .price-current { font-size: 16px; font-weight: bold; }
  .price-change { font-size: 13px; }
  .price-opening { font-size: 12px; color: #888; }
}

.stock-action {
  align-self: flex-start;
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
  .label { font-size: 12px; color: #888; margin-bottom: 2px; }
  .value { font-size: 14px; font-weight: 500; }
}

.is-up { color: #e53935; }
.is-down { color: #43a047; }

</style>