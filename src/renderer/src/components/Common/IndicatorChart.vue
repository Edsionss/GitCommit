<template>
  <Bar v-if="type === 'vol'" :data="chartData" :options="chartOptions" />
  <Line v-else :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { effectiveTheme } = useTheme()

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  TimeScale
)

const props = defineProps<{
  indicatorData: any[]
  type: 'vol' | 'macd' | 'kdj' | 'rsi'
}>()

const chartData = computed(() => {
  const isDark = effectiveTheme.value === 'dark'
  const upColor = 'var(--color-error)'
  const downColor = 'var(--color-success)'

  switch (props.type) {
    case 'vol':
      return {
        labels: props.indicatorData.map((d) => d.t),
        datasets: [
          {
            label: '成交量',
            data: props.indicatorData.map((d) => d.v),
            backgroundColor: (context) => {
              if (!props.indicatorData[context.dataIndex]) {
                return 'rgba(128, 128, 128, 0.7)'
              }
              const { o, c } = props.indicatorData[context.dataIndex]
              return c >= o ? upColor : downColor
            }
          }
        ]
      }
    case 'macd':
      return {
        labels: props.indicatorData.map((d) => d.t),
        datasets: [
          {
            label: 'DIF',
            data: props.indicatorData.map((d) => d.dif),
            borderColor: 'var(--color-warning)',
            borderWidth: 1,
            pointRadius: 0,
            type: 'line'
          },
          {
            label: 'DEA',
            data: props.indicatorData.map((d) => d.dea),
            borderColor: 'var(--color-info)',
            borderWidth: 1,
            pointRadius: 0,
            type: 'line'
          },
          {
            label: 'MACD',
            data: props.indicatorData.map((d) => d.macd),
            backgroundColor: (context) => (context.raw > 0 ? upColor : downColor),
            type: 'bar'
          }
        ]
      }
    // Add cases for KDJ and RSI here
    default:
      return { labels: [], datasets: [] }
  }
})

const chartOptions = computed(() => {
  const gridColor = 'var(--border-secondary)'
  const textColor = 'var(--text-secondary)'

  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        display: false
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
        display: true,
        position: 'top',
        labels: {
          color: textColor,
          boxWidth: 10,
          font: {
            size: 10
          }
        }
      }
    }
  }
})
</script>
