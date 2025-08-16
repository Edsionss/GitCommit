<template>
  <el-card v-loading="loading">
    <template #header>
      <div class="card-header">
        <span>项目进度报告</span>
        <div class="header-actions">
          <el-button type="success" @click="$emit('exportReport', 'excel')">
            <el-icon class="mr-5"><Document /></el-icon>
            导出 Excel
          </el-button>
          <el-button type="danger" @click="$emit('exportReport', 'pdf')">
            <el-icon class="mr-5"><Printer /></el-icon>
            导出 PDF
          </el-button>
        </div>
      </div>
    </template>

    <div class="reports-preview">
      <div class="chart-container">
        <h3 class="chart-title">项目进度</h3>
        <div ref="progressChart" class="chart"></div>
      </div>

      <div class="chart-container">
        <h3 class="chart-title">任务完成状态</h3>
        <div ref="tasksChart" class="chart"></div>
      </div>
    </div>

    <h3 class="section-title">里程碑状态</h3>
    <el-timeline>
      <el-timeline-item
        v-for="milestone in milestones"
        :key="milestone.id"
        :timestamp="milestone.date"
        :type="getMilestoneType(milestone.status)"
        :hollow="milestone.status === 'pending'"
      >
        <h4>{{ milestone.title }}</h4>
        <p>{{ milestone.description }}</p>
        <el-tag :type="getMilestoneTagType(milestone.status)">
          {{ milestone.status }}
        </el-tag>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Document, Printer } from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, GridComponent, BarChart, PieChart, CanvasRenderer]);

const props = defineProps({
  loading: { type: Boolean, default: false },
  milestones: { type: Array, required: true }
});

defineEmits(['exportReport']);

const progressChart = ref(null);
const tasksChart = ref(null);

const getMilestoneType = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'in-progress': return 'primary';
    case 'pending': return 'info';
    default: return 'info';
  }
};

const getMilestoneTagType = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'in-progress': return 'primary';
    case 'pending': return 'info';
    default: return 'info';
  }
};

const initProgressChart = () => {
  if (!progressChart.value) return;
  const chart = echarts.init(progressChart.value);
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['计划进度', '实际进度'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    yAxis: { type: 'category', data: ['功能开发', '界面设计', '后端API', '数据库', '测试', '文档'] },
    series: [
      { name: '计划进度', type: 'bar', data: [90, 95, 85, 80, 70, 60], itemStyle: { color: '#409EFF' } },
      { name: '实际进度', type: 'bar', data: [95, 90, 80, 85, 60, 50], itemStyle: { color: '#67C23A' } }
    ]
  };
  chart.setOption(option);
  window.addEventListener('resize', () => { chart.resize(); });
};

const initTasksChart = () => {
  if (!tasksChart.value) return;
  const chart = echarts.init(tasksChart.value);
  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', data: ['已完成', '进行中', '待开始', '已延期'] },
    series: [{
      name: '任务状态', type: 'pie', radius: '70%', avoidLabelOverlap: false,
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold' } },
      labelLine: { show: false },
      data: [
        { value: 42, name: '已完成', itemStyle: { color: '#67C23A' } },
        { value: 28, name: '进行中', itemStyle: { color: '#409EFF' } },
        { value: 18, name: '待开始', itemStyle: { color: '#E6A23C' } },
        { value: 12, name: '已延期', itemStyle: { color: '#F56C6C' } }
      ]
    }]
  };
  chart.setOption(option);
  window.addEventListener('resize', () => { chart.resize(); });
};

onMounted(() => {
  initProgressChart();
  initTasksChart();
});
</script>

<style scoped>
.reports-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-container {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 16px;
  background-color: var(--color-background-soft);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.chart-title {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--color-text);
}

.chart {
  height: 300px;
  width: 100%;
}

.section-title {
  margin: 32px 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
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

.mr-5 {
  margin-right: 5px;
}
</style>
