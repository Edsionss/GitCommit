<template>
  <a-card class="chart-card">
    <template #title>
      <div class="chart-header">
        <span>提交趋势</span>
        <div class="chart-filters">
          <!-- Time range filter can be re-implemented later if needed -->
        </div>
      </div>
    </template>
    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Card } from 'ant-design-vue' // Added Card import

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartData = computed(() => ({
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  datasets: [
    {
      label: '提交数',
      backgroundColor: '#6366f1',
      data: [11, 22, 18, 29, 34, 14, 7]
    }
  ]
}))

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
})
</script>

<style scoped>
.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-filters {
  display: flex;
  gap: 10px;
}

.chart-container {
  height: 300px;
  position: relative;
}
</style>
