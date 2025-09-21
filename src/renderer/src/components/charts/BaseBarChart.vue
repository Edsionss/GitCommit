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

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'var(--text-secondary)'
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: 'var(--text-secondary)'
      },
      grid: {
        display: false
      }
    },
    y: {
      ticks: {
        color: 'var(--text-secondary)'
      },
      grid: {
        display: false
      }
    }
  }
}))
</script>
