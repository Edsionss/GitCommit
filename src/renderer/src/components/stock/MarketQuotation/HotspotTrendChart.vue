<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
} from 'chart.js'
import { computed } from 'vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps<{
  trendData: number[]
  change: number
}>()

const chartData = computed(() => {
  const borderColor = props.change >= 0 ? 'rgba(207, 19, 34, 0.8)' : 'rgba(56, 158, 13, 0.8)'
  const backgroundColor =
    props.change >= 0 ? 'rgba(207, 19, 34, 0.1)' : 'rgba(56, 158, 13, 0.1)'

  return {
    labels: Array(props.trendData.length).fill(''),
    datasets: [
      {
        data: props.trendData,
        borderColor: borderColor,
        backgroundColor: backgroundColor,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
        fill: true
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: false // Disable tooltips for a cleaner look in the card
    }
  },
  scales: {
    x: {
      display: false
    },
    y: {
      display: false
    }
  }
}
</script>
