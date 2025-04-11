<template>
  <div class="contributors-container">
    <div class="contributors-header">
      <h2 class="page-title">贡献者分析</h2>
      <div class="contributors-actions">
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
        <el-button type="primary" @click="analyzeContributors">
          <el-icon class="mr-5"><DataAnalysis /></el-icon>
          分析
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stat-item">
            <div class="stat-icon contributors-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ contributorStats.totalContributors }}</div>
              <div class="stat-label">贡献者总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stat-item">
            <div class="stat-icon commits-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ contributorStats.totalCommits }}</div>
              <div class="stat-label">提交总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stat-item">
            <div class="stat-icon additions-icon">
              <el-icon><Plus /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(contributorStats.totalAdditions) }}</div>
              <div class="stat-label">增加行数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stat-item">
            <div class="stat-icon deletions-icon">
              <el-icon><Minus /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(contributorStats.totalDeletions) }}</div>
              <div class="stat-label">删除行数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="16">
        <el-card class="contributors-list-card">
          <template #header>
            <div class="card-header">
              <span>贡献者列表</span>
              <div class="header-actions">
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索贡献者"
                  prefix-icon="Search"
                  class="search-input"
                />
                <el-select
                  v-model="sortBy"
                  size="default"
                  placeholder="排序方式"
                  style="width: 140px"
                >
                  <el-option label="提交数" value="commits" />
                  <el-option label="增加行数" value="additions" />
                  <el-option label="删除行数" value="deletions" />
                  <el-option label="最近活跃" value="lastActive" />
                </el-select>
              </div>
            </div>
          </template>

          <el-table
            v-loading="loading"
            :data="filteredContributors"
            style="width: 100%"
            @row-click="selectContributor"
          >
            <el-table-column label="贡献者" min-width="200">
              <template #default="scope">
                <div class="contributor-info">
                  <el-avatar :size="36" class="contributor-avatar">
                    {{ getInitials(scope.row.name) }}
                  </el-avatar>
                  <div class="contributor-details">
                    <div class="contributor-name">{{ scope.row.name }}</div>
                    <div class="contributor-email text-secondary">{{ scope.row.email }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="commits" label="提交数" width="100" sortable />
            <el-table-column label="代码行数变更" width="160">
              <template #default="scope">
                <div class="line-changes">
                  <span class="additions">+{{ formatNumber(scope.row.additions) }}</span>
                  <span class="deletions">-{{ formatNumber(scope.row.deletions) }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="提交占比" width="180">
              <template #default="scope">
                <el-progress
                  :percentage="getCommitPercentage(scope.row.commits)"
                  :color="getContributorColor(scope.row.id)"
                />
              </template>
            </el-table-column>
            <el-table-column label="最近活跃" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.lastActive) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="charts-card">
          <template #header>
            <div class="card-header">
              <span>提交比例</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="commitsPieChart" class="chart"></div>
          </div>
        </el-card>

        <el-card v-if="selectedContributor" class="contributor-detail-card">
          <template #header>
            <div class="card-header">
              <span>贡献者详情</span>
              <el-button @click="clearSelectedContributor" text>
                <el-icon><CloseBold /></el-icon>
              </el-button>
            </div>
          </template>

          <div class="contributor-profile">
            <div class="contributor-header">
              <el-avatar :size="60" class="large-avatar">
                {{ getInitials(selectedContributor.name) }}
              </el-avatar>
              <div class="contributor-meta">
                <h3 class="contributor-name">{{ selectedContributor.name }}</h3>
                <p class="contributor-email">{{ selectedContributor.email }}</p>
              </div>
            </div>

            <div class="contributor-stats">
              <div class="stat-box">
                <div class="stat-value">{{ selectedContributor.commits }}</div>
                <div class="stat-label">提交数</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">{{ formatNumber(selectedContributor.additions) }}</div>
                <div class="stat-label">增加行数</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">{{ formatNumber(selectedContributor.deletions) }}</div>
                <div class="stat-label">删除行数</div>
              </div>
            </div>

            <div ref="activityChart" class="activity-chart"></div>

            <div class="contributor-detail-section">
              <h4>主要工作文件</h4>
              <el-table :data="selectedContributor.topFiles" size="small">
                <el-table-column prop="filename" label="文件名" min-width="200" />
                <el-table-column prop="changes" label="变更次数" width="100" />
              </el-table>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import {
  User,
  Calendar,
  Plus,
  Minus,
  DataAnalysis,
  Search,
  CloseBold
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts/core'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
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
  LineChart,
  CanvasRenderer
])

// 示例仓库数据
const repositories = [
  { id: 1, name: 'GitCommit' },
  { id: 2, name: 'WebProject' },
  { id: 3, name: 'APIService' }
]

// 筛选器
const selectedRepo = ref(1)
const dateRange = ref(null)
const searchQuery = ref('')
const sortBy = ref('commits')
const loading = ref(false)

// 贡献者数据
const contributors = ref([
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    commits: 432,
    additions: 28540,
    deletions: 12480,
    lastActive: new Date('2023-04-08'),
    activity: [12, 18, 8, 23, 29, 15, 19, 26, 35, 10, 22, 14],
    topFiles: [
      { filename: 'src/components/Dashboard.vue', changes: 45 },
      { filename: 'src/utils/api.js', changes: 38 },
      { filename: 'src/store/index.js', changes: 27 },
      { filename: 'src/views/Home.vue', changes: 23 },
      { filename: 'src/router/index.js', changes: 18 }
    ]
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    commits: 298,
    additions: 15620,
    deletions: 8730,
    lastActive: new Date('2023-04-07'),
    activity: [8, 15, 22, 19, 10, 16, 25, 12, 8, 18, 23, 15],
    topFiles: [
      { filename: 'src/components/UserProfile.vue', changes: 42 },
      { filename: 'src/services/auth.js', changes: 35 },
      { filename: 'src/views/Login.vue', changes: 28 },
      { filename: 'src/styles/main.css', changes: 23 },
      { filename: 'src/utils/helpers.js', changes: 14 }
    ]
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    commits: 157,
    additions: 9845,
    deletions: 4328,
    lastActive: new Date('2023-04-05'),
    activity: [5, 8, 12, 15, 7, 10, 14, 9, 6, 11, 9, 7],
    topFiles: [
      { filename: 'src/components/Table.vue', changes: 32 },
      { filename: 'src/utils/format.js', changes: 25 },
      { filename: 'src/services/data.js', changes: 19 },
      { filename: 'src/views/Reports.vue', changes: 15 },
      { filename: 'tests/unit/utils.spec.js', changes: 12 }
    ]
  },
  {
    id: 4,
    name: '赵六',
    email: 'zhaoliu@example.com',
    commits: 126,
    additions: 7652,
    deletions: 3291,
    lastActive: new Date('2023-04-04'),
    activity: [4, 7, 9, 12, 6, 8, 11, 5, 9, 13, 7, 5],
    topFiles: [
      { filename: 'src/components/Charts.vue', changes: 28 },
      { filename: 'src/utils/charts.js', changes: 22 },
      { filename: 'src/views/Analytics.vue', changes: 18 },
      { filename: 'src/styles/charts.css', changes: 14 },
      { filename: 'tests/unit/charts.spec.js', changes: 10 }
    ]
  },
  {
    id: 5,
    name: '钱七',
    email: 'qianqi@example.com',
    commits: 89,
    additions: 4325,
    deletions: 2156,
    lastActive: new Date('2023-04-01'),
    activity: [3, 5, 7, 8, 4, 6, 9, 5, 4, 7, 6, 4],
    topFiles: [
      { filename: 'src/components/Forms.vue', changes: 20 },
      { filename: 'src/utils/validation.js', changes: 18 },
      { filename: 'src/views/Settings.vue', changes: 15 },
      { filename: 'src/styles/forms.css', changes: 12 },
      { filename: 'tests/unit/forms.spec.js', changes: 8 }
    ]
  }
])

// 汇总统计
const contributorStats = reactive({
  totalContributors: contributors.value.length,
  totalCommits: contributors.value.reduce((sum, contributor) => sum + contributor.commits, 0),
  totalAdditions: contributors.value.reduce((sum, contributor) => sum + contributor.additions, 0),
  totalDeletions: contributors.value.reduce((sum, contributor) => sum + contributor.deletions, 0)
})

// 选中的贡献者
const selectedContributor = ref(null)

// 排序和筛选后的贡献者列表
const filteredContributors = computed(() => {
  let result = contributors.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (c) => c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query)
    )
  }

  result = [...result].sort((a, b) => {
    switch (sortBy.value) {
      case 'commits':
        return b.commits - a.commits
      case 'additions':
        return b.additions - a.additions
      case 'deletions':
        return b.deletions - a.deletions
      case 'lastActive':
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      default:
        return b.commits - a.commits
    }
  })

  return result
})

// 图表相关
const commitsPieChart = ref(null)
const activityChart = ref(null)

// 获取名字首字母作为头像
const getInitials = (name) => {
  return name.charAt(0).toUpperCase()
}

// 格式化数字
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 格式化日期
const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 计算提交百分比
const getCommitPercentage = (commits) => {
  return Math.round((commits / contributorStats.totalCommits) * 100)
}

// 获取贡献者标识颜色
const getContributorColor = (id) => {
  const colors = ['#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', '#7209b7']
  return colors[(id - 1) % colors.length]
}

// 选择贡献者
const selectContributor = (row) => {
  selectedContributor.value = row
  initActivityChart()
}

// 清除选中贡献者
const clearSelectedContributor = () => {
  selectedContributor.value = null
}

// 初始化提交占比图表
const initCommitsPieChart = () => {
  if (!commitsPieChart.value) return

  const chart = echarts.init(commitsPieChart.value)

  const data = contributors.value.map((c) => ({
    name: c.name,
    value: c.commits,
    itemStyle: {
      color: getContributorColor(c.id)
    }
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: contributors.value.map((c) => c.name)
    },
    series: [
      {
        name: '提交数',
        type: 'pie',
        radius: ['40%', '70%'],
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
        data: data
      }
    ]
  }

  chart.setOption(option)

  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化活动图表
const initActivityChart = () => {
  if (!activityChart.value || !selectedContributor.value) return

  const chart = echarts.init(activityChart.value)

  const months = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月'
  ]

  const option = {
    title: {
      text: '近12个月活动',
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '提交数',
        type: 'line',
        data: selectedContributor.value.activity,
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        color: getContributorColor(selectedContributor.value.id)
      }
    ]
  }

  chart.setOption(option)

  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 分析贡献者
const analyzeContributors = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
    ElMessage.success('贡献者分析已完成')
  }, 800)
}

// 组件挂载后初始化图表
onMounted(() => {
  initCommitsPieChart()
})
</script>

<style scoped>
.contributors-container {
  width: 100%;
}

.contributors-header {
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

.contributors-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 180px;
}

.stats-row {
  margin-bottom: 20px;
}

.content-row {
  margin-bottom: 20px;
}

.stats-card {
  margin-bottom: 0;
}

.stat-item {
  display: flex;
  align-items: center;
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

.stat-icon.contributors-icon {
  background-color: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}

.stat-icon.commits-icon {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.stat-icon.additions-icon {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.stat-icon.deletions-icon {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
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

.contributors-list-card,
.charts-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 200px;
}

.contributor-info {
  display: flex;
  align-items: center;
}

.contributor-avatar {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
  margin-right: 12px;
}

.contributor-details {
  display: flex;
  flex-direction: column;
}

.contributor-name {
  font-weight: var(--font-weight-medium);
}

.contributor-email {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.line-changes {
  display: flex;
  gap: 8px;
}

.additions {
  color: #2ecc71;
}

.deletions {
  color: #e74c3c;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.chart {
  width: 100%;
  height: 100%;
}

.contributor-detail-card {
  margin-bottom: 20px;
}

.contributor-profile {
  padding: 10px 0;
}

.contributor-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.large-avatar {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
  margin-right: 15px;
}

.contributor-meta {
  flex: 1;
}

.contributor-stats {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-box {
  flex: 1;
  background-color: var(--bg-color);
  padding: 15px;
  border-radius: var(--radius-md);
  text-align: center;
}

.activity-chart {
  height: 200px;
  margin-bottom: 20px;
}

.contributor-detail-section {
  margin-top: 20px;
}

.contributor-detail-section h4 {
  margin-bottom: 10px;
  color: var(--text-primary);
}

.mr-5 {
  margin-right: 5px;
}

.text-secondary {
  color: var(--text-secondary);
}

/* 暗色主题适配 */
[data-theme='dark'] .stat-icon.contributors-icon {
  background-color: rgba(76, 201, 240, 0.15);
  color: #4cc9f0;
}

[data-theme='dark'] .stat-icon.commits-icon {
  background-color: rgba(52, 152, 219, 0.15);
  color: #3498db;
}

[data-theme='dark'] .stat-icon.additions-icon {
  background-color: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
}

[data-theme='dark'] .stat-icon.deletions-icon {
  background-color: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}
</style>
