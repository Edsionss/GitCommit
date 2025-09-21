<template>
  <div class="indices-container">
    <!-- 顶部卡片 -->
    <div class="summary-cards">
      <a-card size="small" class="summary-card">
        <a-statistic title="上涨家数" :value="marketStats.up" :value-style="upColor" />
      </a-card>
      <a-card size="small" class="summary-card">
        <a-statistic title="下跌家数" :value="marketStats.down" :value-style="downColor" />
      </a-card>
    </div>

    <!-- 指数卡片网格 -->
    <div class="indices-grid">
      <a-card
        v-for="index in indices"
        :key="index.enName"
        class="index-card"
        :body-style="{ padding: 0 }"
        :style="getCardBackgroundByChange(index.changePercent)"
      >
        <div class="index-card-content">
          <div class="index-header">
            <div class="index-info">
              <span class="flag-icon">{{ index.flag }}</span>
              <span class="index-name">{{ index.cnName }}</span>
              <span class="index-en-name">{{ index.enName }}</span>
            </div>
            <a-tag :color="index.isOpen ? 'green' : 'red'">
              {{ index.isOpen ? '开市中' : '休市中' }}
            </a-tag>
          </div>

          <div class="index-stats">
            <div class="points">{{ index.points.toFixed(2) }}</div>
            <div class="change" :class="getTextClass(index.changePercent)">
              {{ index.changePercent.toFixed(2) }}%
            </div>
          </div>

          <div class="index-country">{{ index.country }}</div>

          <div class="chart-container">
            <IndexChart :chart-data-points="index.trend" :change="index.changePercent" />
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getCardBackgroundByChange } from '@/utils'
import IndexChart from './IndexChart.vue'
import { useTheme } from '@/composables/useTheme'

const { effectiveTheme } = useTheme()

// --- 响应式状态 ---
const marketStats = ref({
  up: 8,
  down: 4
})

const upColor = computed(() => ({
  color: effectiveTheme.value === 'dark' ? '#ff4d4f' : '#cf1322'
}))

const downColor = computed(() => ({
  color: effectiveTheme.value === 'dark' ? '#52c41a' : '#389e0d'
}))

const indices = ref([
  {
    cnName: '上证指数',
    enName: 'SSE Composite',
    points: 3050.25,
    changePercent: 0.58,
    flag: '🇨🇳',
    country: '中国',
    isOpen: true,
    trend: [3020, 3025, 3030, 3045, 3040, 3055, 3050]
  },
  {
    cnName: '道琼斯工业平均',
    enName: 'Dow Jones',
    points: 38850.43,
    changePercent: -0.22,
    flag: '🇺🇸',
    country: '美国',
    isOpen: false,
    trend: [38900, 38880, 38820, 38860, 38850, 38830, 38850]
  },
  {
    cnName: '纳斯达克综合',
    enName: 'NASDAQ Composite',
    points: 17133.13,
    changePercent: 1.25,
    flag: '🇺🇸',
    country: '美国',
    isOpen: false,
    trend: [17000, 17050, 17020, 17100, 17120, 17150, 17133]
  },
  {
    cnName: '日经225',
    enName: 'Nikkei 225',
    points: 38900.02,
    changePercent: -0.85,
    flag: '🇯🇵',
    country: '日本',
    isOpen: true,
    trend: [39200, 39100, 39000, 38950, 38920, 38900, 38900]
  },
  {
    cnName: '德国DAX',
    enName: 'DAX',
    points: 18350.97,
    changePercent: 0.95,
    flag: '🇩🇪',
    country: '德国',
    isOpen: true,
    trend: [18200, 18250, 18300, 18280, 18320, 18360, 18350]
  },
  {
    cnName: '法国CAC40',
    enName: 'CAC 40',
    points: 7992.87,
    changePercent: -0.5,
    flag: '🇫🇷',
    country: '法国',
    isOpen: true,
    trend: [8050, 8040, 8020, 8000, 7990, 8005, 7992]
  }
])

// --- 方法 ---
const getTextClass = (value: number) => {
  if (value > 0) return 'is-up'
  if (value < 0) return 'is-down'
  return ''
}
</script>

<style scoped lang="scss">
.indices-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.indices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.index-card {
  border-radius: 8px;
  border: 1px solid var(--boarder-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  transition: all 0.3s ease;
  overflow: hidden;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
  }
}

.index-card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.index-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.index-info {
  display: flex;
  align-items: center;
  gap: 8px;
  .flag-icon {
    font-size: 24px;
  }
  .index-name {
    font-size: 16px;
    font-weight: 500;
  }
  .index-en-name {
    font-size: 12px;
    color: #888;
  }
}

.index-stats {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
  .points {
    font-size: 28px;
    font-weight: 500;
  }
  .change {
    font-size: 18px;
    font-weight: 500;
  }
}

.index-country {
  font-size: 12px;
  color: #888;
  margin-bottom: 16px;
}

.chart-container {
  height: 60px;
  margin: 0 -16px -16px;
}

.is-up {
  color: #cf1322;
}
.is-down {
  color: #389e0d;
}
</style>
