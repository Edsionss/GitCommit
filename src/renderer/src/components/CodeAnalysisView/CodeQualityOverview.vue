<template>
  <a-card :loading="loading">
    <template #title>
      <div class="card-header">
        <span>代码质量概览</span>
      </div>
    </template>

    <a-row :gutter="20" class="stats-row">
      <a-col :xs="24" :sm="12" :md="6">
        <div class="stat-item">
          <div class="stat-icon quality-icon">
            <FileTextOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ codeStats.totalFiles }}</div>
            <div class="stat-label">文件总数</div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <div class="stat-item">
          <div class="stat-icon complexity-icon">
            <BranchesOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ codeStats.avgComplexity }}</div>
            <div class="stat-label">平均复杂度</div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <div class="stat-item">
          <div class="stat-icon issues-icon">
            <WarningOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ codeStats.issues }}</div>
            <div class="stat-label">潜在问题</div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <div class="stat-item">
          <div class="stat-icon score-icon">
            <StarOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ codeStats.qualityScore }}</div>
            <div class="stat-label">质量分数</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <div class="quality-charts">
      <div class="chart-container">
        <h3 class="chart-title">代码质量分布</h3>
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <a-table :data-source="codeIssues" :columns="columns" :pagination="false" :scroll="{ y: 400 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          <a-tag :color="getIssueTypeColor(record.type)">{{ record.type }}</a-tag>
        </template>
        <template v-else-if="column.key === 'severity'">
          <a-tag :color="getIssueSeverityColor(record.severity)">{{ record.severity }}</a-tag>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'
import { FileTextOutlined, BranchesOutlined, WarningOutlined, StarOutlined } from '@ant-design/icons-vue'
import type { PropType } from 'vue'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

interface CodeStats {
  totalFiles: number;
  avgComplexity: number;
  issues: number;
  qualityScore: number;
}

interface CodeIssue {
  file: string;
  line: number;
  type: string;
  message: string;
  severity: string;
}

defineProps({
  loading: { type: Boolean, default: false },
  codeStats: { type: Object as PropType<CodeStats>, required: true },
  codeIssues: { type: Array as PropType<CodeIssue[]>, required: true }
})

const getIssueTypeColor = (type: string) => {
  switch (type) {
    case '错误':
      return 'error'
    case '警告':
      return 'warning'
    case '信息':
      return 'processing'
    default:
      return 'default'
  }
}

const getIssueSeverityColor = (severity: string) => {
  switch (severity) {
    case '高':
      return 'error'
    case '中':
      return 'warning'
    case '低':
      return 'default'
    default:
      return 'default'
  }
}

const chartData = computed(() => ({
  labels: ['优', '良', '中', '差'],
  datasets: [
    {
      backgroundColor: ['#67C23A', '#E6A23C', '#F56C6C', '#909399'],
      data: [216, 72, 28, 10]
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true
}

const columns = ref([
    { title: '文件', dataIndex: 'file', key: 'file', width: 180 },
    { title: '行号', dataIndex: 'line', key: 'line', width: 80 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 120 },
    { title: '问题描述', dataIndex: 'message', key: 'message', width: 250 },
    { title: '严重程度', dataIndex: 'severity', key: 'severity', width: 120 },
]);
</script>

<style scoped>
.stats-row {
  margin-bottom: 30px;
}
.stat-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  font-size: 24px;
}
.stat-icon.quality-icon {
  background-color: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}
.stat-icon.complexity-icon {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}
.stat-icon.issues-icon {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}
.stat-icon.score-icon {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}
.stat-info {
  flex: 1;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1.2;
}
.stat-label {
  font-size: 14px;
  color: var(--color-text-light);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.quality-charts {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}
.chart-container {
  width: 100%;
  max-width: 360px;
  height: 360px;
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
</style>
