<template>
  <div>
    <el-card class="charts-card">
      <template #header>
        <div class="card-header">
          <span>提交比例</span>
        </div>
      </template>
      <div class="chart-container">
        <div ref="commitsPieChartEl" class="chart"></div>
      </div>
    </el-card>

    <el-card v-if="contributor" class="contributor-detail-card">
      <template #header>
        <div class="card-header">
          <span>贡献者详情</span>
          <el-button @click="$emit('clear')" text>
            <el-icon><CloseBold /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="contributor-profile">
        <div class="contributor-header">
          <el-avatar :size="60" class="large-avatar">
            {{ getInitials(contributor.name) }}
          </el-avatar>
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

        <div ref="activityChartEl" class="activity-chart"></div>

        <div class="contributor-detail-section">
          <h4>主要工作文件</h4>
          <el-table :data="contributor.topFiles" size="small">
            <el-table-column prop="filename" label="文件名" min-width="200" />
            <el-table-column prop="changes" label="变更次数" width="100" />
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { CloseBold } from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import { PieChart, LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, GridComponent, PieChart, LineChart, CanvasRenderer]);

const props = defineProps({
  contributor: { type: Object, default: null },
  allContributors: { type: Array, required: true },
  getInitials: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  getContributorColor: { type: Function, required: true }
});

defineEmits(['clear']);

const commitsPieChartEl = ref(null);
const activityChartEl = ref(null);

let pieChartInstance: echarts.ECharts | null = null;
let activityChartInstance: echarts.ECharts | null = null;

const initCommitsPieChart = () => {
  if (!commitsPieChartEl.value) return;
  pieChartInstance = echarts.init(commitsPieChartEl.value);
  const data = props.allContributors.map(c => ({
    name: c.name,
    value: c.commits,
    itemStyle: { color: props.getContributorColor(c.id) }
  }));
  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%) ' },
    legend: { orient: 'vertical', right: 10, top: 'center', data: props.allContributors.map(c => c.name) },
    series: [{
      name: '提交数', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold' } },
      labelLine: { show: false },
      data: data
    }]
  };
  pieChartInstance.setOption(option);
};

const initActivityChart = () => {
  if (!activityChartEl.value || !props.contributor) return;
  activityChartInstance = echarts.init(activityChartEl.value);
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const option = {
    title: { text: '近12个月活动', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: months, axisLabel: { interval: 0, rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{
      name: '提交数', type: 'line', data: props.contributor.activity, smooth: true,
      areaStyle: { opacity: 0.3 },
      color: props.getContributorColor(props.contributor.id)
    }]
  };
  activityChartInstance.setOption(option);
};

onMounted(() => {
  initCommitsPieChart();
  if (props.contributor) {
    initActivityChart();
  }
});

watch(() => props.contributor, (newContributor) => {
  if (newContributor) {
    setTimeout(initActivityChart, 0); // Ensure DOM is ready
  } else if(activityChartInstance) {
    activityChartInstance.dispose();
    activityChartInstance = null;
  }
});

window.addEventListener('resize', () => {
  pieChartInstance?.resize();
  activityChartInstance?.resize();
});

</script>

<style scoped>
.charts-card, .contributor-detail-card { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.chart-container, .activity-chart { height: 300px; width: 100%; }
.chart { width: 100%; height: 100%; }
.contributor-profile { padding: 10px 0; }
.contributor-header { display: flex; align-items: center; margin-bottom: 20px; }
.large-avatar { background-color: var(--primary-color); color: white; font-weight: bold; margin-right: 15px; }
.contributor-meta { flex: 1; }
.contributor-name { font-size: 1.2em; font-weight: 600; }
.contributor-email { color: var(--text-secondary); }
.contributor-stats { display: flex; gap: 10px; margin-bottom: 20px; }
.stat-box { flex: 1; background-color: var(--color-background-soft); padding: 15px; border-radius: 4px; text-align: center; }
.stat-value { font-size: 1.5em; font-weight: bold; }
.stat-label { font-size: 0.9em; color: var(--text-secondary); }
.contributor-detail-section { margin-top: 20px; }
.contributor-detail-section h4 { margin-bottom: 10px; }
</style>
