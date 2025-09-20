<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
import { useTheme } from '@/composables/useTheme'

const { effectiveTheme } = useTheme()

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
  const backgroundColor = effectiveTheme.value === 'dark' ? '#4A5568' : '#f87979' // Example colors

  return {
    labels,
    datasets: [
      {
        label: `${props.stockData.name} (${props.stockData.code})`,
        backgroundColor,
        data
      }
    ]
  }
})

const chartOptions = computed(() => {
  const textColor = effectiveTheme.value === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: textColor
        }
      },
      y: {
        ticks: {
          color: textColor
        }
      }
    }
  }
})
</script>

<style scoped>
.chart-container {
  height: 400px;
}
</style>
