<template>
  <div class="market-hotspots-container">
    <!-- 分类切换器 -->
    <div class="category-switcher">
      <a-button
        v-for="category in categories"
        :key="category.key"
        type="text"
        size="large"
        :class="{ active: activeCategory === category.key }"
        @click="activeCategory = category.key"
      >
        {{ category.label }}
      </a-button>
    </div>

    <!-- 内容列表 -->
    <div class="hotspot-list">
      <!-- 个股 -->
      <template v-if="activeCategory === 'stock'">
        <a-card v-for="(item, index) in stockData">
          <div
            :key="item.code"
            class="hotspot-card stock-card"
            :style="getCardBackgroundByChange(item.changePercent)"
          >
            <div class="ranking-number">{{ index + 1 }}</div>
            <div class="card-header">
              <div class="stock-info">
                <span class="name">{{ item.name }}</span>
                <span class="code">{{ item.market }}:{{ item.code }}</span>
              </div>
              <div class="hotness">热度: {{ item.hotness }}</div>
            </div>
            <div class="card-body">
              <div class="stat-item price" :class="getTextClass(item.changePercent)">
                <span class="value">{{ item.closePrice.toFixed(2) }}</span>
                <span class="label">收盘价</span>
              </div>
              <div class="stat-item change" :class="getTextClass(item.changePercent)">
                <span class="value">{{ item.changePercent.toFixed(2) }}%</span>
                <span class="label">涨幅</span>
              </div>
              <div class="stat-item inflow" :class="getTextClass(item.netInflow)">
                <span class="value">{{ formatCurrency(item.netInflow) }}</span>
                <span class="label">净流入</span>
              </div>
            </div>
            <div class="card-meta">
              <span>行业: {{ item.industry }}</span>
              <span>概念: {{ item.concept }}</span>
            </div>
            <div class="chart-container">
              <HotspotTrendChart :trend-data="item.trend" :change="item.changePercent" />
            </div>
          </div>
        </a-card>
      </template>

      <!-- 板块 -->
      <template v-if="activeCategory === 'sector'">
        <a-card v-for="(item, index) in sectorData">
          <div
            :key="item.name"
            class="hotspot-card sector-card"
            :style="getCardBackgroundByChange(item.changePercent)"
          >
            <div class="ranking-number">{{ index + 1 }}</div>
            <div class="card-header">
              <span class="name">{{ item.name }}</span>
              <div class="hotness">热度: {{ item.hotness }}</div>
            </div>
            <div class="card-body">
              <div class="stat-item change" :class="getTextClass(item.changePercent)">
                <span class="value">{{ item.changePercent.toFixed(2) }}%</span>
                <span class="label">涨幅</span>
              </div>
              <div class="stat-item inflow" :class="getTextClass(item.netInflow)">
                <span class="value">{{ formatCurrency(item.netInflow) }}</span>
                <span class="label">净流入</span>
              </div>
            </div>
            <div class="chart-container">
              <HotspotTrendChart :trend-data="item.trend" :change="item.changePercent" />
            </div>
          </div>
        </a-card>
      </template>

      <!-- ETF -->
      <template v-if="activeCategory === 'etf'">
        <a-card v-for="(item, index) in etfData">
          <div
            :key="item.code"
            class="hotspot-card etf-card"
            :style="getCardBackgroundByChange(item.changePercent)"
          >
            <div class="ranking-number">{{ index + 1 }}</div>
            <div class="card-header">
              <div class="stock-info">
                <span class="name">{{ item.name }}</span>
                <span class="code">{{ item.code }}</span>
              </div>
              <a-tag v-if="item.isT0" color="orange">T+0</a-tag>
              <div class="hotness">热度: {{ item.hotness }}</div>
            </div>
            <div class="card-body">
              <div class="stat-item price" :class="getTextClass(item.changePercent)">
                <span class="value">{{ item.closePrice.toFixed(2) }}</span>
                <span class="label">收盘价</span>
              </div>
              <div class="stat-item change" :class="getTextClass(item.changePercent)">
                <span class="value">{{ item.changePercent.toFixed(2) }}%</span>
                <span class="label">涨幅</span>
              </div>
              <div class="stat-item inflow" :class="getTextClass(item.netInflow)">
                <span class="value">{{ formatCurrency(item.netInflow) }}</span>
                <span class="label">净流入</span>
              </div>
            </div>
            <div class="chart-container">
              <HotspotTrendChart :trend-data="item.trend" :change="item.changePercent" />
            </div>
          </div>
        </a-card>
      </template>

      <!-- 话题 -->
      <template v-if="activeCategory === 'topic'">
        <a-card v-for="(item, index) in topicData" :key="item.title">
          <div class="hotspot-card topic-card">
            <div class="ranking-number">{{ index + 1 }}</div>
            <div class="card-header">
              <span class="name">{{ item.title }}</span>
              <div class="hotness">热度: {{ item.hotness }}</div>
            </div>
            <div class="topic-content">
              {{ item.content }}
            </div>
          </div>
        </a-card>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getCardBackgroundByChange } from '@/utils'
import HotspotTrendChart from './HotspotTrendChart.vue'

type CategoryKey = 'stock' | 'sector' | 'etf' | 'topic'

const activeCategory = ref<CategoryKey>('stock')

const categories = [
  { key: 'stock', label: '个股' },
  { key: 'sector', label: '板块' },
  { key: 'etf', label: 'ETF' },
  { key: 'topic', label: '话题' }
]

// --- Mock Data ---
const stockData = ref([
  {
    name: '赛力斯',
    market: 'SH',
    code: '601127',
    changePercent: 9.98,
    openPrice: 85.0,
    closePrice: 95.5,
    hotness: 98,
    industry: '汽车整车',
    concept: '新能源车',
    netInflow: 1.2e9,
    trend: [85, 88, 86, 90, 92, 95.5]
  },
  {
    name: '中芯国际',
    market: 'SH',
    code: '688981',
    changePercent: -5.2,
    openPrice: 58.0,
    closePrice: 55.2,
    hotness: 95,
    industry: '半导体',
    concept: '芯片',
    netInflow: -8.5e8,
    trend: [58, 57, 57.5, 56, 55.5, 55.2]
  }
])

const sectorData = ref([
  {
    name: '半导体',
    changePercent: 3.5,
    hotness: 99,
    netInflow: 2.5e9,
    trend: [100, 101, 100.5, 102, 103, 103.5]
  },
  {
    name: '白酒概念',
    changePercent: -1.8,
    hotness: 88,
    netInflow: -1.2e9,
    trend: [200, 199, 199.5, 198, 197, 196.4]
  }
])

const etfData = ref([
  {
    name: '纳指ETF',
    code: '513100',
    changePercent: 1.5,
    openPrice: 1.8,
    closePrice: 1.82,
    hotness: 96,
    netInflow: 5.2e8,
    isT0: true,
    trend: [1.8, 1.81, 1.805, 1.815, 1.82]
  },
  {
    name: '恒生医疗ETF',
    code: '513060',
    changePercent: -2.2,
    openPrice: 0.45,
    closePrice: 0.44,
    hotness: 85,
    netInflow: -3.1e8,
    isT0: true,
    trend: [0.45, 0.445, 0.448, 0.442, 0.44]
  }
])

const topicData = ref([
  {
    title: '低空经济政策持续加码',
    hotness: 99,
    content:
      '近期，多地发布低空经济相关政策，产业发展有望提速。相关产业链公司受到市场高度关注，资金流入明显。'
  },
  {
    title: 'AI手机元年，产业链迎新机遇',
    hotness: 97,
    content:
      '随着各大手机厂商纷纷推出集成AI大模型的旗舰机型，AI手机正成为消费电子领域的新增长点，从芯片到应用软件的整个产业链都将迎来新的发展机遇。'
  }
])

// --- Helper Functions ---
const getTextClass = (value: number) => {
  if (value > 0) return 'is-up'
  if (value < 0) return 'is-down'
  return ''
}

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1e8) return `${(value / 1e8).toFixed(2)}亿`
  if (Math.abs(value) >= 1e4) return `${(value / 1e4).toFixed(2)}万`
  return value.toFixed(0)
}
</script>

<style scoped lang="scss">
.market-hotspots-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.category-switcher {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  .ant-btn {
    font-size: 16px;
    &.active {
      color: var(--brand-primary);
      font-weight: 500;
    }
  }
}

.hotspot-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hotspot-card {
  // background: #fff;

  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ranking-number {
  position: absolute;
  top: 0;
  left: 0;
  background-color: var(--brand-primary);
  color: white;
  padding: 2px 8px;
  border-bottom-right-radius: 8px;
  font-size: 12px;
  font-weight: bold;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 25px 0 10px 0;

  .name {
    font-size: 16px;
    font-weight: 500;
  }
  .code {
    font-size: 12px;
    color: var(--text-secondary);
    margin-left: 8px;
  }
  .hotness {
    font-size: 12px;
    color: var(--color-warning);
  }
}

.card-body {
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    .value {
      font-size: 18px;
      font-weight: 500;
    }
    .label {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 4px;
    }
  }
}

.card-meta {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.chart-container {
  height: 50px;
  margin: 0 -16px -16px;
}

.topic-content {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.is-up {
  color: var(--color-error);
}
.is-down {
  color: var(--color-success);
}
</style>
