<template>
  <div class="reports-container page-container">
    <div class="reports-header">
      <div class="filter-container">
        <el-select v-model="selectedRepo" placeholder="选择仓库" class="filter-item">
          <el-option
            v-for="repo in repositories"
            :key="repo.id"
            :label="repo.name"
            :value="repo.id"
          />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="filter-item"
        />
        <el-button type="primary" @click="generatePreview">
          <el-icon class="mr-5"><RefreshRight /></el-icon>
          生成预览
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="reports-tabs">
      <el-tab-pane label="提交活动" name="commit-activity">
        <el-card v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>提交活动报告</span>
              <div class="header-actions">
                <el-button type="success" @click="exportReport('excel')">
                  <el-icon class="mr-5"><Document /></el-icon>
                  导出 Excel
                </el-button>
                <el-button type="danger" @click="exportReport('pdf')">
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
      </el-tab-pane>

      <el-tab-pane label="代码变更" name="code-changes">
        <el-card v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>代码变更报告</span>
              <div class="header-actions">
                <el-button type="success" @click="exportReport('excel')">
                  <el-icon class="mr-5"><Document /></el-icon>
                  导出 Excel
                </el-button>
                <el-button type="danger" @click="exportReport('pdf')">
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
      </el-tab-pane>

      <el-tab-pane label="项目进度" name="project-progress">
        <el-card v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>项目进度报告</span>
              <div class="header-actions">
                <el-button type="success" @click="exportReport('excel')">
                  <el-icon class="mr-5"><Document /></el-icon>
                  导出 Excel
                </el-button>
                <el-button type="danger" @click="exportReport('pdf')">
                  <el-icon class="mr-5"><Printer /></el-icon>
                  导出 PDF
                </el-button>
              </div>
            </div>
          </template>

          <div class="reports-preview">
            <div class="chart-container">
              <h3 class="chart-title">项目进度</h3>
              <div ref="progressChart" class="chart"></div>
            </div>

            <div class="chart-container">
              <h3 class="chart-title">任务完成状态</h3>
              <div ref="tasksChart" class="chart"></div>
            </div>
          </div>

          <h3 class="section-title">里程碑状态</h3>
          <el-timeline>
            <el-timeline-item
              v-for="milestone in milestones"
              :key="milestone.id"
              :timestamp="milestone.date"
              :type="getMilestoneType(milestone.status)"
              :hollow="milestone.status === 'pending'"
            >
              <h4>{{ milestone.title }}</h4>
              <p>{{ milestone.description }}</p>
              <el-tag :type="getMilestoneTagType(milestone.status)">
                {{ milestone.status }}
              </el-tag>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { RefreshRight, Document, Printer } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, HeatmapChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import dayjs from 'dayjs'
// 导入Excel处理库
import ExcelJS from 'exceljs'
// 导入PDF处理库
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// 注册ECharts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
  LineChart,
  PieChart,
  HeatmapChart,
  CanvasRenderer
])

// 图表引用
const commitFrequencyChart = ref<HTMLElement | null>(null)
const commitTimeChart = ref<HTMLElement | null>(null)
const fileHeatmapChart = ref<HTMLElement | null>(null)
const changesTrendChart = ref<HTMLElement | null>(null)
const progressChart = ref<HTMLElement | null>(null)
const tasksChart = ref<HTMLElement | null>(null)

// 示例仓库数据
const repositories = [
  { id: 1, name: 'GitCommit' },
  { id: 2, name: 'WebProject' },
  { id: 3, name: 'APIService' }
]

// 状态变量
const selectedRepo = ref(1)
const activeTab = ref('commit-activity')
const loading = ref(false)
const dateRange = ref([dayjs().subtract(30, 'day').toDate(), dayjs().toDate()])

// 提交统计数据
const commitStats = reactive({
  totalCommits: 184,
  mostActiveDay: '2023-10-15',
  avgCommitsPerDay: 6.13,
  contributorsCount: 8,
  addedLines: 12475,
  deletedLines: 5823,
  modifiedFiles: 156,
  avgCommitSize: '67.8 行'
})

// 贡献者数据
const topContributors = [
  {
    name: '张三',
    email: 'zhangsan@example.com',
    commits: 73,
    additions: 5240,
    deletions: 2136,
    percentage: 39,
    color: '#67C23A'
  },
  {
    name: '李四',
    email: 'lisi@example.com',
    commits: 56,
    additions: 3684,
    deletions: 1728,
    percentage: 30,
    color: '#409EFF'
  },
  {
    name: '王五',
    email: 'wangwu@example.com',
    commits: 32,
    additions: 2105,
    deletions: 1125,
    percentage: 17,
    color: '#E6A23C'
  },
  {
    name: '赵六',
    email: 'zhaoliu@example.com',
    commits: 23,
    additions: 1446,
    deletions: 834,
    percentage: 12,
    color: '#F56C6C'
  }
]

// 文件变更数据
const topChangedFiles = [
  {
    path: 'src/renderer/src/components/Table.vue',
    changes: 28,
    additions: 542,
    deletions: 238,
    changeFrequency: '高频'
  },
  {
    path: 'src/renderer/src/views/Dashboard.vue',
    changes: 24,
    additions: 486,
    deletions: 210,
    changeFrequency: '高频'
  },
  {
    path: 'src/renderer/src/store/index.ts',
    changes: 18,
    additions: 326,
    deletions: 187,
    changeFrequency: '中频'
  },
  {
    path: 'src/renderer/src/api/repository.ts',
    changes: 15,
    additions: 245,
    deletions: 132,
    changeFrequency: '中频'
  },
  {
    path: 'src/renderer/src/components/Header.vue',
    changes: 12,
    additions: 168,
    deletions: 95,
    changeFrequency: '中频'
  },
  {
    path: 'src/renderer/src/utils/formatters.ts',
    changes: 8,
    additions: 112,
    deletions: 64,
    changeFrequency: '低频'
  }
]

// 里程碑数据
const milestones = [
  {
    id: 1,
    title: '项目启动',
    description: '完成项目基础架构设置和初始化',
    date: '2023-09-01',
    status: 'completed'
  },
  {
    id: 2,
    title: '基础功能开发',
    description: '实现核心功能和基础UI',
    date: '2023-10-15',
    status: 'completed'
  },
  {
    id: 3,
    title: '高级功能开发',
    description: '实现数据分析和报告功能',
    date: '2023-11-30',
    status: 'in-progress'
  },
  {
    id: 4,
    title: '测试与优化',
    description: '功能测试和性能优化',
    date: '2023-12-15',
    status: 'pending'
  },
  {
    id: 5,
    title: '正式发布',
    description: '产品正式发布和部署',
    date: '2023-12-31',
    status: 'pending'
  }
]

// 初始化提交频率图表
const initCommitFrequencyChart = () => {
  if (!commitFrequencyChart.value) return

  const chartDom = commitFrequencyChart.value
  const chart = echarts.init(chartDom)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['提交数量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '提交数量',
        type: 'bar',
        data: [12, 24, 36, 42, 28, 31, 38, 45, 39, 42, 28, 19],
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }

  chart.setOption(option)

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化提交时间图表
const initCommitTimeChart = () => {
  if (!commitTimeChart.value) return

  const chartDom = commitTimeChart.value
  const chart = echarts.init(chartDom)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom'
    },
    series: [
      {
        name: '提交时间',
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
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 42, name: '上午 (6-12点)', itemStyle: { color: '#67C23A' } },
          { value: 68, name: '下午 (12-18点)', itemStyle: { color: '#409EFF' } },
          { value: 56, name: '晚上 (18-24点)', itemStyle: { color: '#E6A23C' } },
          { value: 18, name: '凌晨 (0-6点)', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  }

  chart.setOption(option)

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化文件修改热图
const initFileHeatmapChart = () => {
  if (!fileHeatmapChart.value) return

  const chartDom = fileHeatmapChart.value
  const chart = echarts.init(chartDom)

  // 生成示例数据
  const hours = [
    '12a',
    '1a',
    '2a',
    '3a',
    '4a',
    '5a',
    '6a',
    '7a',
    '8a',
    '9a',
    '10a',
    '11a',
    '12p',
    '1p',
    '2p',
    '3p',
    '4p',
    '5p',
    '6p',
    '7p',
    '8p',
    '9p',
    '10p',
    '11p'
  ]
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

  const data = []
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      // 工作日工作时间更频繁
      let value = Math.round(Math.random() * 10)
      if (i < 5 && j >= 9 && j <= 18) {
        value = Math.round(Math.random() * 20)
      }
      // 周末和夜间较少
      if ((i >= 5 || j < 8 || j > 22) && Math.random() > 0.5) {
        value = Math.round(Math.random() * 5)
      }
      data.push([j, i, value])
    }
  }

  const option = {
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `${days[params.value[1]]} ${hours[params.value[0]]}<br>修改次数: ${params.value[2]}`
      }
    },
    grid: {
      height: '50%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 20,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%'
    },
    series: [
      {
        name: '文件修改频率',
        type: 'heatmap',
        data: data,
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  chart.setOption(option)

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化变更趋势图表
const initChangesTrendChart = () => {
  if (!changesTrendChart.value) return

  const chartDom = changesTrendChart.value
  const chart = echarts.init(chartDom)

  // 生成示例数据
  const dates = []
  const additions = []
  const deletions = []

  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() - 30)

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    dates.push(dayjs(date).format('MM-DD'))

    // 模拟增加行和删除行的数据
    additions.push(Math.round(Math.random() * 300 + 100))
    deletions.push(-Math.round(Math.random() * 200 + 50))
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['增加', '删除']
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
        data: dates
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '增加',
        type: 'bar',
        stack: 'total',
        label: {
          show: false
        },
        emphasis: {
          focus: 'series'
        },
        data: additions,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '删除',
        type: 'bar',
        stack: 'total',
        label: {
          show: false
        },
        emphasis: {
          focus: 'series'
        },
        data: deletions,
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }

  chart.setOption(option)

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化项目进度图表
const initProgressChart = () => {
  if (!progressChart.value) return

  const chartDom = progressChart.value
  const chart = echarts.init(chartDom)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['计划进度', '实际进度']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    yAxis: {
      type: 'category',
      data: ['功能开发', '界面设计', '后端API', '数据库', '测试', '文档']
    },
    series: [
      {
        name: '计划进度',
        type: 'bar',
        data: [90, 95, 85, 80, 70, 60],
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '实际进度',
        type: 'bar',
        data: [95, 90, 80, 85, 60, 50],
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }

  chart.setOption(option)

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化任务完成状态图表
const initTasksChart = () => {
  if (!tasksChart.value) return

  const chartDom = tasksChart.value
  const chart = echarts.init(chartDom)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['已完成', '进行中', '待开始', '已延期']
    },
    series: [
      {
        name: '任务状态',
        type: 'pie',
        radius: '70%',
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 42, name: '已完成', itemStyle: { color: '#67C23A' } },
          { value: 28, name: '进行中', itemStyle: { color: '#409EFF' } },
          { value: 18, name: '待开始', itemStyle: { color: '#E6A23C' } },
          { value: 12, name: '已延期', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  }

  chart.setOption(option)

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 获取变更频率类型
const getChangeFrequencyType = (frequency: string) => {
  switch (frequency) {
    case '高频':
      return 'danger'
    case '中频':
      return 'warning'
    case '低频':
      return 'info'
    default:
      return 'info'
  }
}

// 获取里程碑类型
const getMilestoneType = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in-progress':
      return 'primary'
    case 'pending':
      return 'info'
    default:
      return 'info'
  }
}

// 获取里程碑标签类型
const getMilestoneTagType = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in-progress':
      return 'primary'
    case 'pending':
      return 'info'
    default:
      return 'info'
  }
}

// 生成报告预览
const generatePreview = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false

    // 初始化图表
    initCommitFrequencyChart()
    initCommitTimeChart()
    initFileHeatmapChart()
    initChangesTrendChart()
    initProgressChart()
    initTasksChart()

    ElMessage.success('报告预览已生成')
  }, 1500)
}

// 导出报告
const exportReport = async (type: 'excel' | 'pdf') => {
  const loadingInstance = ElLoading.service({
    text: `正在导出${type === 'excel' ? 'Excel' : 'PDF'}文件...`,
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    if (type === 'excel') {
      await exportToExcel()
    } else {
      await exportToPDF()
    }
    ElMessage.success(`报告已导出为${type === 'excel' ? 'Excel' : 'PDF'}文件`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error(`导出${type === 'excel' ? 'Excel' : 'PDF'}文件失败`)
  } finally {
    loadingInstance.close()
  }
}

// 导出Excel实现
const exportToExcel = async () => {
  // 创建工作簿
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'GitCommit'
  workbook.lastModifiedBy = 'GitCommit'
  workbook.created = new Date()
  workbook.modified = new Date()

  // 添加提交活动工作表
  const activitySheet = workbook.addWorksheet('提交活动')

  // 设置标题
  activitySheet.addRow(['GitCommit 提交活动报告'])
  activitySheet.getCell('A1').font = { size: 14, bold: true }
  activitySheet.addRow([`生成日期: ${dayjs().format('YYYY-MM-DD')}`])
  activitySheet.addRow([
    `日期范围: ${dayjs(dateRange.value[0]).format('YYYY-MM-DD')} 至 ${dayjs(dateRange.value[1]).format('YYYY-MM-DD')}`
  ])
  activitySheet.addRow([])

  // 添加提交统计
  activitySheet.addRow(['提交统计摘要'])
  activitySheet.getCell('A5').font = { size: 12, bold: true }

  activitySheet.addRow(['总提交数', commitStats.totalCommits])
  activitySheet.addRow(['最活跃日期', commitStats.mostActiveDay])
  activitySheet.addRow(['平均每日提交', commitStats.avgCommitsPerDay])
  activitySheet.addRow(['贡献者数量', commitStats.contributorsCount])
  activitySheet.addRow(['添加的行数', commitStats.addedLines])
  activitySheet.addRow(['删除的行数', commitStats.deletedLines])
  activitySheet.addRow(['修改的文件数', commitStats.modifiedFiles])
  activitySheet.addRow(['平均提交大小', commitStats.avgCommitSize])
  activitySheet.addRow([])

  // 添加贡献者数据
  activitySheet.addRow(['贡献者排名'])
  activitySheet.getCell('A15').font = { size: 12, bold: true }

  // 添加表头
  activitySheet.addRow(['序号', '贡献者', '邮箱', '提交数', '添加行数', '删除行数', '贡献占比'])

  // 添加数据
  topContributors.forEach((contributor, index) => {
    activitySheet.addRow([
      index + 1,
      contributor.name,
      contributor.email,
      contributor.commits,
      contributor.additions,
      contributor.deletions,
      `${contributor.percentage}%`
    ])
  })

  // 生成文件并下载
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `GitCommit提交活动报告_${dayjs().format('YYYYMMDD')}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 导出PDF实现
const exportToPDF = async () => {
  // 创建PDF文档
  const doc = new jsPDF()

  // 设置标题
  doc.setFontSize(18)
  doc.text('GitCommit 提交活动报告', 15, 15)

  doc.setFontSize(11)
  doc.text(`生成日期: ${dayjs().format('YYYY-MM-DD')}`, 15, 25)
  doc.text(
    `日期范围: ${dayjs(dateRange.value[0]).format('YYYY-MM-DD')} 至 ${dayjs(dateRange.value[1]).format('YYYY-MM-DD')}`,
    15,
    32
  )

  // 添加提交统计表格
  doc.setFontSize(14)
  doc.text('提交统计摘要', 15, 45)

  const statsData = [
    ['总提交数', commitStats.totalCommits.toString()],
    ['最活跃日期', commitStats.mostActiveDay],
    ['平均每日提交', commitStats.avgCommitsPerDay.toString()],
    ['贡献者数量', commitStats.contributorsCount.toString()],
    ['添加的行数', commitStats.addedLines.toString()],
    ['删除的行数', commitStats.deletedLines.toString()],
    ['修改的文件数', commitStats.modifiedFiles.toString()],
    ['平均提交大小', commitStats.avgCommitSize]
  ]

  doc.autoTable({
    startY: 50,
    head: [['项目', '值']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202], textColor: 255 }
  })

  // 添加贡献者排名
  doc.setFontSize(14)
  doc.text('贡献者排名', 15, 125)

  const contributorsData = topContributors.map((contributor, index) => [
    (index + 1).toString(),
    contributor.name,
    contributor.email,
    contributor.commits.toString(),
    contributor.additions.toString(),
    contributor.deletions.toString(),
    `${contributor.percentage}%`
  ])

  doc.autoTable({
    startY: 130,
    head: [['序号', '贡献者', '邮箱', '提交数', '添加行数', '删除行数', '贡献占比']],
    body: contributorsData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202], textColor: 255 }
  })

  // 保存文件
  doc.save(`GitCommit提交活动报告_${dayjs().format('YYYYMMDD')}.pdf`)
}

// 监听标签页变化，加载对应图表
watch(activeTab, (newValue) => {
  nextTick(() => {
    if (newValue === 'commit-activity') {
      if (commitFrequencyChart.value && commitTimeChart.value) {
        initCommitFrequencyChart()
        initCommitTimeChart()
      }
    } else if (newValue === 'code-changes') {
      if (fileHeatmapChart.value && changesTrendChart.value) {
        initFileHeatmapChart()
        initChangesTrendChart()
      }
    } else if (newValue === 'project-progress') {
      if (progressChart.value && tasksChart.value) {
        initProgressChart()
        initTasksChart()
      }
    }
  })
})

// 组件挂载后
onMounted(() => {
  // 延迟加载图表，确保DOM已渲染
  setTimeout(() => {
    if (activeTab.value === 'commit-activity') {
      initCommitFrequencyChart()
      initCommitTimeChart()
    }
  }, 500)
})
</script>

<style scoped>
.reports-container {
  width: 100%;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 180px;
}

.reports-tabs {
  margin-top: 20px;
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

@media (max-width: 768px) {
  .reports-preview {
    grid-template-columns: 1fr;
  }

  .chart {
    height: 250px;
  }

  .filter-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    width: 100%;
  }
}
</style>
