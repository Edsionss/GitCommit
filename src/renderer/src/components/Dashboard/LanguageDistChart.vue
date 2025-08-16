<template>
  <el-card class="chart-card">
    <template #header>
      <div class="chart-header">
        <span>语言分布</span>
      </div>
    </template>
    <div ref="languageDistChartEl" class="chart-container"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer
]);

const languageDistChartEl = ref<HTMLElement | null>(null);

const initChart = () => {
  if (!languageDistChartEl.value) return;

  const chart = echarts.init(languageDistChartEl.value);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['JavaScript', 'HTML', 'CSS', 'TypeScript', '其他']
    },
    series: [
      {
        name: '语言分布',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 48, name: 'JavaScript', itemStyle: { color: '#4361ee' } },
          { value: 17, name: 'HTML', itemStyle: { color: '#e63946' } },
          { value: 15, name: 'CSS', itemStyle: { color: '#06d6a0' } },
          { value: 14, name: 'TypeScript', itemStyle: { color: '#f72585' } },
          { value: 6, name: '其他', itemStyle: { color: '#ffd166' } }
        ]
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

.chart-container {
  height: 300px;
}
</style>
