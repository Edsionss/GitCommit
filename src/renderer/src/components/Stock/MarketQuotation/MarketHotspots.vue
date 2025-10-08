<template>
  <div class="market-hotspots-container">
    <div class="category-switcher">
      <div class="category-buttons">
        <a-button
          v-for="category in categories"
          :key="category.key"
          type="text"
          size="small"
          :class="{ active: activeCategory === category.key }"
          @click="activeCategory = category.key"
        >
          {{ category.label }}
        </a-button>
      </div>
      <div class="action-buttons">
        <a-button danger size="small" @click="cleanHotRankData()">清空热榜数据</a-button>
        <a-button size="small" @click="stockApi.scrapeAllHotRank()">爬取热榜数据</a-button>
      </div>
    </div>

    <div class="hotspot-list">
      <a-card v-for="(item, index) in filteredHotRankData" :key="item.id || index" hoverable>
        <div
          class="hotspot-card"
          :style="getCardBackgroundByChange(item.priceChangePercentage || 0)"
        >
          <div class="ranking-number">{{ item.rank }}</div>

          <!-- Left Side: Hotspot Data -->
          <div class="hotspot-data">
            <div class="hotspot-header">
              <span class="hotspot-name">{{ item.stockName }}</span>
              <span class="hotspot-change" :class="getChangeClass(item.priceChangePercentage || 0)">
                {{ item.priceChangePercentage || 0 }}%
              </span>
              <span class="hotspot-handel">
                <a-button type="primary" size="small">查看详情</a-button>
              </span>
            </div>
            <div class="hotspot-details-row">
              <div class="detail-item">
                <span class="label">热度</span>
                <span class="value">{{ item.hotnessScore || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="label">排名</span>
                <span class="value">{{ item.rank }}</span>
              </div>
              <div class="detail-item">
                <span class="label">类型</span>
                <span class="value">{{ item.rankType }}</span>
              </div>
              <div class="detail-item">
                <span class="label">日期</span>
                <span class="value">{{ item.tradeDate }}</span>
              </div>
            </div>
          </div>

          <!-- Right Side: Hotspot Info -->
          <div class="hotspot-info">
            <div class="info-header">
              <div>
                <div class="code-line">
                  <span class="stock-code">{{ item.stockCode }}</span>
                  <a-tag v-if="item.tags" color="blue">{{ item.tags }}</a-tag>
                </div>
                <div class="hotspot-title">
                  <span class="hotspot">{{ item.hotspot || '无热点' }}</span>
                </div>
              </div>
              <a-button size="small" type="dashed">+自选</a-button>
            </div>
            <div class="hotspot-summary">
              <span class="summary-text">{{ item.summary || '暂无摘要' }}</span>
            </div>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getCardBackgroundByChange } from '@/utils'
import { stockApi } from '@api/stock'
import type { StockHotRank } from '@sharedType/stockHotRank'

const hotRankData = ref<StockHotRank[]>([])

const categories = [
  { key: 'stock', label: '个股' },
  { key: 'industry', label: '板块' },
  { key: 'ETF', label: 'ETF' },
  { key: 'topic', label: '话题' },
  { key: 'concept', label: '概念' }
]

const activeCategory = ref<string | 'stock' | 'ETF' | 'topic' | 'concept' | 'industry'>('stock')

const filteredHotRankData = computed(() =>
  hotRankData.value.filter((item) => item.rankType === activeCategory.value)
)

const fetchHotspotData = async () => {
  try {
    const data = await stockApi.getStockAllHotRank()
    hotRankData.value = data
    message.success('热榜数据爬取成功')
    console.log(data)
  } catch (error) {
    message.error('热榜数据爬取失败')
    console.error(error)
  }
}

const cleanHotRankData = async () => {
  try {
    await stockApi.cleanStockAllHotRank()
    hotRankData.value = []
    message.success('热榜数据已清空')
  } catch (error) {
    message.error('清空热榜数据失败')
    console.error(error)
  }
}

const getChangeClass = (value: number) => {
  if (value > 0) return 'is-up'
  if (value < 0) return 'is-down'
  return ''
}

onMounted(() => {
  fetchHotspotData()
})
</script>

<style scoped lang="scss">
.market-hotspots-container {
  height: 100%;
}

.category-switcher {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
}

.category-buttons {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.ant-btn {
  font-size: 14px;
}

.hotspot-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  height: calc(100% - 50px);
}

.hotspot-card {
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

.hotspot-data {
  flex: 6;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hotspot-header {
  display: flex;
  align-items: center;
  gap: 12px;
  .hotspot-name {
    flex: 1;
    font-size: 18px;
    font-weight: 600;
  }
  .hotspot-change {
    flex: 1;
    font-size: 20px;
    font-weight: bold;
  }
  .hotspot-handel {
    flex: 2.5;
    display: flex;
    justify-content: end;
    margin-right: 10px;
  }
}

.hotspot-details-row {
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

.hotspot-info {
  flex: 4;
  padding-left: 20px;
  border-left: 2px dashed var(--border-secondary);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.code-line {
  display: flex;
  align-items: center;
  gap: 8px;
  .stock-code {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.hotspot-title {
  display: flex;
  align-items: center;
  margin-top: 4px;
  .hotspot {
    font-size: 16px;
    font-weight: 500;
  }
}

.hotspot-summary {
  margin-top: 8px;
  .summary-text {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.4;
  }
}

.is-up {
  color: var(--color-error);
}
.is-down {
  color: var(--color-success);
}
</style>
