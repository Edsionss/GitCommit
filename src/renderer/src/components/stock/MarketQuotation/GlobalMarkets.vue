<template>
  <div class="global-markets-container">
    <div class="market-list">
      <div v-for="market in markets" :key="market.name" class="market-item">
        <div class="market-info">
          <span class="market-name">{{ market.name }}</span>
          <span class="market-value">{{ market.value.toFixed(2) }}</span>
        </div>
        <div
          class="market-change"
          :class="{ 'is-up': market.change > 0, 'is-down': market.change < 0 }"
        >
          <span>{{ market.change.toFixed(2) }}</span>
          <span>{{ market.changePercent.toFixed(2) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const markets = reactive([
  { name: '上证指数', value: 3050.12, change: 25.4, changePercent: 0.84 },
  { name: '深证成指', value: 9350.45, change: -45.12, changePercent: -0.48 },
  { name: '恒生指数', value: 18050.33, change: 150.7, changePercent: 0.84 },
  { name: '道琼斯', value: 38850.43, change: -120.5, changePercent: -0.31 },
  { name: '纳斯达克', value: 17850.71, change: 210.8, changePercent: 1.19 },
  { name: '日经225', value: 38500.12, change: -50.2, changePercent: -0.13 }
])
</script>

<style scoped lang="scss">
.global-markets-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.market-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.market-item {
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;

  .market-info {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;

    .market-name {
      font-size: 16px;
      font-weight: 500;
    }

    .market-value {
      font-size: 18px;
      font-weight: bold;
    }
  }

  .market-change {
    display: flex;
    justify-content: space-between;
    font-size: 14px;

    &.is-up {
      color: #ff4d4f;
    }

    &.is-down {
      color: #52c41a;
    }
  }
}
</style>
