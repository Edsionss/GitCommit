<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial'
import { ref, computed } from 'vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
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
        up: '#cf1322',
        down: '#389e0d',
        unchanged: '#888'
      }
    }
  ]
}))

const chartOptions = ref({
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
      }
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
})
</script>
