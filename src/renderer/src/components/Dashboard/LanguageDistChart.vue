<template>
  <!-- <a-card class="chart-card"> -->
  <ChartContainer title="语言分布">
    <BasePieChart :chart-data="chartData" type="doughnut" />
  </ChartContainer>
  <!-- </a-card> -->
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card as ACard } from 'ant-design-vue'
import ChartContainer from '../charts/ChartContainer.vue'
import BasePieChart from '../charts/BasePieChart.vue'

const chartData = computed(() => ({
  labels: ['JavaScript', 'HTML', 'CSS', 'TypeScript', '其他'],
  datasets: [
    {
      backgroundColor: ['#4361ee', '#e63946', '#06d6a0', '#f72585', '#ffd166'],
      data: [48, 17, 15, 14, 6]
    }
  ]
}))
</script>

<style scoped>
.chart-card {
  margin-bottom: 20px;
}
</style>
