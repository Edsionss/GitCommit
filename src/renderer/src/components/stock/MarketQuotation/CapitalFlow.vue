<template>
  <div class="capital-flow-container">
    <!-- 大盘信息 -->
    <div class="summary-cards">
      <a-card size="small" class="market-card">
        <a-statistic
          title="大盘净流入"
          :value="marketInfo.netInflow"
          :value-style="getTextColor(marketInfo.netInflow)"
          :precision="2"
          suffix="亿"
        />
      </a-card>
      <a-card size="small" class="market-card">
        <a-statistic
          title="三市成交额"
          :value="marketInfo.totalTurnover"
          :precision="2"
          suffix="亿"
        />
      </a-card>
    </div>

    <!-- 排序按钮 -->
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

    <!-- 个股资金流向列表 -->
    <div class="stock-list">
      <div
        v-for="(stock, index) in sortedStocks"
        :key="stock.code"
        class="stock-card"
        :style="getCardBackgroundByChange(stock.changePercent)"
      >
        <div class="ranking-number">{{ index + 1 }}</div>

        <!-- 左侧: 股票核心数据 -->
        <div class="stock-data">
          <div class="stock-header">
            <span class="stock-name">{{ stock.name }}</span>
            <span class="stock-change" :class="getTextClass(stock.changePercent)">
              {{ stock.changePercent.toFixed(2) }}%
            </span>
            <span class="stock-handel">
              <a-button size="small" type="dashed">+自选</a-button>
            </span>
          </div>
          <div class="stock-details-row">
            <div class="detail-item">
              <span class="label">净流入</span>
              <span class="value" :class="getTextClass(stock.netInflow)">{{
                formatCurrency(stock.netInflow)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="label">现价</span>
              <span class="value" :class="getTextClass(stock.changePercent)">{{
                stock.price.toFixed(2)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="label">量比</span>
              <span class="value">{{ stock.volumeRatio.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧: 股票元信息 -->
        <div class="meta-data">
          <div class="meta-header">
            <div class="meta-line">
              <a-tag>{{ stock.market }}</a-tag>
              <span class="stock-code">{{ stock.code }}</span>
            </div>
            <a-button type="primary" size="small" @click="showDetails(stock)">详细信息</a-button>
          </div>
          <div class="meta-details">
            <div class="meta-item">
              <span class="label">所属行业:</span>
              <span class="value">{{ stock.industry }}</span>
            </div>
            <div class="meta-item">
              <span class="label">最相关概念:</span>
              <span class="value">{{ stock.concept }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细信息弹窗 -->
    <a-modal v-model:open="isModalVisible" :title="`${selectedStock?.name} - 详细信息`" footer="">
      <a-descriptions
        v-if="selectedStock"
        :column="2"
        bordered
        size="small"
        class="modal-descriptions"
      >
        <a-descriptions-item label="市盈率(TTM)">{{ selectedStock.peRatio }}</a-descriptions-item>
        <a-descriptions-item label="流通市值">
          {{ formatCurrency(selectedStock.floatMarketCap) }}
        </a-descriptions-item>
        <a-descriptions-item label="总市值">
          {{ formatCurrency(selectedStock.totalMarketCap) }}
        </a-descriptions-item>
        <a-descriptions-item label="市净率">{{ selectedStock.pbRatio }}</a-descriptions-item>
        <a-descriptions-item label="5日涨幅">
          <span :class="getTextClass(selectedStock.change5d)">
            {{ selectedStock.change5d.toFixed(2) }}%
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="10日涨幅">
          <span :class="getTextClass(selectedStock.change10d)">
            {{ selectedStock.change10d.toFixed(2) }}%
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="5日净量">
          {{ formatCurrency(selectedStock.netVolume5d) }}
        </a-descriptions-item>
        <a-descriptions-item label="10日净量">
          {{ formatCurrency(selectedStock.netVolume10d) }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue'
import { getCardBackgroundByChange } from '@/utils'
import { useTheme } from '@/composables/useTheme'

const { effectiveTheme } = useTheme()

// --- 响应式状态 ---
const marketInfo = ref({
  netInflow: -150.2,
  totalTurnover: 8500.5
})

const stocks = ref([
  {
    name: '贵州茅台',
    market: 'SH',
    code: '600519',
    netInflow: 320450000,
    price: 1650.5,
    changePercent: 1.5,
    industry: '酿酒行业',
    concept: '白酒',
    volumeRatio: 1.2,
    peRatio: 35.5,
    floatMarketCap: 2000000000000,
    totalMarketCap: 2100000000000,
    pbRatio: 10.2,
    change5d: 3.2,
    change10d: -1.5,
    netVolume5d: 1200000000,
    netVolume10d: -500000000
  },
  {
    name: '宁德时代',
    market: 'SZ',
    code: '300750',
    netInflow: -210340000,
    price: 190.8,
    changePercent: -2.1,
    industry: '电池',
    concept: '新能源车',
    volumeRatio: 0.9,
    peRatio: 25.1,
    floatMarketCap: 800000000000,
    totalMarketCap: 880000000000,
    pbRatio: 5.8,
    change5d: -4.5,
    change10d: 2.1,
    netVolume5d: -800000000,
    netVolume10d: 300000000
  },
  {
    name: '比亚迪',
    market: 'SZ',
    code: '002594',
    netInflow: 89760000,
    price: 210.5,
    changePercent: 0.8,
    industry: '汽车整车',
    concept: '新能源车',
    volumeRatio: 1.5,
    peRatio: 30.2,
    floatMarketCap: 600000000000,
    totalMarketCap: 620000000000,
    pbRatio: 4.5,
    change5d: 5.1,
    change10d: 6.2,
    netVolume5d: 950000000,
    netVolume10d: 1500000000
  }
])

const isModalVisible = ref(false)
const selectedStock = ref<(typeof stocks.value)[0] | null>(null)

// --- 排序逻辑 ---
type SortKey = 'netInflow' | 'changePercent' | 'volumeRatio'
const sortOptions = [
  { key: 'netInflow', label: '净流入' },
  { key: 'changePercent', label: '涨幅' },
  { key: 'volumeRatio', label: '量比' }
]

const sortState = reactive({
  key: 'netInflow' as SortKey,
  order: 'desc' as 'asc' | 'desc'
})

const sortedStocks = computed(() => {
  return [...stocks.value].sort((a, b) => {
    const aValue = a[sortState.key]
    const bValue = b[sortState.key]
    if (sortState.order === 'asc') {
      return aValue - bValue
    }
    return bValue - aValue
  })
})

const handleSort = (key: SortKey) => {
  if (sortState.key === key) {
    sortState.order = sortState.order === 'asc' ? 'desc' : 'asc'
  } else {
    sortState.key = key
    sortState.order = 'desc'
  }
}

// --- 方法 ---
const showDetails = (stock) => {
  selectedStock.value = stock
  isModalVisible.value = true
}

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1e8) return `${(value / 1e8).toFixed(2)} 亿`
  if (Math.abs(value) >= 1e4) return `${(value / 1e4).toFixed(2)} 万`
  return value.toString()
}

const getTextColor = (value: number) => {
  const isDark = effectiveTheme.value === 'dark'
  if (value > 0) return { color: isDark ? '#ff4d4f' : '#cf1322' }
  if (value < 0) return { color: isDark ? '#52c41a' : '#389e0d' }
  return {}
}

const getTextClass = (value: number) => {
  if (value > 0) return 'is-up'
  if (value < 0) return 'is-down'
  return ''
}
</script>

<style scoped lang="scss">
.capital-flow-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.market-card {
  :deep(.ant-statistic-title) {
    font-size: 14px;
    color: var(--text-color-secondary);
  }
  :deep(.ant-statistic-content) {
    font-size: 24px;
    font-weight: 500;
  }
}

.sorter-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  .active-sort {
    color: var(--ant-primary-color);
    font-weight: 500;
  }
}

.stock-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stock-card {
  cursor: pointer;
  border-radius: 8px;
  box-shadow: var(--box-shadow-base);
  display: flex;
  position: relative;
  padding: 16px;
  padding-left: 24px;
  overflow: hidden;
  transition: all 0.3s ease;
  &:hover {
    box-shadow: var(--box-shadow-hover);
    transform: translateY(-2px);
  }
}

.ranking-number {
  position: absolute;
  top: 0;
  left: 0;
  background-color: var(--ant-primary-color);
  color: white;
  padding: 2px 8px;
  border-bottom-right-radius: 8px;
  font-size: 12px;
  font-weight: bold;
}

.stock-data {
  flex: 6;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stock-header {
  display: flex;
  align-items: center;
  gap: 12px;
  .stock-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color-primary);
  }
  .stock-change {
    font-size: 20px;
    font-weight: bold;
  }
  .stock-handel {
    margin-left: auto;
  }
}

.stock-details-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;
  .detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .label {
    font-size: 13px;
    color: var(--text-color-tertiary);
  }
  .value {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color-secondary);
  }
}

.meta-data {
  flex: 4;
  padding-left: 20px;
  border-left: 2px dashed var(--border-color-split);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.meta-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.meta-line {
  display: flex;
  align-items: center;
  gap: 8px;
  .stock-code {
    font-size: 12px;
    color: var(--text-color-tertiary);
  }
}

.meta-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  .meta-item {
    display: flex;
    align-items: baseline;
  }
  .label {
    color: var(--text-color-tertiary);
    margin-right: 8px;
    flex-shrink: 0;
  }
  .value {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-color-secondary);
  }
}

.modal-descriptions {
  margin-top: 24px;
}

.is-up {
  color: #cf1322;
}
.is-down {
  color: #389e0d;
}

[data-theme='dark'] {
  .is-up {
    color: #ff4d4f;
  }
  .is-down {
    color: #52c41a;
  }
}</style>
