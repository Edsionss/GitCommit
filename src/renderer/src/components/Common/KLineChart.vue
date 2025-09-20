<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, Tooltip, Legend, TimeScale } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial'
import { ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { effectiveTheme } = useTheme()

ChartJS.register(
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement,
  TimeScale
)

const props = defineProps<{
  klineData: { t: number; o: number; h: number; l: number; c: number }[]
}>()

const chartData = computed(() => ({
  datasets: [
    {
      label: 'K线',
      data: props.klineData,
      color: {
        up: effectiveTheme.value === 'dark' ? '#ff4d4f' : '#cf1322',
        down: effectiveTheme.value === 'dark' ? '#52c41a' : '#389e0d',
        unchanged: '#888'
      }
    }
  ]
}))

const chartOptions = computed(() => {
  const gridColor = effectiveTheme.value === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0'
  const textColor = effectiveTheme.value === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'

  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day'
        },
        grid: {
          display: false
        },
        ticks: {
          color: textColor
        }
      },
      y: {
        position: 'right',
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            const raw = context.raw as any
            return [
              `开: ${raw.o}`,
              `高: ${raw.h}`,
              `低: ${raw.l}`,
              `收: ${raw.c}`
            ]
          }
        }
      }
    }
  }
})
</script>
