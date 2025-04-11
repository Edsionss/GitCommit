<template>
  <div class="code-analysis-container">
    <div class="code-analysis-header">
      <h2 class="page-title">代码分析</h2>
      <div class="code-analysis-actions">
        <el-select v-model="selectedRepo" placeholder="选择仓库" class="filter-item">
          <el-option
            v-for="repo in repositories"
            :key="repo.id"
            :label="repo.name"
            :value="repo.id"
          />
        </el-select>
        <el-button type="primary" @click="analyzeCode">
          <el-icon class="mr-5"><DataAnalysis /></el-icon>
          分析代码
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="analysis-tabs">
      <el-tab-pane label="代码质量" name="quality">
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
      </el-tab-pane>

      <el-tab-pane label="代码结构" name="structure">
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
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Document, Connection, Warning, Star, DataAnalysis } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts/core'
import { PieChart, BarChart, SankeyChart, TreemapChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册ECharts组件
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
])

// 示例仓库数据
const repositories = [
  { id: 1, name: 'GitCommit' },
  { id: 2, name: 'WebProject' },
  { id: 3, name: 'APIService' }
]

// 状态变量
const selectedRepo = ref(1)
const activeTab = ref('quality')
const loading = ref(false)

// 代码统计数据
const codeStats = reactive({
  totalFiles: 326,
  avgComplexity: 4.8,
  issues: 47,
  qualityScore: '8.6/10'
})

// 代码问题数据
const codeIssues = [
  {
    file: 'src/components/Header.tsx',
    line: 43,
    type: '错误',
    message: '未使用的变量',
    severity: '高'
  },
  {
    file: 'src/utils/formatters.ts',
    line: 27,
    type: '警告',
    message: '未处理的Promise拒绝',
    severity: '中'
  },
  {
    file: 'src/views/Dashboard.vue',
    line: 128,
    type: '警告',
    message: '复杂性过高',
    severity: '中'
  },
  { file: 'src/api/services.js', line: 75, type: '错误', message: '可能的空引用', severity: '高' },
  {
    file: 'src/store/index.ts',
    line: 156,
    type: '信息',
    message: '可简化的条件语句',
    severity: '低'
  },
  { file: 'src/router/index.ts', line: 92, type: '警告', message: '未处理的异常', severity: '中' }
]

// 获取问题类型的颜色
const getIssueTypeColor = (type: string) => {
  switch (type) {
    case '错误':
      return 'danger'
    case '警告':
      return 'warning'
    case '信息':
      return 'info'
    default:
      return ''
  }
}

// 获取问题严重程度的颜色
const getIssueSeverityColor = (severity: string) => {
  switch (severity) {
    case '高':
      return 'danger'
    case '中':
      return 'warning'
    case '低':
      return 'info'
    default:
      return ''
  }
}

// 初始化质量分布图表
const initQualityDistChart = () => {
  const chartDom = document.getElementById('qualityDistChart')
  if (!chartDom) return

  const chart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      top: 'bottom',
      data: ['优', '良', '中', '差']
    },
    series: [
      {
        name: '代码质量',
        type: 'pie',
        radius: ['40%', '70%'],
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
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 216, name: '优', itemStyle: { color: '#67C23A' } },
          { value: 72, name: '良', itemStyle: { color: '#E6A23C' } },
          { value: 28, name: '中', itemStyle: { color: '#F56C6C' } },
          { value: 10, name: '差', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }

  chart.setOption(option)
}

// 初始化文件类型分布图表
const initFileTypeChart = () => {
  const chartDom = document.getElementById('fileTypeChart')
  if (!chartDom) return

  const chart = echarts.init(chartDom)
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
  }

  chart.setOption(option)
}

// 初始化代码行数分布图表
const initCodeLinesChart = () => {
  const chartDom = document.getElementById('codeLinesChart')
  if (!chartDom) return

  const chart = echarts.init(chartDom)
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
  }

  chart.setOption(option)
}

// 分析代码
const analyzeCode = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false

    // 初始化图表
    initQualityDistChart()
    initFileTypeChart()
    initCodeLinesChart()

    ElMessage.success('代码分析已完成')
  }, 1500)
}

// 组件挂载后
onMounted(() => {
  // 初始化图表容器
  const qualityDistChart = document.querySelector('.chart-container .chart') as HTMLElement
  if (qualityDistChart) {
    qualityDistChart.id = 'qualityDistChart'
  }

  const fileTypeChart = document.querySelectorAll('.chart-container .chart')[1] as HTMLElement
  if (fileTypeChart) {
    fileTypeChart.id = 'fileTypeChart'
  }

  const codeLinesChart = document.querySelectorAll('.chart-container .chart')[2] as HTMLElement
  if (codeLinesChart) {
    codeLinesChart.id = 'codeLinesChart'
  }
})
</script>

<style scoped>
.code-analysis-container {
  width: 100%;
}

.code-analysis-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.code-analysis-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 180px;
}

.analysis-tabs {
  margin-bottom: 20px;
}

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
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quality-charts,
.structure-charts {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-container {
  flex: 1;
  min-width: 300px;
}

.chart-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  margin-bottom: 15px;
  color: var(--text-primary);
}

.chart {
  height: 300px;
  width: 100%;
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  margin: 25px 0 15px;
  color: var(--text-primary);
}

.dependency-chart,
.module-chart {
  height: 400px;
  width: 100%;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-secondary);
}

.mr-5 {
  margin-right: 5px;
}
</style>
