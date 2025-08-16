<template>
  <el-card v-loading="loading">
    <template #header>
      <div class="card-header">
        <span>提交活动报告</span>
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
        <h3 class="chart-title">提交频率</h3>
        <div ref="commitFrequencyChart" class="chart"></div>
      </div>

      <div class="chart-container">
        <h3 class="chart-title">提交时间分布</h3>
        <div ref="commitTimeChart" class="chart"></div>
      </div>
    </div>

    <h3 class="section-title">提交统计摘要</h3>
    <el-descriptions :column="4" border>
      <el-descriptions-item label="总提交数">{{
        commitStats.totalCommits
      }}</el-descriptions-item>
      <el-descriptions-item label="最活跃日期">{{
        commitStats.mostActiveDay
      }}</el-descriptions-item>
      <el-descriptions-item label="平均每日提交">{{
        commitStats.avgCommitsPerDay
      }}</el-descriptions-item>
      <el-descriptions-item label="贡献者数量">{{
        commitStats.contributorsCount
      }}</el-descriptions-item>
      <el-descriptions-item label="添加的行数">{{
        commitStats.addedLines
      }}</el-descriptions-item>
      <el-descriptions-item label="删除的行数">{{
        commitStats.deletedLines
      }}</el-descriptions-item>
      <el-descriptions-item label="修改的文件数">{{
        commitStats.modifiedFiles
      }}</el-descriptions-item>
      <el-descriptions-item label="平均提交大小">{{
        commitStats.avgCommitSize
      }}</el-descriptions-item>
    </el-descriptions>

    <h3 class="section-title">贡献者排名</h3>
    <el-table :data="topContributors" style="width: 100%">
      <el-table-column type="index" width="50" />
      <el-table-column prop="name" label="贡献者" min-width="140" />
      <el-table-column prop="email" label="邮箱" min-width="200" />
      <el-table-column prop="commits" label="提交数" width="100" sortable />
      <el-table-column prop="additions" label="添加行数" width="100" sortable />
      <el-table-column prop="deletions" label="删除行数" width="100" sortable />
      <el-table-column label="贡献占比" width="150">
        <template #default="{ row }">
          <el-progress
            :percentage="row.percentage"
            :color="row.color"
            :stroke-width="12"
            :show-text="true"
          />
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Document, Printer } from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, GridComponent, BarChart, LineChart, PieChart, CanvasRenderer]);

const props = defineProps({
  loading: { type: Boolean, default: false },
  commitStats: { type: Object, required: true },
  topContributors: { type: Array, required: true }
});

defineEmits(['exportReport']);

const commitFrequencyChart = ref(null);
const commitTimeChart = ref(null);

const initCommitFrequencyChart = () => {
  if (!commitFrequencyChart.value) return;
  const chart = echarts.init(commitFrequencyChart.value);
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['提交数量'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] },
    yAxis: { type: 'value' },
    series: [{
      name: '提交数量', type: 'bar', data: [12, 24, 36, 42, 28, 31, 38, 45, 39, 42, 28, 19],
      itemStyle: { color: '#409EFF' }
    }]
  };
  chart.setOption(option);
  window.addEventListener('resize', () => { chart.resize(); });
};

const initCommitTimeChart = () => {
  if (!commitTimeChart.value) return;
  const chart = echarts.init(commitTimeChart.value);
  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'horizontal', bottom: 'bottom' },
    series: [{
      name: '提交时间', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold' } },
      labelLine: { show: false },
      data: [
        { value: 42, name: '上午 (6-12点)', itemStyle: { color: '#67C23A' } },
        { value: 68, name: '下午 (12-18点)', itemStyle: { color: '#409EFF' } },
        { value: 56, name: '晚上 (18-24点)', itemStyle: { color: '#E6A23C' } },
        { value: 18, name: '凌晨 (0-6点)', itemStyle: { color: '#F56C6C' } }
      ]
    }]
  };
  chart.setOption(option);
  window.addEventListener('resize', () => { chart.resize(); });
};

onMounted(() => {
  initCommitFrequencyChart();
  initCommitTimeChart();
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
