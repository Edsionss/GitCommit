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

const { themeColors } = useTheme()

defineProps({
  chartData: {
    type: Object as PropType<ChartData<'bar' | 'line'>>,
    required: true
  }
})

const chartOptions = computed(() => {
  const { textSecondary, borderSecondary } = themeColors

  // 现在，我们将具体的颜色值（如 '#9ca3af'）传递给 Chart.js
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textSecondary.value // 使用解析后的颜色值
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: textSecondary.value // 使用解析后的颜色值
        },
        grid: {
          // Bonus: 让网格线也跟随主题变化
          color: borderSecondary.value,
          borderColor: borderSecondary.value
        }
      },
      y: {
        ticks: {
          color: textSecondary.value // 使用解析后的颜色值
        },
        grid: {
          // Bonus: 让网格线也跟随主题变化
          color: borderSecondary.value,
          borderColor: borderSecondary.value
        }
      }
    }
  }
})
</script>
