<template>
  <a-card :loading="loading">
    <template #title>
      <div class="card-header">
        <span>项目进度报告</span>
        <div class="header-actions">
          <a-button type="primary" @click="$emit('exportReport', 'excel')">
            <template #icon><FileExcelOutlined /></template>
            导出 Excel
          </a-button>
          <a-button danger @click="$emit('exportReport', 'pdf')">
            <template #icon><FilePdfOutlined /></template>
            导出 PDF
          </a-button>
        </div>
      </div>
    </template>

    <div class="reports-preview">
      <div class="chart-container">
        <h3 class="chart-title">项目进度</h3>
        <Bar :data="progressChartData" :options="progressChartOptions" />
      </div>

      <div class="chart-container">
        <h3 class="chart-title">任务完成状态</h3>
        <Doughnut :data="tasksChartData" :options="tasksChartOptions" />
      </div>
    </div>

    <h3 class="section-title">里程碑状态</h3>
    <a-timeline>
      <a-timeline-item
        v-for="milestone in milestones"
        :key="milestone.id"
        :color="getMilestoneColor(milestone.status)"
      >
        <h4>{{ milestone.title }} ({{ milestone.date }})</h4>
        <p>{{ milestone.description }}</p>
        <a-tag :color="getMilestoneColor(milestone.status)">{{ milestone.status }}</a-tag>
      </a-timeline-item>
    </a-timeline>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons-vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const props = defineProps({
  loading: { type: Boolean, default: false },
  milestones: { type: Array, required: true }
})

defineEmits(['exportReport'])

const getMilestoneColor = (status: string) => {
  switch (status) {
    case 'completed': return 'green';
    case 'in-progress': return 'blue';
    case 'pending': return 'gray';
    default: return 'gray';
  }
}

const progressChartOptions = computed(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true } },
  scales: { x: { max: 100 } }
}))

const tasksChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'right' } }
}))

const progressChartData = computed(() => ({
  labels: ['功能开发', '界面设计', '后端API', '数据库', '测试', '文档'],
  datasets: [
    { label: '计划进度', backgroundColor: '#91d5ff', data: [90, 95, 85, 80, 70, 60] },
    { label: '实际进度', backgroundColor: '#1890ff', data: [95, 90, 80, 85, 60, 50] }
  ]
}))

const tasksChartData = computed(() => ({
  labels: ['已完成', '进行中', '待开始', '已延期'],
  datasets: [
    {
      backgroundColor: ['#52c41a', '#1890ff', '#faad14', '#f5222d'],
      data: [42, 28, 18, 12]
    }
  ]
}))
</script>

<style scoped>
.reports-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-container {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
  height: 350px;
  position: relative;
}

.chart-title {
  font-size: 16px;
  margin-bottom: 16px;
}

.section-title {
  margin: 32px 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}
</style>