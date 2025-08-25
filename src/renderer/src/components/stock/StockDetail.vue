<template>
  <div v-if="stockData" class="stock-detail-container">
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="kline" tab="K线图">
        <div class="chart-wrapper">
          <StockChart :stock-data="stockData" />
        </div>
        <div class="indicators-wrapper">
          <h4>技术指标</h4>
          <a-descriptions bordered size="small">
            <a-descriptions-item
              v-for="(value, key) in stockData.indicators"
              :key="key"
              :label="key"
            >
              {{ typeof value === 'number' ? value.toFixed(2) : value }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </a-tab-pane>
      <a-tab-pane key="news" tab="相关资讯">
        <a-list :data-source="stockData.news" size="small" bordered>
          <template #renderItem="{ item }">
            <a-list-item>{{ item }}</a-list-item>
          </template>
          <template #header>
            <div>最新资讯</div>
          </template>
        </a-list>
      </a-tab-pane>
      <a-tab-pane key="ai" tab="AI 智能分析">
        <div class="ai-analysis-panel">
          <div class="analysis-history">
            <div
              v-for="(entry, index) in stockData.analysisHistory"
              :key="index"
              class="history-entry"
            >
              <p><strong>你:</strong> {{ entry.prompt }}</p>
              <pre><strong>AI报告:</strong> {{ entry.report }}</pre>
            </div>
          </div>
          <div class="chat-input-area">
            <a-textarea
              v-model:value="aiPrompt"
              placeholder="输入你的问题或分析指令..."
              :rows="4"
            />
            <a-button type="primary" @click="runAIAnalysis" :loading="isAiLoading">发送</a-button>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
  <div v-else class="no-data">
    <p>暂无数据</p>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue'
import {
  Tabs as ATabs,
  TabPane as ATabPane,
  List as AList,
  ListItem as AListItem,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  Textarea as ATextarea,
  Button as AButton
} from 'ant-design-vue'
import StockChart from './StockChart.vue'
import { useStockStore } from '@/stores/stock'

const props = defineProps({
  stockData: {
    type: Object,
    required: true
  }
})

const stockStore = useStockStore()
const activeTab = ref('kline')
const aiPrompt = ref('')
const isAiLoading = ref(false)

watch(
  () => props.stockData,
  (newVal) => {
    if (newVal) {
      activeTab.value = 'kline'
    }
  },
  { immediate: true }
)

const runAIAnalysis = () => {
  if (!aiPrompt.value.trim() || !props.stockData) return
  isAiLoading.value = true
  // 实际的AI分析逻辑会在这里调用
  // 这里我们只做模拟
  setTimeout(() => {
    const newHistoryEntry = {
      prompt: aiPrompt.value,
      report: `这是关于“${aiPrompt.value}”的模拟分析报告。分析时间：${new Date().toLocaleString()}`,
      time: new Date()
    }
    // 更新store中的数据
    const stock = stockStore.watchList.get(props.stockData.code)
    if (stock) {
      stock.analysisHistory.push(newHistoryEntry)
    }
    aiPrompt.value = ''
    isAiLoading.value = false
  }, 1500)
}
</script>

<style scoped lang="scss">
.stock-detail-container {
  padding: 1rem;
}

.chart-wrapper {
  margin-bottom: 2rem;
}

.indicators-wrapper {
  h4 {
    margin-bottom: 1rem;
  }
}

.ai-analysis-panel {
  display: flex;
  flex-direction: column;
  height: 60vh; /* or a fixed height */
}

.analysis-history {
  flex-grow: 1;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #f9f9f9;
}

.history-entry {
  margin-bottom: 1rem;
  pre {
    white-space: pre-wrap;
    background-color: #fff;
    padding: 0.5rem;
    border-radius: 4px;
  }
}

.chat-input-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .ant-btn {
    align-self: flex-end;
  }
}

.no-data {
  text-align: center;
  margin-top: 2rem;
  color: #999;
}
</style>
