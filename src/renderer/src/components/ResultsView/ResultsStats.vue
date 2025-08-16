<template>
  <div class="stats-container">
    <a-row :gutter="20">
      <a-col :span="8" :xs="24" :sm="12" :md="8">
        <a-card class="stats-card" hoverable>
          <template #title>
            <div class="card-header">
              <span>提交总数</span>
              <FileTextOutlined />
            </div>
          </template>
          <div class="stats-value">{{ stats.totalCommits }}</div>
          <div class="stats-subtitle">总提交记录数量</div>
        </a-card>
      </a-col>
      <a-col :span="8" :xs="24" :sm="12" :md="8">
        <a-card class="stats-card" hoverable>
          <template #title>
            <div class="card-header">
              <span>仓库数量</span>
              <FolderOutlined />
            </div>
          </template>
          <div class="stats-value">{{ stats.totalRepositories }}</div>
          <div class="stats-subtitle">扫描的仓库数量</div>
        </a-card>
      </a-col>
      <a-col :span="8" :xs="24" :sm="12" :md="8">
        <a-card class="stats-card" hoverable>
          <template #title>
            <div class="card-header">
              <span>作者数量</span>
              <UserOutlined />
            </div>
          </template>
          <div class="stats-value">{{ stats.totalAuthors }}</div>
          <div class="stats-subtitle">提交记录中的不同作者</div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="20" style="margin-top: 20px">
      <a-col :span="8" :xs="24" :sm="12" :md="8">
        <a-card class="stats-card" hoverable>
          <template #title>
            <div class="card-header">
              <span>文件变更总数</span>
              <FileOutlined />
            </div>
          </template>
          <div class="stats-value">{{ stats.totalFilesChanged || 0 }}</div>
          <div class="stats-subtitle">所有提交中变更的文件数</div>
        </a-card>
      </a-col>
      <a-col :span="8" :xs="24" :sm="12" :md="8">
        <a-card class="stats-card" hoverable>
          <template #title>
            <div class="card-header">
              <span>新增代码行数</span>
              <PlusOutlined />
            </div>
          </template>
          <div class="stats-value">{{ stats.totalInsertions || 0 }}</div>
          <div class="stats-subtitle">总共新增的代码行数</div>
        </a-card>
      </a-col>
      <a-col :span="8" :xs="24" :sm="12" :md="8">
        <a-card class="stats-card" hoverable>
          <template #title>
            <div class="card-header">
              <span>删除代码行数</span>
              <MinusOutlined />
            </div>
          </template>
          <div class="stats-value">{{ stats.totalDeletions || 0 }}</div>
          <div class="stats-subtitle">总共删除的代码行数</div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 统计维度选择 -->
    <div class="chart-controls">
      <a-form layout="inline">
        <a-form-item label="时间维度">
          <a-select v-model:value="timeUnit" @change="$emit('updateCharts')">
            <a-select-option value="day">按日统计</a-select-option>
            <a-select-option value="week">按周统计</a-select-option>
            <a-select-option value="month">按月统计</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="显示前N项">
          <a-input-number
            v-model:value="topLimit"
            :min="5"
            :max="20"
            @change="$emit('updateCharts')"
          />
        </a-form-item>
      </a-form>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <a-row :gutter="20">
        <a-col :span="12" :xs="24" :sm="24" :md="12">
          <a-card hoverable class="chart-card">
            <template #title>
              <div class="card-header">
                <span>按作者统计</span>
                <div class="chart-actions">
                  <a-tooltip title="切换图表类型">
                    <a-button size="small" @click="$emit('toggleChartType', 'author')">
                      <OperationOutlined />
                    </a-button>
                  </a-tooltip>
                  <a-tooltip title="下载图表">
                    <a-button size="small" @click="$emit('saveChart', 'author')">
                      <DownloadOutlined />
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
            </template>
            <div class="chart" ref="authorChartRef"></div>
          </a-card>
        </a-col>
        <a-col :span="12" :xs="24" :sm="24" :md="12">
          <a-card hoverable class="chart-card">
            <template #title>
              <div class="card-header">
                <span>按日期统计</span>
                <div class="chart-actions">
                  <a-tooltip title="切换图表类型">
                    <a-button size="small" @click="$emit('toggleChartType', 'date')">
                      <OperationOutlined />
                    </a-button>
                  </a-tooltip>
                  <a-tooltip title="下载图表">
                    <a-button size="small" @click="$emit('saveChart', 'date')">
                      <DownloadOutlined />
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
            </template>
            <div class="chart" ref="dateChartRef"></div>
          </a-card>
        </a-col>
      </a-row>
      <a-row style="margin-top: 20px">
        <a-col :span="12" :xs="24" :sm="24" :md="12">
          <a-card hoverable class="chart-card">
            <template #title>
              <div class="card-header">
                <span>按仓库统计</span>
                <div class="chart-actions">
                  <a-tooltip title="切换图表类型">
                    <a-button size="small" @click="$emit('toggleChartType', 'repo')">
                      <OperationOutlined />
                    </a-button>
                  </a-tooltip>
                  <a-tooltip title="下载图表">
                    <a-button size="small" @click="$emit('saveChart', 'repo')">
                      <DownloadOutlined />
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
            </template>
            <div class="chart" ref="repoChartRef"></div>
          </a-card>
        </a-col>
        <a-col :span="12" :xs="24" :sm="24" :md="12">
          <a-card hoverable class="chart-card">
            <template #title>
              <div class="card-header">
                <span>提交时间分布</span>
                <div class="chart-actions">
                  <a-tooltip title="切换图表类型">
                    <a-button size="small" @click="$emit('toggleChartType', 'hour')">
                      <OperationOutlined />
                    </a-button>
                  </a-tooltip>
                  <a-tooltip title="下载图表">
                    <a-button size="small" @click="$emit('saveChart', 'hour')">
                      <DownloadOutlined />
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
            </template>
            <div class="chart" ref="hourChartRef"></div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import {
  Card,
  Row,
  Col,
  Form,
  FormItem,
  Select,
  SelectOption,
  InputNumber,
  Button,
  Tooltip
} from 'ant-design-vue'
import {
  FileTextOutlined,
  FolderOutlined,
  UserOutlined,
  FileOutlined,
  PlusOutlined,
  MinusOutlined,
  OperationOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
  LineChart,
  PieChart,
  CanvasRenderer
])

const props = defineProps({
  stats: { type: Object, required: true },
  timeUnit: { type: String, required: true },
  topLimit: { type: Number, required: true },
  chartTypes: { type: Object, required: true },
  updateCharts: { type: Function, required: true },
  toggleChartType: { type: Function, required: true },
  saveChart: { type: Function, required: true }
})

const emit = defineEmits([
  'update:timeUnit',
  'update:topLimit',
  'updateCharts',
  'toggleChartType',
  'saveChart'
])

const timeUnit = ref(props.timeUnit)
const topLimit = ref(props.topLimit)

watch(timeUnit, (newVal) => emit('update:timeUnit', newVal))
watch(topLimit, (newVal) => emit('update:topLimit', newVal))

// ECharts refs
const authorChartRef = ref<HTMLElement>()
const dateChartRef = ref<HTMLElement>()
const repoChartRef = ref<HTMLElement>()
const hourChartRef = ref<HTMLElement>()

let authorChart: echarts.ECharts | null = null
let dateChart: echarts.ECharts | null = null
let repoChart: echarts.ECharts | null = null
let hourChart: echarts.ECharts | null = null

const initCharts = () => {
  nextTick(() => {
    if (authorChartRef.value) authorChart = echarts.init(authorChartRef.value)
    if (dateChartRef.value) dateChart = echarts.init(dateChartRef.value)
    if (repoChartRef.value) repoChart = echarts.init(repoChartRef.value)
    if (hourChartRef.value) hourChart = echarts.init(hourChartRef.value)
    props.updateCharts()
  })
}

// Re-initialize charts on prop changes if necessary
watch(
  () => props.stats,
  () => initCharts(),
  { deep: true }
)
watch(
  () => props.timeUnit,
  () => initCharts()
)
watch(
  () => props.topLimit,
  () => initCharts()
)
watch(
  () => props.chartTypes,
  () => initCharts(),
  { deep: true }
)

// Dispose charts on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  authorChart?.dispose()
  dateChart?.dispose()
  repoChart?.dispose()
  hourChart?.dispose()
})

// Initial chart setup
import { onMounted } from 'vue'
onMounted(() => {
  initCharts()
})
</script>

<style scoped>
.stats-container {
  padding: var(--spacing-md) 0;
}

.stats-card {
  height: 100%;
  transition: all 0.5s;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: linear-gradient(135deg, white, #f8f9fa);
  border: none !important;
}

.stats-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: var(--border);
  padding: var(--spacing-md);
  background-color: rgba(248, 249, 250, 0.7);
}

.stats-value {
  font-size: 36px;
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  margin: var(--spacing-md) 0;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(67, 97, 238, 0.1);
}

.stats-subtitle {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.charts-container {
  margin-top: var(--spacing-lg);
}

.chart-card {
  margin-bottom: var(--spacing-lg);
  transition: all var(--transition-normal);
  overflow: hidden;
  border-radius: var(--radius-md);
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.chart {
  height: 350px;
  width: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.chart-controls {
  margin: var(--spacing-lg) 0;
  background-color: #f5f7fa;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.chart-actions {
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.chart-card:hover .chart-actions {
  opacity: 1;
}

/* 为统计值增加数字滚动动画 */
.stats-value {
  animation: countUp 1.5s ease-out;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片类型差异化样式 */
.ant-col:nth-child(1) .stats-card {
  background: linear-gradient(135deg, #f8f9fa, #edf2ff);
}

.ant-col:nth-child(2) .stats-card {
  background: linear-gradient(135deg, #f8f9fa, #e6f7ff);
}

.ant-col:nth-child(3) .stats-card {
  background: linear-gradient(135deg, #f8f9fa, #f0fdf4);
}

.ant-col:nth-child(4) .stats-card {
  background: linear-gradient(135deg, #f8f9fa, #fff7ed);
}

.ant-col:nth-child(5) .stats-card {
  background: linear-gradient(135deg, #f8f9fa, #f0fdfa);
}

.ant-col:nth-child(6) .stats-card {
  background: linear-gradient(135deg, #f8f9fa, #fef2f2);
}

@media (max-width: 768px) {
  .stats-card {
    margin-bottom: var(--spacing-md);
  }

  .chart {
    height: 300px;
  }
}
</style>
