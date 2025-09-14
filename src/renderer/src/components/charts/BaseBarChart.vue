<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
} from 'chart.js'
import { useTheme } from '../../composables/useTheme'
import type { ChartData } from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
)

const { effectiveTheme } = useTheme()

defineProps({
  chartData: {
    type: Object as PropType<ChartData<'bar' | 'line'>>,
    required: true
  }
})

const chartTextColor = computed(() => (effectiveTheme.value === 'dark' ? '#f0f0f0' : '#666'))
const chartGridColor = computed(() =>
  effectiveTheme.value === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
)

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: chartTextColor.value
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: chartTextColor.value
      },
      grid: {
        color: chartGridColor.value
      }
    },
    y: {
      ticks: {
        color: chartTextColor.value
      },
      grid: {
        color: chartGridColor.value
      }
    }
  }
}))
</script>
