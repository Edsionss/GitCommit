<template>
  <div class="k-line-container">
    <div v-if="klineData.length" class="chart-container">
      <KLineChart :kline-data="klineData" />
    </div>
    <div class="indicator-container">
      <IndicatorChart :indicator-data="indicatorData" type="vol" />
      <IndicatorChart :indicator-data="indicatorData" type="macd" />
      <!-- KDJ and RSI charts will be added here -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import KLineChart from '@components/Common/KLineChart.vue'
import IndicatorChart from '@components/Common/IndicatorChart.vue'

// Mock data for demonstration
const klineData = ref([])
const indicatorData = ref([])

onMounted(() => {
  // Simulate fetching monthly data
  const data = Array.from({ length: 24 }, (_, i) => {
    const open = 100 + Math.random() * 30
    const close = open + (Math.random() - 0.5) * 15
    const high = Math.max(open, close) + Math.random() * 8
    const low = Math.min(open, close) - Math.random() * 8
    return {
      t: new Date(2022, i, 1).getTime(),
      o: open,
      h: high,
      l: low,
      c: close,
      v: Math.random() * 10000,
      dif: Math.random() * 6 - 3,
      dea: Math.random() * 6 - 3,
      macd: Math.random() * 6 - 3
    }
  })
  klineData.value = data
  indicatorData.value = data
})
</script>

<style scoped>
.k-line-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.chart-container {
  flex: 3;
  display: flex;
  min-height: 0;
}
.indicator-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.chart-container > :deep(*) {
  flex: 1;
  min-width: 0;
}
.indicator-container > :deep(*) {
  flex: 1;
}
</style>
