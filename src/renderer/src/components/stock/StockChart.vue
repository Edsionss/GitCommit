
<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  stockData: {
    type: Object,
    required: true
  }
})

const chartData = computed(() => {
  const labels = props.stockData.kline.map((d) => d[0])
  const data = props.stockData.kline.map((d) => d[4]) // Closing price
  return {
    labels,
    datasets: [
      {
        label: `${props.stockData.name} (${props.stockData.code})`,
        backgroundColor: '#f87979',
        data
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}
</script>

<style scoped>
.chart-container {
  height: 400px;
}
</style>
