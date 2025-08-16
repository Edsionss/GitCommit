<template>
  <el-card v-loading="loading">
    <template #header>
      <div class="card-header">
        <span>代码质量概览</span>
      </div>
    </template>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-item">
          <div class="stat-icon quality-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ codeStats.totalFiles }}</div>
            <div class="stat-label">文件总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-item">
          <div class="stat-icon complexity-icon">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ codeStats.avgComplexity }}</div>
            <div class="stat-label">平均复杂度</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-item">
          <div class="stat-icon issues-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ codeStats.issues }}</div>
            <div class="stat-label">潜在问题</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-item">
          <div class="stat-icon score-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ codeStats.qualityScore }}</div>
            <div class="stat-label">质量分数</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="quality-charts">
      <div class="chart-container">
        <h3 class="chart-title">代码质量分布</h3>
        <div ref="qualityDistChart" class="chart"></div>
      </div>
    </div>

    <el-table :data="codeIssues" style="width: 100%" max-height="400">
      <el-table-column prop="file" label="文件" min-width="180" />
      <el-table-column prop="line" label="行号" width="80" />
      <el-table-column prop="type" label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getIssueTypeColor(row.type)">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="问题描述" min-width="250" />
      <el-table-column prop="severity" label="严重程度" width="120">
        <template #default="{ row }">
          <el-tag :type="getIssueSeverityColor(row.severity)">{{ row.severity }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Document, Connection, Warning, Star } from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

const props = defineProps({
  loading: { type: Boolean, default: false },
  codeStats: { type: Object, required: true },
  codeIssues: { type: Array, required: true }
});

const qualityDistChart = ref(null);

const getIssueTypeColor = (type: string) => {
  switch (type) {
    case '错误': return 'danger';
    case '警告': return 'warning';
    case '信息': return 'info';
    default: return '';
  }
};

const getIssueSeverityColor = (severity: string) => {
  switch (severity) {
    case '高': return 'danger';
    case '中': return 'warning';
    case '低': return 'info';
    default: return '';
  }
};

const initQualityDistChart = () => {
  if (!qualityDistChart.value) return;
  const chart = echarts.init(qualityDistChart.value);
  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'horizontal', top: 'bottom', data: ['优', '良', '中', '差'] },
    series: [{
      name: '代码质量', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '20', fontWeight: 'bold' } },
      labelLine: { show: false },
      data: [
        { value: 216, name: '优', itemStyle: { color: '#67C23A' } },
        { value: 72, name: '良', itemStyle: { color: '#E6A23C' } },
        { value: 28, name: '中', itemStyle: { color: '#F56C6C' } },
        { value: 10, name: '差', itemStyle: { color: '#909399' } }
      ]
    }]
  };
  chart.setOption(option);
};

onMounted(() => {
  initQualityDistChart();
});
</script>

<style scoped>
.stats-row { margin-bottom: 30px; }
.stat-item { display: flex; align-items: center; margin-bottom: 15px; }
.stat-icon { width: 50px; height: 50px; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-right: 15px; font-size: 24px; }
.stat-icon.quality-icon { background-color: rgba(67, 97, 238, 0.1); color: #4361ee; }
.stat-icon.complexity-icon { background-color: rgba(52, 152, 219, 0.1); color: #3498db; }
.stat-icon.issues-icon { background-color: rgba(231, 76, 60, 0.1); color: #e74c3c; }
.stat-icon.score-icon { background-color: rgba(46, 204, 113, 0.1); color: #2ecc71; }
.stat-info { flex: 1; }
.stat-value { font-size: 24px; font-weight: bold; line-height: 1.2; }
.stat-label { font-size: 14px; color: var(--color-text-light); }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.quality-charts { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
.chart-container { flex: 1; min-width: 300px; }
.chart-title { font-size: 16px; font-weight: 500; margin-bottom: 15px; color: var(--text-primary); }
.chart { height: 300px; width: 100%; }
</style>
