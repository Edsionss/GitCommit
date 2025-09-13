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
              return c >= o ? 'rgba(207, 19, 34, 0.7)' : 'rgba(56, 158, 13, 0.7)'
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
            borderColor: '#f5a623',
            borderWidth: 1,
            pointRadius: 0,
            type: 'line'
          },
          {
            label: 'DEA',
            data: props.indicatorData.map((d) => d.dea),
            borderColor: '#4a90e2',
            borderWidth: 1,
            pointRadius: 0,
            type: 'line'
          },
          {
            label: 'MACD',
            data: props.indicatorData.map((d) => d.macd),
            backgroundColor: (context) => (context.raw > 0 ? '#cf1322' : '#389e0d'),
            type: 'bar'
          }
        ]
      }
    // Add cases for KDJ and RSI here
    default:
      return { labels: [], datasets: [] }
  }
})

const chartOptions = computed(() => ({
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
        color: '#f0f0f0'
      }
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        boxWidth: 10,
        font: {
          size: 10
        }
      }
    }
  }
}))
</script>
