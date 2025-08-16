<template>
  <a-card class="chart-card">
    <template #title>
      <div class="chart-header">
        <span>语言分布</span>
      </div>
    </template>
    <div class="chart-container">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Card } from 'ant-design-vue'; // Added Card import

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const chartData = computed(() => ({
  labels: ['JavaScript', 'HTML', 'CSS', 'TypeScript', '其他'],
  datasets: [
    {
      backgroundColor: ['#4361ee', '#e63946', '#06d6a0', '#f72585', '#ffd166'],
      data: [48, 17, 15, 14, 6]
    }
  ]
}));

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    }
  }
});
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

.chart-container {
  height: 300px;
  position: relative;
}
</style>
