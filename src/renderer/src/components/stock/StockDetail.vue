<template>
  <div v-if="stockData" class="stock-detail-container">
    <!-- 顶部导航 -->
    <div class="detail-nav">
      <a-button
        v-for="item in navItems"
        :key="item.key"
        type="text"
        :class="{ active: activeView === item.key }"
        @click="activeView = item.key"
      >
        {{ item.label }}
      </a-button>
    </div>

    <!-- 动态内容区 -->
    <div class="detail-content">
      <keep-alive>
        <component :is="activeComponent" :stock-data="stockData" />
      </keep-alive>
    </div>
  </div>
  <div v-else class="no-data">
    <p>暂无数据</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'

// 定义 props
const props = defineProps({
  stockData: {
    type: Object,
    default: () => ({
      code: '000001',
      name: '平安银行',
      indicators: { MACD: '0.12', KDJ: '85.3', RSI: '68.5' },
      news: ['平安银行发布一季度财报，净利润同比增长3.5%。', '央行降准，银行板块迎来利好。'],
      analysisHistory: [
        {
          prompt: '分析该股票的近期走势',
          report: '根据模拟数据，该股票近期呈现震荡上行趋势。'
        }
      ]
    })
  }
})

// 导航项
const navItems = [
  { key: 'TimeSharing', label: '分时' },
  { key: 'DailyK', label: '日K' },
  { key: 'WeeklyK', label: '周K' },
  { key: 'MonthlyK', label: '月K' },
  { key: 'FiveDay', label: '五日' },
  { key: 'Profile', label: '概况' },
  { key: 'Capital', label: '资金' },
  { key: 'Announcements', label: '公告' },
  { key: 'News', label: '资讯' },
  { key: 'AiDiagnosis', label: 'AI诊股' }
]

const activeView = ref('TimeSharing')

// 异步加载组件
const components = {
  TimeSharing: defineAsyncComponent(
    () => import('./StockList/StockDetail/components/TimeSharing.vue')
  ),
  DailyK: defineAsyncComponent(() => import('./StockList/StockDetail/components/DailyK.vue')),
  WeeklyK: defineAsyncComponent(() => import('./StockList/StockDetail/components/WeeklyK.vue')),
  MonthlyK: defineAsyncComponent(() => import('./StockList/StockDetail/components/MonthlyK.vue')),
  FiveDay: defineAsyncComponent(() => import('./StockList/StockDetail/components/FiveDay.vue')),
  Profile: defineAsyncComponent(() => import('./StockList/StockDetail/components/Profile.vue')),
  Capital: defineAsyncComponent(() => import('./StockList/StockDetail/components/Capital.vue')),
  Announcements: defineAsyncComponent(
    () => import('./StockList/StockDetail/components/Announcements.vue')
  ),
  News: defineAsyncComponent(() => import('./StockList/StockDetail/components/News.vue')),
  AiDiagnosis: defineAsyncComponent(
    () => import('./StockList/StockDetail/components/AiDiagnosis.vue')
  )
}

const activeComponent = computed(() => components[activeView.value])
</script>

<style scoped lang="scss">
.stock-detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.detail-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;

  .ant-btn {
    &.active {
      color: #1890ff;
      border-bottom: 2px solid #1890ff;
    }
  }
}

.detail-content {
  flex: 1;
  overflow-y: auto;
}

.no-data {
  text-align: center;
  margin-top: 2rem;
  color: #999;
}
</style>
