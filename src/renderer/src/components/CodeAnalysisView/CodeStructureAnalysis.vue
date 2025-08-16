<template>
  <el-card v-loading="loading">
    <template #header>
      <div class="card-header">
        <span>代码结构分析</span>
      </div>
    </template>

    <div class="structure-charts">
      <div class="chart-container">
        <h3 class="chart-title">文件类型分布</h3>
        <div ref="fileTypeChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <h3 class="chart-title">代码行数分布</h3>
        <div ref="codeLinesChart" class="chart"></div>
      </div>
    </div>

    <h3 class="section-title">代码依赖关系</h3>
    <div ref="dependencyChart" class="dependency-chart"></div>

    <h3 class="section-title">模块大小</h3>
    <div ref="moduleChart" class="module-chart"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart, BarChart, SankeyChart, TreemapChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
  BarChart,
  SankeyChart,
  TreemapChart,
  CanvasRenderer
]);

const props = defineProps({
  loading: { type: Boolean, default: false }
});

const fileTypeChart = ref(null);
const codeLinesChart = ref(null);
const dependencyChart = ref(null);
const moduleChart = ref(null);

const initFileTypeChart = () => {
  if (!fileTypeChart.value) return;
  const chart = echarts.init(fileTypeChart.value);
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      top: 'bottom'
    },
    series: [
      {
        name: '文件类型',
        type: 'pie',
        radius: '70%',
        data: [
          { value: 148, name: 'JavaScript' },
          { value: 87, name: 'TypeScript' },
          { value: 56, name: 'Vue' },
          { value: 32, name: 'CSS/SCSS' },
          { value: 21, name: 'JSON' },
          { value: 14, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  chart.setOption(option);
};

const initCodeLinesChart = () => {
  if (!codeLinesChart.value) return;
  const chart = echarts.init(codeLinesChart.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['代码行', '注释行', '空白行']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['JavaScript', 'TypeScript', 'Vue', 'CSS/SCSS', 'JSON', '其他']
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '代码行',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: [8420, 6780, 4320, 1560, 980, 540]
      },
      {
        name: '注释行',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: [1240, 980, 640, 210, 120, 85]
      },
      {
        name: '空白行',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: [920, 750, 520, 190, 45, 70]
      }
    ]
  };
  chart.setOption(option);
};

// Placeholder for more complex charts
const initDependencyChart = () => {
  if (!dependencyChart.value) return;
  dependencyChart.value.innerHTML = '<div style="text-align: center; padding: 20px;">依赖关系图 (待实现)</div>';
};

const initModuleChart = () => {
  if (!moduleChart.value) return;
  moduleChart.value.innerHTML = '<div style="text-align: center; padding: 20px;">模块大小图 (待实现)</div>';
};

onMounted(() => {
  initFileTypeChart();
  initCodeLinesChart();
  initDependencyChart();
  initModuleChart();
});
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.structure-charts { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
.chart-container { flex: 1; min-width: 300px; }
.chart-title { font-size: 16px; font-weight: 500; margin-bottom: 15px; color: var(--text-primary); }
.chart { height: 300px; width: 100%; }
.section-title { font-size: 16px; font-weight: 500; margin: 25px 0 15px; color: var(--text-primary); }
.dependency-chart, .module-chart { height: 400px; width: 100%; background-color: var(--bg-secondary); border-radius: 4px; display: flex; justify-content: center; align-items: center; color: var(--text-secondary); }
</style>
