<template>
  <div>
    <a-card class="charts-card">
      <template #title>
        <div class="card-header">
          <span>提交比例</span>
        </div>
      </template>
      <div class="chart-container">
        <Doughnut :data="pieChartData" :options="pieChartOptions" />
      </div>
    </a-card>

    <a-card v-if="contributor" class="contributor-detail-card">
      <template #title>
        <div class="card-header">
          <span>贡献者详情</span>
          <a-button @click="$emit('clear')" type="text">
            <CloseOutlined />
          </a-button>
        </div>
      </template>

      <div class="contributor-profile">
        <div class="contributor-header">
          <a-avatar :size="60" class="large-avatar">
            {{ getInitials(contributor.name) }}
          </a-avatar>
          <div class="contributor-meta">
            <h3 class="contributor-name">{{ contributor.name }}</h3>
            <p class="contributor-email">{{ contributor.email }}</p>
          </div>
        </div>

        <div class="contributor-stats">
          <div class="stat-box">
            <div class="stat-value">{{ contributor.commits }}</div>
            <div class="stat-label">提交数</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">{{ formatNumber(contributor.additions) }}</div>
            <div class="stat-label">增加行数</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">{{ formatNumber(contributor.deletions) }}</div>
            <div class="stat-label">删除行数</div>
          </div>
        </div>

        <div class="activity-chart">
          <Line :data="activityChartData" :options="activityChartOptions" />
        </div>

        <div class="contributor-detail-section">
          <h4>主要工作文件</h4>
          <a-table
            :data-source="contributor.topFiles"
            :columns="fileColumns"
            size="small"
            :pagination="false"
          >
          </a-table>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
} from 'chart.js'
import { CloseOutlined } from '@ant-design/icons-vue'
import { Card, Button, Avatar, Table } from 'ant-design-vue'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
)

const props = defineProps({
  contributor: { type: Object, default: null },
  allContributors: { type: Array, required: true },
  getInitials: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  getContributorColor: { type: Function, required: true }
})

defineEmits(['clear'])

const pieChartData = computed(() => ({
  labels: props.allContributors.map((c) => c.name),
  datasets: [
    {
      backgroundColor: props.allContributors.map((c) => props.getContributorColor(c.id)),
      data: props.allContributors.map((c) => c.commits)
    }
  ]
}))

const pieChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
})

const activityChartData = computed(() => {
  const labels = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月'
  ]
  const color = props.contributor ? props.getContributorColor(props.contributor.id) : '#000'
  return {
    labels,
    datasets: [
      {
        label: '提交数',
        borderColor: color,
        backgroundColor: `${color}33`, // Add alpha for area fill
        fill: true,
        data: props.contributor ? props.contributor.activity : [],
        tension: 0.3
      }
    ]
  }
})

const activityChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: '近12个月活动'
    }
  }
})

const fileColumns = ref([
  {
    title: '文件名',
    dataIndex: 'filename',
    key: 'filename',
    minWidth: 200
  },
  {
    title: '变更次数',
    dataIndex: 'changes',
    key: 'changes',
    width: 100
  }
])
</script>

<style scoped>
.charts-card,
.contributor-detail-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chart-container,
.activity-chart {
  height: 300px;
  width: 100%;
  position: relative;
}
.chart {
  width: 100%;
  height: 100%;
}
.contributor-profile {
  padding: 10px 0;
}
.contributor-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.large-avatar {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
  margin-right: 15px;
}
.contributor-meta {
  flex: 1;
}
.contributor-name {
  font-size: 1.2em;
  font-weight: 600;
}
.contributor-email {
  color: var(--text-secondary);
}
.contributor-stats {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.stat-box {
  flex: 1;
  background-color: var(--color-background-soft);
  padding: 15px;
  border-radius: 4px;
  text-align: center;
}
.stat-value {
  font-size: 1.5em;
  font-weight: bold;
}
.stat-label {
  font-size: 0.9em;
  color: var(--text-secondary);
}
.contributor-detail-section {
  margin-top: 20px;
}
.contributor-detail-section h4 {
  margin-bottom: 10px;
}
</style>
