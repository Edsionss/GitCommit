<template>
  <el-card class="chart-card">
    <template #header>
      <div class="chart-header">
        <span>提交趋势</span>
        <div class="chart-filters">
          <el-radio-group v-model="commitTrendTimeRange" size="small">
            <el-radio-button :value="'week'">周</el-radio-button>
            <el-radio-button :value="'month'">月</el-radio-button>
            <el-radio-button :value="'year'">年</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </template>
    <div ref="commitTrendChartEl" class="chart-container"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
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
  BarChart,
  LineChart,
  CanvasRenderer
]);

const commitTrendTimeRange = ref('week');
const commitTrendChartEl = ref<HTMLElement | null>(null);

const initChart = () => {
  if (!commitTrendChartEl.value) return;

  const chart = echarts.init(commitTrendChartEl.value);

  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const commitData = [11, 22, 18, 29, 34, 14, 7];

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
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
        data: days,
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '提交数',
        type: 'bar',
        barWidth: '60%',
        data: commitData.map((value) => ({
          value,
          itemStyle: {
            color: '#6366f1'
          }
        }))
      }
    ]
  };

  chart.setOption(option);
};

onMounted(() => {
  setTimeout(initChart, 0);
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

.chart-filters {
  display: flex;
  gap: 10px;
}

.chart-container {
  height: 300px;
}
</style>
