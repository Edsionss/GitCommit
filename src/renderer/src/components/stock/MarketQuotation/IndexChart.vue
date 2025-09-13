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
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { computed } from 'vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  chartDataPoints: number[]
  change: number
}>()

const chartData = computed(() => {
  const borderColor = props.change >= 0 ? 'rgba(207, 19, 34, 1)' : 'rgba(56, 158, 13, 1)'
  const backgroundColor =
    props.change >= 0 ? 'rgba(207, 19, 34, 0.2)' : 'rgba(56, 158, 13, 0.2)'

  return {
    labels: Array(props.chartDataPoints.length).fill(''),
    datasets: [
      {
        data: props.chartDataPoints,
        borderColor: borderColor,
        backgroundColor: backgroundColor,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
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
      enabled: false
    }
  },
  scales: {
    x: {
      display: false
    },
    y: {
      display: false
    }
  },
  elements: {
    line: {
      borderCapStyle: 'round'
    }
  }
}
</script>
