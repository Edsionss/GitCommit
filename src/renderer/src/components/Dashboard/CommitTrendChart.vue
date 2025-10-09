<template>
  <!-- <a-card class="chart-card"> -->
  <ChartContainer title="提交趋势">
    <BaseBarChart :chart-data="chartData" />
  </ChartContainer>
  <!-- </a-card> -->
</template>

<script setup lang="ts">
import { computed } from 'vue'

import ChartContainer from '../charts/ChartContainer.vue'
import BaseBarChart from '../charts/BaseBarChart.vue'

const chartData = computed(() => ({
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  datasets: [
    {
      label: '提交数',
      backgroundColor: '#1890ff',
      data: [11, 22, 18, 29, 34, 14, 7]
    }
  ]
}))
</script>

<style scoped>
.chart-card {
  margin-bottom: 20px;
}
</style>
