<template>
  <a-card :loading="loading">
    <template #title>
      <div class="card-header">
        <span>代码结构分析</span>
      </div>
    </template>

    <div class="structure-charts">
      <div class="chart-container">
        <h3 class="chart-title">文件类型分布</h3>
        <Doughnut :data="fileTypeChartData" :options="chartOptions" />
      </div>
      <div class="chart-container">
        <h3 class="chart-title">代码行数分布</h3>
        <Bar :data="codeLinesChartData" :options="chartOptions" />
      </div>
    </div>

    <h3 class="section-title">代码依赖关系</h3>
    <div class="dependency-chart">
      <div style="text-align: center; padding: 20px">依赖关系图 (待实现)</div>
    </div>

    <h3 class="section-title">模块大小</h3>
    <div class="module-chart">
      <div style="text-align: center; padding: 20px">模块大小图 (待实现)</div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement)

defineProps({
  loading: { type: Boolean, default: false }
})

const fileTypeChartData = computed(() => ({
  labels: ['JavaScript', 'TypeScript', 'Vue', 'CSS/SCSS', 'JSON', '其他'],
  datasets: [
    {
      backgroundColor: ['#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', '#7209b7', '#fca311'],
      data: [148, 87, 56, 32, 21, 14]
    }
  ]
}))

const codeLinesChartData = computed(() => ({
  labels: ['JavaScript', 'TypeScript', 'Vue', 'CSS/SCSS', 'JSON', '其他'],
  datasets: [
    {
      label: '代码行',
      backgroundColor: '#4361ee',
      data: [8420, 6780, 4320, 1560, 980, 540]
    },
    {
      label: '注释行',
      backgroundColor: '#3a0ca3',
      data: [1240, 980, 640, 210, 120, 85]
    },
    {
      label: '空白行',
      backgroundColor: '#4cc9f0',
      data: [920, 750, 520, 190, 45, 70]
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.structure-charts {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}
.chart-container {
  flex: 1;
  min-width: 300px;
  height: 300px;
  position: relative;
}
.chart-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  color: var(--text-primary);
}
.chart {
  height: 300px;
  width: 100%;
}
.section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 25px 0 15px;
  color: var(--text-primary);
}
.dependency-chart,
.module-chart {
  height: 400px;
  width: 100%;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-secondary);
}
</style>
