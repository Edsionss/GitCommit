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
import { useTheme } from '@/composables/useTheme'

const { effectiveTheme } = useTheme()

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps<{
  trendData: number[]
  change: number
}>()

const chartData = computed(() => {
  const borderColor = props.change >= 0 ? '#ff4d4f' : '#52c41a'
  const backgroundColor =
    props.change >= 0
      ? 'rgba(255, 77, 79, 0.1)'
      : 'rgba(82, 196, 26, 0.1)'

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

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: 'var(--text-secondary)'
        }
      },
      tooltip: {
        enabled: false // Disable tooltips for a cleaner look in the card
      }
    },
    scales: {
      x: {
        display: false,
        ticks: {
          color: 'var(--text-secondary)'
        }
      },
      y: {
        display: false,
        ticks: {
          color: 'var(--text-secondary)'
        }
      }
    }
  }
})
</script>
