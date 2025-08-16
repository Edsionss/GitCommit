<template>
  <el-card v-loading="loading">
    <template #header>
      <div class="card-header">
        <span>代码变更报告</span>
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
        <h3 class="chart-title">文件修改热图</h3>
        <div ref="fileHeatmapChart" class="chart"></div>
      </div>

      <div class="chart-container">
        <h3 class="chart-title">代码变更趋势</h3>
        <div ref="changesTrendChart" class="chart"></div>
      </div>
    </div>

    <h3 class="section-title">变更最频繁的文件</h3>
    <el-table :data="topChangedFiles" style="width: 100%">
      <el-table-column type="index" width="50" />
      <el-table-column prop="path" label="文件路径" min-width="300" />
      <el-table-column prop="changes" label="变更次数" width="100" sortable />
      <el-table-column prop="additions" label="添加行数" width="100" sortable />
      <el-table-column prop="deletions" label="删除行数" width="100" sortable />
      <el-table-column label="变更频率" width="150">
        <template #default="{ row }">
          <el-tag :type="getChangeFrequencyType(row.changeFrequency)">
            {{ row.changeFrequency }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Document, Printer } from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import { HeatmapChart, BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import dayjs from 'dayjs';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, GridComponent, VisualMapComponent, HeatmapChart, BarChart, CanvasRenderer]);

const props = defineProps({
  loading: { type: Boolean, default: false },
  topChangedFiles: { type: Array, required: true }
});

defineEmits(['exportReport']);

const fileHeatmapChart = ref(null);
const changesTrendChart = ref(null);

const getChangeFrequencyType = (frequency: string) => {
  switch (frequency) {
    case '高频': return 'danger';
    case '中频': return 'warning';
    case '低频': return 'info';
    default: return 'info';
  }
};

const initFileHeatmapChart = () => {
  if (!fileHeatmapChart.value) return;
  const chart = echarts.init(fileHeatmapChart.value);
  const hours = [
    '12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
    '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'
  ];
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const data = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      let value = Math.round(Math.random() * 10);
      if (i < 5 && j >= 9 && j <= 18) { value = Math.round(Math.random() * 20); }
      if ((i >= 5 || j < 8 || j > 22) && Math.random() > 0.5) { value = Math.round(Math.random() * 5); }
      data.push([j, i, value]);
    }
  }
  const option = {
    tooltip: { position: 'top', formatter: function (params) { return `${days[params.value[1]]} ${hours[params.value[0]]}<br>修改次数: ${params.value[2]}`; } },
    grid: { height: '50%', top: '10%' },
    xAxis: { type: 'category', data: hours, splitArea: { show: true } },
    yAxis: { type: 'category', data: days, splitArea: { show: true } },
    visualMap: { min: 0, max: 20, calculable: true, orient: 'horizontal', left: 'center', bottom: '0%' },
    series: [{ name: '文件修改频率', type: 'heatmap', data: data, label: { show: false }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }]
  };
  chart.setOption(option);
  window.addEventListener('resize', () => { chart.resize(); });
};

const initChangesTrendChart = () => {
  if (!changesTrendChart.value) return;
  const chart = echarts.init(changesTrendChart.value);
  const dates = [];
  const additions = [];
  const deletions = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);
  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    dates.push(dayjs(date).format('MM-DD'));
    additions.push(Math.round(Math.random() * 300 + 100));
    deletions.push(-Math.round(Math.random() * 200 + 50));
  }
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['增加', '删除'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [{ type: 'category', data: dates }],
    yAxis: [{ type: 'value' }],
    series: [
      { name: '增加', type: 'bar', stack: 'total', label: { show: false }, emphasis: { focus: 'series' }, data: additions, itemStyle: { color: '#67C23A' } },
      { name: '删除', type: 'bar', stack: 'total', label: { show: false }, emphasis: { focus: 'series' }, data: deletions, itemStyle: { color: '#F56C6C' } }
    ]
  };
  chart.setOption(option);
  window.addEventListener('resize', () => { chart.resize(); });
};

onMounted(() => {
  initFileHeatmapChart();
  initChangesTrendChart();
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
