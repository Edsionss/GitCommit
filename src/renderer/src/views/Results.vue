<template>
  <div class="router-view-container">
    <div class="results">
      <el-tabs
        v-model="activeTab"
        type="border-card"
        class="results-tabs"
        @tab-change="handleTabChange"
      >
        <!-- 统计结果 -->
        <el-tab-pane label="统计结果" name="stats">
          <div class="stats-container">
            <el-row :gutter="20">
              <el-col :span="8" :xs="24" :sm="12" :md="8">
                <el-card class="stats-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>提交总数</span>
                      <el-icon><Document /></el-icon>
                    </div>
                  </template>
                  <div class="stats-value">{{ stats.totalCommits }}</div>
                  <div class="stats-subtitle">总提交记录数量</div>
                </el-card>
              </el-col>
              <el-col :span="8" :xs="24" :sm="12" :md="8">
                <el-card class="stats-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>仓库数量</span>
                      <el-icon><Folder /></el-icon>
                    </div>
                  </template>
                  <div class="stats-value">{{ stats.totalRepositories }}</div>
                  <div class="stats-subtitle">扫描的仓库数量</div>
                </el-card>
              </el-col>
              <el-col :span="8" :xs="24" :sm="12" :md="8">
                <el-card class="stats-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>作者数量</span>
                      <el-icon><User /></el-icon>
                    </div>
                  </template>
                  <div class="stats-value">{{ stats.totalAuthors }}</div>
                  <div class="stats-subtitle">提交记录中的不同作者</div>
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="20" style="margin-top: 20px">
              <el-col :span="8" :xs="24" :sm="12" :md="8">
                <el-card class="stats-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>文件变更总数</span>
                      <el-icon><Files /></el-icon>
                    </div>
                  </template>
                  <div class="stats-value">{{ stats.totalFilesChanged || 0 }}</div>
                  <div class="stats-subtitle">所有提交中变更的文件数</div>
                </el-card>
              </el-col>
              <el-col :span="8" :xs="24" :sm="12" :md="8">
                <el-card class="stats-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>新增代码行数</span>
                      <el-icon><Plus /></el-icon>
                    </div>
                  </template>
                  <div class="stats-value">{{ stats.totalInsertions || 0 }}</div>
                  <div class="stats-subtitle">总共新增的代码行数</div>
                </el-card>
              </el-col>
              <el-col :span="8" :xs="24" :sm="12" :md="8">
                <el-card class="stats-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>删除代码行数</span>
                      <el-icon><Minus /></el-icon>
                    </div>
                  </template>
                  <div class="stats-value">{{ stats.totalDeletions || 0 }}</div>
                  <div class="stats-subtitle">总共删除的代码行数</div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 统计维度选择 -->
            <div class="chart-controls">
              <el-form :inline="true">
                <el-form-item label="时间维度">
                  <el-select v-model="timeUnit" @change="updateCharts">
                    <el-option label="按日统计" value="day" />
                    <el-option label="按周统计" value="week" />
                    <el-option label="按月统计" value="month" />
                  </el-select>
                </el-form-item>
                <el-form-item label="显示前N项">
                  <el-input-number v-model="topLimit" :min="5" :max="20" @change="updateCharts" />
                </el-form-item>
              </el-form>
            </div>

            <!-- 图表区域 -->
            <div class="charts-container">
              <el-row :gutter="20">
                <el-col :span="12" :xs="24" :sm="24" :md="12">
                  <el-card shadow="hover" class="chart-card">
                    <template #header>
                      <div class="card-header">
                        <span>按作者统计</span>
                        <div class="chart-actions">
                          <el-tooltip content="切换图表类型">
                            <el-button size="small" @click="toggleChartType('author')">
                              <el-icon><Operation /></el-icon>
                            </el-button>
                          </el-tooltip>
                          <el-tooltip content="下载图表">
                            <el-button size="small" @click="saveChart('author')">
                              <el-icon><Download /></el-icon>
                            </el-button>
                          </el-tooltip>
                        </div>
                      </div>
                    </template>
                    <div class="chart" ref="authorChartRef"></div>
                  </el-card>
                </el-col>
                <el-col :span="12" :xs="24" :sm="24" :md="12">
                  <el-card shadow="hover" class="chart-card">
                    <template #header>
                      <div class="card-header">
                        <span>按日期统计</span>
                        <div class="chart-actions">
                          <el-tooltip content="切换图表类型">
                            <el-button size="small" @click="toggleChartType('date')">
                              <el-icon><Operation /></el-icon>
                            </el-button>
                          </el-tooltip>
                          <el-tooltip content="下载图表">
                            <el-button size="small" @click="saveChart('date')">
                              <el-icon><Download /></el-icon>
                            </el-button>
                          </el-tooltip>
                        </div>
                      </div>
                    </template>
                    <div class="chart" ref="dateChartRef"></div>
                  </el-card>
                </el-col>
              </el-row>
              <el-row style="margin-top: 20px">
                <el-col :span="12" :xs="24" :sm="24" :md="12">
                  <el-card shadow="hover" class="chart-card">
                    <template #header>
                      <div class="card-header">
                        <span>按仓库统计</span>
                        <div class="chart-actions">
                          <el-tooltip content="切换图表类型">
                            <el-button size="small" @click="toggleChartType('repo')">
                              <el-icon><Operation /></el-icon>
                            </el-button>
                          </el-tooltip>
                          <el-tooltip content="下载图表">
                            <el-button size="small" @click="saveChart('repo')">
                              <el-icon><Download /></el-icon>
                            </el-button>
                          </el-tooltip>
                        </div>
                      </div>
                    </template>
                    <div class="chart" ref="repoChartRef"></div>
                  </el-card>
                </el-col>
                <el-col :span="12" :xs="24" :sm="24" :md="12">
                  <el-card shadow="hover" class="chart-card">
                    <template #header>
                      <div class="card-header">
                        <span>提交时间分布</span>
                        <div class="chart-actions">
                          <el-tooltip content="切换图表类型">
                            <el-button size="small" @click="toggleChartType('hour')">
                              <el-icon><Operation /></el-icon>
                            </el-button>
                          </el-tooltip>
                          <el-tooltip content="下载图表">
                            <el-button size="small" @click="saveChart('hour')">
                              <el-icon><Download /></el-icon>
                            </el-button>
                          </el-tooltip>
                        </div>
                      </div>
                    </template>
                    <div class="chart" ref="hourChartRef"></div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>

        <!-- 详细统计 -->
        <el-tab-pane label="详细统计" name="details">
          <div class="details-container">
            <el-tabs type="border-card">
              <el-tab-pane label="作者统计">
                <el-table :data="stats.authorStats" border style="width: 100%">
                  <el-table-column prop="name" label="作者" min-width="200" sortable />
                  <el-table-column prop="count" label="提交数" width="100" sortable />
                  <el-table-column prop="percentage" label="占比" width="100" sortable>
                    <template #default="scope">
                      {{ (scope.row.percentage * 100).toFixed(2) }}%
                    </template>
                  </el-table-column>
                  <el-table-column prop="filesChanged" label="文件变更" width="100" sortable />
                  <el-table-column prop="insertions" label="新增行数" width="100" sortable />
                  <el-table-column prop="deletions" label="删除行数" width="100" sortable />
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="仓库统计">
                <el-table :data="stats.repositoryStats" border style="width: 100%">
                  <el-table-column prop="name" label="仓库" min-width="200" sortable />
                  <el-table-column prop="count" label="提交数" width="100" sortable />
                  <el-table-column prop="percentage" label="占比" width="100" sortable>
                    <template #default="scope">
                      {{ (scope.row.percentage * 100).toFixed(2) }}%
                    </template>
                  </el-table-column>
                  <el-table-column prop="filesChanged" label="文件变更" width="100" sortable />
                  <el-table-column prop="insertions" label="新增行数" width="100" sortable />
                  <el-table-column prop="deletions" label="删除行数" width="100" sortable />
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="日期统计">
                <el-table :data="stats.dateStats" border style="width: 100%">
                  <el-table-column prop="name" label="日期" min-width="200" sortable />
                  <el-table-column prop="count" label="提交数" width="100" sortable />
                  <el-table-column prop="percentage" label="占比" width="100" sortable>
                    <template #default="scope">
                      {{ (scope.row.percentage * 100).toFixed(2) }}%
                    </template>
                  </el-table-column>
                  <el-table-column prop="filesChanged" label="文件变更" width="100" sortable />
                  <el-table-column prop="insertions" label="新增行数" width="100" sortable />
                  <el-table-column prop="deletions" label="删除行数" width="100" sortable />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-tab-pane>

        <!-- 导出结果 -->
        <el-tab-pane label="导出结果" name="export">
          <div class="export-container">
            <el-card shadow="hover" class="export-card">
              <template #header>
                <div class="card-header">
                  <span>导出配置</span>
                  <el-icon><Download /></el-icon>
                </div>
              </template>
              <el-form :model="exportForm" label-width="120px">
                <el-form-item label="导出格式">
                  <el-radio-group v-model="exportForm.format">
                    <el-radio :value="'csv'">CSV</el-radio>
                    <el-radio :value="'json'">JSON</el-radio>
                    <el-radio :value="'excel'">Excel</el-radio>
                    <el-radio :value="'html'">HTML</el-radio>
                    <el-radio :value="'markdown'">Markdown</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="导出内容">
                  <el-checkbox-group v-model="exportForm.content">
                    <el-checkbox :value="'commits'">提交记录</el-checkbox>
                    <el-checkbox :value="'stats'">统计结果</el-checkbox>
                    <el-checkbox :value="'charts'">图表截图</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="文件名前缀">
                  <el-input v-model="exportForm.filePrefix" placeholder="Git提交记录" />
                </el-form-item>

                <el-form-item label="导出路径">
                  <el-input v-model="exportForm.path" placeholder="请选择导出路径">
                    <template #append>
                      <el-button @click="selectExportPath">
                        <el-icon><Folder /></el-icon>
                      </el-button>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="handleExport" :loading="exporting">
                    <el-icon><Download /></el-icon> 开始导出
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { gitService } from '../../../services/GitService'
import { statsService } from '../../../services/StatsService'
import type { CommitStats, ChartType } from '../../../services/StatsService'
import {
  Document,
  Folder,
  User,
  PieChart,
  TrendCharts,
  DataAnalysis,
  Download,
  Operation,
  Files,
  Plus,
  Minus
} from '@element-plus/icons-vue'

// 选项卡和图表引用
const activeTab = ref('stats')
const authorChartRef = ref<HTMLElement>()
const dateChartRef = ref<HTMLElement>()
const repoChartRef = ref<HTMLElement>()
const hourChartRef = ref<HTMLElement>()

// 统计数据
const stats = ref<CommitStats>({
  totalCommits: 0,
  totalRepositories: 0,
  totalAuthors: 0,
  totalFilesChanged: 0,
  totalInsertions: 0,
  totalDeletions: 0,
  authorStats: [],
  dateStats: [],
  repositoryStats: [],
  hourStats: []
})

// 图表配置
const timeUnit = ref('day')
const topLimit = ref(10)
const chartTypes = reactive({
  author: 'pie' as ChartType,
  date: 'line' as ChartType,
  repo: 'bar' as ChartType,
  hour: 'bar' as ChartType
})

// 导出表单
const exportForm = reactive({
  format: 'excel',
  content: ['commits', 'stats'],
  path: '',
  filePrefix: 'Git提交记录'
})

// 状态标志
const exporting = ref(false)

// 图表实例
let authorChart: echarts.ECharts | null = null
let dateChart: echarts.ECharts | null = null
let repoChart: echarts.ECharts | null = null
let hourChart: echarts.ECharts | null = null

// 窗口大小变化处理函数
const handleResize = () => {
  nextTick(() => {
    authorChart?.resize()
    dateChart?.resize()
    repoChart?.resize()
    hourChart?.resize()
  })
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    if (authorChartRef.value) {
      authorChart = echarts.init(authorChartRef.value)
    }
    if (dateChartRef.value) {
      dateChart = echarts.init(dateChartRef.value)
    }
    if (repoChartRef.value) {
      repoChart = echarts.init(repoChartRef.value)
    }
    if (hourChartRef.value) {
      hourChart = echarts.init(hourChartRef.value)
    }
    updateCharts()
  })
}

// 更新图表
const updateCharts = () => {
  try {
    const chartData = statsService.getChartData(
      stats.value,
      timeUnit.value,
      topLimit.value,
      chartTypes
    )

    if (authorChart) {
      authorChart.setOption(chartData.authorChart, true)
    }
    if (dateChart) {
      dateChart.setOption(chartData.dateChart, true)
    }
    if (repoChart) {
      repoChart.setOption(chartData.repositoryChart, true)
    }
    if (hourChart) {
      hourChart.setOption(chartData.hourChart, true)
    }
  } catch (error) {
    console.error('更新图表错误:', error)
  }
}

// 切换图表类型
const toggleChartType = (chartName: 'author' | 'date' | 'repo' | 'hour') => {
  const types: ChartType[] = ['pie', 'bar', 'line']
  const currentIndex = types.indexOf(chartTypes[chartName])
  const nextIndex = (currentIndex + 1) % types.length
  chartTypes[chartName] = types[nextIndex]
  updateCharts()
}

// 保存图表为图片
const saveChart = (chartName: 'author' | 'date' | 'repo' | 'hour') => {
  try {
    let chart: echarts.ECharts | null = null

    switch (chartName) {
      case 'author':
        chart = authorChart
        break
      case 'date':
        chart = dateChart
        break
      case 'repo':
        chart = repoChart
        break
      case 'hour':
        chart = hourChart
        break
    }

    if (chart) {
      const dataURL = chart.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      })

      // 创建下载链接
      const link = document.createElement('a')
      link.download = `git-chart-${chartName}-${dayjs().format('YYYYMMDDHHmmss')}.png`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      ElMessage.success('图表已保存')
    }
  } catch (error) {
    console.error('保存图表错误:', error)
    ElMessage.error('保存图表失败')
  }
}

// 加载数据
const loadData = () => {
  try {
    const savedData = localStorage.getItem('gitCommits')
    if (savedData) {
      const commits = JSON.parse(savedData)
      stats.value = statsService.calculateStats(commits)
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

// 处理标签页切换
const handleTabChange = (tab: string) => {
  if (tab === 'stats') {
    nextTick(() => {
      handleResize()
    })
  }
}

// 选择导出路径
const selectExportPath = async () => {
  try {
    const result = await window.api.selectDirectory()
    if (result) {
      exportForm.path = result
    }
  } catch (error) {
    console.error('选择目录失败:', error)
    ElMessage.error('选择目录失败')
  }
}

// 处理导出
const handleExport = async () => {
  if (!exportForm.path) {
    ElMessage.warning('请选择导出路径')
    return
  }

  if (exportForm.content.length === 0) {
    ElMessage.warning('请选择导出内容')
    return
  }

  try {
    exporting.value = true
    const savedData = localStorage.getItem('gitCommits')
    if (!savedData) {
      ElMessage.warning('没有可导出的数据')
      return
    }

    const commits = JSON.parse(savedData)

    // 生成文件名
    const timestamp = dayjs().format('YYYYMMDD_HHmmss')
    const fileName = `${exportForm.filePrefix}_${timestamp}`

    const result = await gitService.exportData(
      commits,
      exportForm.format,
      exportForm.path,
      fileName
    )

    if (result) {
      ElMessage.success(`数据导出成功: ${result}`)
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  loadData()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  authorChart?.dispose()
  dateChart?.dispose()
  repoChart?.dispose()
  hourChart?.dispose()
})

// 监听窗口大小变化
watch(
  () => [stats.value.totalCommits, timeUnit.value, topLimit.value],
  () => updateCharts()
)
</script>

<style scoped>
.router-view-container {
  width: 100%;
  padding: var(--spacing-md);
}

.results {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-tabs {
  min-height: calc(100vh - 180px);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

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

.export-container {
  padding: var(--spacing-lg) 0;
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.export-card {
  max-width: 600px;
  margin: 0 auto;
  transition: all var(--transition-normal);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.export-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.details-container {
  padding: var(--spacing-lg) 0;
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Element Plus 样式覆盖 */
:deep(.el-tabs--border-card) {
  border-radius: var(--radius-md);
  border: none;
  box-shadow: var(--shadow-md);
}

:deep(.el-tabs--border-card > .el-tabs__header) {
  background-color: var(--bg-color);
  border-bottom: var(--border);
}

:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active) {
  background-color: white;
  border-right-color: var(--border-color);
  border-left-color: var(--border-color);
  color: var(--primary-color);
  font-weight: var(--font-weight-semibold);
}

:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item) {
  transition: all var(--transition-normal);
}

:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item:hover) {
  color: var(--primary-color);
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--border-color);
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: var(--primary-color);
}

:deep(.el-table) {
  --el-table-border-color: var(--border-color);
  --el-table-header-bg-color: var(--bg-color);
  --el-table-row-hover-bg-color: var(--hover-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
}

:deep(.el-table th) {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  background-color: var(--bg-color);
}

:deep(.el-table .el-table__header-wrapper) {
  border-bottom: var(--border);
}

:deep(.el-row) {
  margin-bottom: var(--spacing-md);
}

/* 卡片类型差异化样式 */
.el-col:nth-child(1) .stats-card {
  background: linear-gradient(135deg, #f8f9fa, #edf2ff);
}

.el-col:nth-child(2) .stats-card {
  background: linear-gradient(135deg, #f8f9fa, #e6f7ff);
}

.el-col:nth-child(3) .stats-card {
  background: linear-gradient(135deg, #f8f9fa, #f0fdf4);
}

.el-col:nth-child(4) .stats-card {
  background: linear-gradient(135deg, #f8f9fa, #fff7ed);
}

.el-col:nth-child(5) .stats-card {
  background: linear-gradient(135deg, #f8f9fa, #f0fdfa);
}

.el-col:nth-child(6) .stats-card {
  background: linear-gradient(135deg, #f8f9fa, #fef2f2);
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

/* 导出表单样式优化 */
:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

:deep(.el-form-item) {
  margin-bottom: var(--spacing-lg);
}

:deep(.el-form-item__label) {
  font-weight: var(--font-weight-medium);
}

:deep(.el-input__wrapper) {
  box-shadow:
    var(--shadow-inset),
    0 0 0 1px var(--border-color) inset !important;
  transition: all var(--transition-fast);
}

:deep(.el-input__wrapper:hover) {
  box-shadow:
    var(--shadow-inset),
    0 0 0 1px var(--primary-color) inset !important;
}

:deep(.el-radio__input.is-checked .el-radio__inner),
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

/* 表格内百分比可视化 */
:deep(.percentage-cell) {
  position: relative;
}

:deep(.percentage-cell .value) {
  position: relative;
  z-index: 1;
}

:deep(.percentage-cell .bar) {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: var(--hover-bg);
  z-index: 0;
  opacity: 0.7;
  transition: width 1s ease-out;
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .stats-card {
    margin-bottom: var(--spacing-md);
  }

  .chart {
    height: 300px;
  }

  .export-card {
    max-width: 100%;
  }
}
</style>
