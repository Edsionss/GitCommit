<template>
  <div class="industry-sector-container">
    <h3 class="title">行业板块</h3>
    <ul class="sector-list">
      <li v-for="sector in sectors" :key="sector.name" class="sector-item">
        <span class="sector-name">{{ sector.name }}</span>
        <span class="sector-change" :class="{ 'is-up': sector.change > 0, 'is-down': sector.change < 0 }">
          {{ sector.change.toFixed(2) }}%
        </span>
        <span class="leading-stock">{{ sector.leadingStock }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const sectors = reactive([
  { name: '半导体', change: 2.5, leadingStock: '中芯国际' },
  { name: '医疗器械', change: -1.2, leadingStock: '迈瑞医疗' },
  { name: '白酒', change: 3.1, leadingStock: '贵州茅台' },
  { name: '新能源车', change: 1.8, leadingStock: '比亚迪' },
  { name: '光伏', change: -0.5, leadingStock: '隆基绿能' },
  { name: '人工智能', change: 4.2, leadingStock: '科大讯飞' }
])
</script>

<style scoped lang="scss">
.industry-sector-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.sector-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

.sector-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid #f5f5f5;

  .sector-name {
    flex: 1;
  }

  .sector-change {
    width: 80px;
    text-align: right;
    font-weight: 500;

    &.is-up {
      color: #ff4d4f;
    }

    &.is-down {
      color: #52c41a;
    }
  }

  .leading-stock {
    width: 100px;
    text-align: right;
    color: #666;
  }
}
</style>