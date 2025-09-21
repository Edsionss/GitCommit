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
import { useTheme } from '@/composables/useTheme'

const { effectiveTheme } = useTheme()

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
  const borderColor = props.change >= 0 ? 'var(--color-error)' : 'var(--color-success)'
  const backgroundColor =
    props.change >= 0
      ? 'rgba(var(--brand-primary-rgb), 0.2)'
      : 'rgba(var(--color-success-rgb), 0.2)' // Assuming you have --color-success-rgb

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

const chartOptions = computed(() => {
  const textColor = 'var(--text-secondary)'
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: textColor
        }
      },
      tooltip: {
        enabled: false
      }
    },
    scales: {
      x: {
        display: false,
        ticks: {
          color: textColor
        }
      },
      y: {
        display: false,
        ticks: {
          color: textColor
        }
      }
    },
    elements: {
      line: {
        borderCapStyle: 'round'
      }
    }
  }
})
</script>
