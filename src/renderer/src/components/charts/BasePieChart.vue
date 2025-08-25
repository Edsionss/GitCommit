<template>
  <component :is="chartComponent" :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { Pie, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { useTheme } from '../../composables/useTheme'
import type { ChartData } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const { effectiveTheme } = useTheme()

const props = defineProps({
  chartData: {
    type: Object as PropType<ChartData<'pie' | 'doughnut'>>,
    required: true
  },
  type: {
    type: String as PropType<'pie' | 'doughnut'>,
    default: 'doughnut'
  }
})

const chartComponent = computed(() => (props.type === 'pie' ? Pie : Doughnut))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: effectiveTheme.value === 'dark' ? '#f0f0f0' : '#666'
      }
    }
  }
}))
</script>
