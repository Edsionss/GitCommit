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

const { themeColors } = useTheme()

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
        up: '#ff4d4f',
        down: '#52c41a',
        unchanged: '#999999'
      }
    }
  ]
}))

const chartOptions = computed(() => {
  const { textSecondary, borderSecondary } = themeColors

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
          color: borderSecondary.value, // 使用解析后的颜色值
          borderColor: borderSecondary.value // 使用解析后的颜色值
        },
        ticks: {
          color: textSecondary.value // 使用解析后的颜色值
        }
      },
      y: {
        position: 'right',
        grid: {
          color: borderSecondary.value, // 使用解析后的颜色值
          borderColor: borderSecondary.value // 使用解析后的颜色值
        },
        ticks: {
          color: textSecondary.value // 使用解析后的颜色值
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
