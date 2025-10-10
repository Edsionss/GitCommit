<template>
  <div class="industry-sector-container">
    <div class="category-switcher">
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
      <div class="action-buttons">
        <a-button danger size="small" @click="clearIndustryData()">清除行业数据</a-button>
        <a-button size="small" @click="scrapeIndustryData()">爬取行业数据</a-button>
      </div>
    </div>

    <div class="sector-list">
      <a-card v-for="(sector, index) in sortedSectors" hoverable>
        <div class="sector-card" :style="getCardBackgroundByChange(sector.change)">
          <div class="ranking-number">{{ index + 1 }}</div>

          <!-- Left Side: Industry Data -->
          <div class="industry-data">
            <div class="industry-header">
              <span class="sector-name">{{ sector.name }}</span>
              <span class="sector-change" :class="getChangeClass(sector.change)">
                {{ sector.change.toFixed(2) }}%
              </span>
              <span class="sector-handel">
                <a-button type="primary" size="small">查看明细</a-button>
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
            <div class="industry-details-row">
              <div class="detail-item">
                <span class="label">成交量</span>
                <span class="value"
                  >{{ sector.totalVolumeLots?.toLocaleString() || 'N/A' }}万手</span
                >
              </div>
              <div class="detail-item">
                <span class="label">成交额</span>
                <span class="value"
                  >{{ sector.totalTurnoverYuan?.toLocaleString() || 'N/A' }}亿元</span
                >
              </div>
              <div class="detail-item">
                <span class="label">上涨家数</span>
                <span class="value" :class="{ 'is-up': sector.risingStocksCount }">{{
                  sector.risingStocksCount || 'N/A'
                }}</span>
              </div>
              <div class="detail-item">
                <span class="label">下跌家数</span>
                <span class="value" :class="{ 'is-down': sector.fallingStocksCount }">{{
                  sector.fallingStocksCount || 'N/A'
                }}</span>
              </div>
            </div>
          </div>

          <!-- Right Side: Leading Stock Data -->
          <div class="leading-stock-data">
            <div class="leading-stock-info">
              <div class="stock-name">{{ sector.leadingStockName || 'N/A' }}</div>
              <div class="stock-price">
                <span class="price">{{ sector.leadingStockLatestPrice?.toFixed(2) || 'N/A' }}</span>
                <span
                  class="change"
                  :class="getChangeClass(sector.leadingStockChangePercentage || 0)"
                  >{{ sector.leadingStockChangePercentage?.toFixed(2) || 'N/A' }}%</span
                >
              </div>
            </div>
            <div class="leading-stock-actions">
              <button class="action-btn">查看明细</button>
              <button class="action-btn">+自选</button>
            </div>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue'
import { getCardBackgroundByChange } from '@/utils'
import { stockApi } from '@api/stock'
import { message } from 'ant-design-vue'
import type { StockSectorCamelCase } from '@shared/types/dtos/stock'

interface Sector {
  id: string
  name: string
  hotness: number
  change: number
  change_5d: number
  change_20d: number
  leadingStockName: string | null
  leadingStockLatestPrice: number | null
  leadingStockChangePercentage: number | null
  netInflow: number
  totalVolumeLots: number | null
  totalTurnoverYuan: number | null
  risingStocksCount: number | null
  fallingStocksCount: number | null
  averagePrice: number | null
  tradeDate: string
}

const sortOptions = [
  { key: 'netInflow', label: '净流入' },
  { key: 'hotness', label: '热度' },
  { key: 'changePercentage', label: '涨幅' },
  { key: 'risingStocksCount', label: '上涨家数' }
]

const sortState = reactive({
  key: 'netInflow' as 'netInflow' | 'hotness' | 'changePercentage' | 'risingStocksCount',
  order: 'desc' as 'asc' | 'desc'
})

const sectors = reactive<Sector[]>([])

// 获取板块数据
const fetchSectorData = async () => {
  try {
    const data = await stockApi.getStockSectorsByTradeDate()

    // 将 API 数据转换为组件需要的格式
    sectors.length = 0 // 清空现有数据
    data.forEach((item: StockSectorCamelCase) => {
      sectors.push({
        id: item.id,
        name: item.sectorName,
        hotness: Math.floor(Math.random() * 100), // 模拟热度数据，实际项目中应该从 API 获取
        change: item.changePercentage || 0,
        change_5d: Math.random() * 10 - 5, // 模拟5日涨跌幅，实际项目中应该从 API 获取
        change_20d: Math.random() * 20 - 10, // 模拟20日涨跌幅，实际项目中应该从 API 获取
        leadingStockName: item.leadingStockName,
        leadingStockLatestPrice: item.leadingStockLatestPrice,
        leadingStockChangePercentage: item.leadingStockChangePercentage,
        netInflow: (item.netInflowYuan || 0) * 1e8, // 转换为元
        totalVolumeLots: item.totalVolumeLots,
        totalTurnoverYuan: item.totalTurnoverYuan,
        risingStocksCount: item.risingStocksCount,
        fallingStocksCount: item.fallingStocksCount,
        averagePrice: item.averagePrice,
        tradeDate: item.tradeDate
      })
    })
    message.success('行业板块数据加载成功')
  } catch (error) {
    message.error('行业板块数据加载失败')
    console.error(error)
  }
}

const clearIndustryData = async () => {
  try {
    await stockApi.cleanStockSectors()
    sectors.length = 0 // 清空现有数据
    message.success('行业数据已清空')
  } catch (error) {
    message.error('清空行业数据失败')
    console.error(error)
  }
}

const scrapeIndustryData = async () => {
  try {
    await stockApi.scrapeStockSectors()
    message.success('开始爬取行业数据')
    // 爬取完成后重新获取数据
    setTimeout(() => {
      fetchSectorData()
    }, 2000) // 假设爬取需要2秒，实际项目中应该根据实际情况调整
  } catch (error) {
    message.error('爬取行业数据失败')
    console.error(error)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchSectorData()
})

const sortedSectors = computed(() => {
  // 创建数组的副本以避免修改原始数据
  const sectorsCopy = [...sectors]

  // 根据当前排序方式对行业数据进行排序
  return sectorsCopy.sort((a, b) => {
    let valueA, valueB

    switch (sortState.key) {
      case 'hotness':
        valueA = a.hotness || 0
        valueB = b.hotness || 0
        break
      case 'change':
        valueA = a.change || 0
        valueB = b.change || 0
        break
      case 'netInflow':
        valueA = a.netInflow || 0
        valueB = b.netInflow || 0
        break
      case 'risingStocksCount':
        valueA = a.risingStocksCount || 0
        valueB = b.risingStocksCount || 0
        break
      default:
        valueA = a.hotness || 0
        valueB = b.hotness || 0
    }

    // 根据排序顺序返回结果
    if (sortState.order === 'asc') {
      return valueA - valueB
    }
    return valueB - valueA
  })
})

const handleSort = (key: 'netInflow' | 'hotness' | 'changePercentage' | 'risingStocksCount') => {
  if (sortState.key === key) {
    // 如果已经按这个键排序，则切换排序顺序
    sortState.order = sortState.order === 'asc' ? 'desc' : 'asc'
  } else {
    // 如果按新的键排序，则默认降序
    sortState.key = key
    sortState.order = 'desc'
  }
}

const getChangeClass = (value: number) => {
  return { 'is-up': value > 0, 'is-down': value < 0 }
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

.category-switcher {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
}

.sorter-wrapper {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  .active-sort {
    color: var(--brand-primary);
    font-weight: 500;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.ant-btn {
  font-size: 14px;
}

.sector-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  height: calc(100% - 50px);
}

.sector-card {
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  position: relative;
  padding-left: 24px; // Space for ranking number
  overflow: hidden;
  transition: background-color 0.3s ease;
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

.industry-data {
  flex: 6;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.industry-header {
  display: flex;
  align-items: center;
  gap: 12px;
  .sector-name {
    flex: 1;
    font-size: 18px;
    font-weight: 600;
  }
  .sector-change {
    flex: 1;

    font-size: 20px;
    font-weight: bold;
  }
  .sector-handel {
    flex: 2.5;
    display: flex;
    justify-content: end;
    margin-right: 10px;
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
    color: var(--text-secondary);
  }
  .value {
    font-size: 14px;
    font-weight: 500;
  }
}

.leading-stock-data {
  flex: 4;
  padding-left: 20px;
  border-left: 2px dashed var(--border-secondary);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.leading-stock-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  .stock-name {
    font-size: 16px;
    font-weight: 500;
  }
  .stock-price {
    display: flex;
    align-items: center;
    gap: 8px;
    .price {
      font-size: 16px;
      font-weight: bold;
    }
    .change {
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.leading-stock-actions {
  display: flex;
  gap: 8px;
  .action-btn {
    padding: 4px 8px;
    font-size: 12px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    background-color: var(--bg-primary);
    cursor: pointer;
    &:hover {
      background-color: var(--bg-secondary);
    }
  }
}

.is-up {
  color: var(--color-error);
}
.is-down {
  color: var(--color-success);
}
</style>
