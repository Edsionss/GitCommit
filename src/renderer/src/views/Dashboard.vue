<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2 class="page-title">数据概览</h2>
    </div>

    <div class="stats-cards">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stats-card">
            <div class="stats-container">
              <div class="stats-icon commits-icon">
                <el-icon><List /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ stats.totalCommits }}</div>
                <div class="stats-label">总提交数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stats-card">
            <div class="stats-container">
              <div class="stats-icon files-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ stats.totalFiles }}</div>
                <div class="stats-label">文件总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stats-card">
            <div class="stats-container">
              <div class="stats-icon contributors-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ stats.totalContributors }}</div>
                <div class="stats-label">贡献者数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stats-card">
            <div class="stats-container">
              <div class="stats-icon lines-icon">
                <el-icon><Histogram /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ formatNumber(stats.totalLines) }}</div>
                <div class="stats-label">代码行数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="chart-section">
      <el-row :gutter="16">
        <el-col :xs="24" :lg="12">
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
            <div ref="commitTrendChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>语言分布</span>
              </div>
            </template>
            <div ref="languageDistChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="recent-activity">
      <el-card>
        <template #header>
          <div class="activity-header">
            <span>最近提交记录</span>
            <el-button type="primary" link @click="viewAllCommits">查看全部</el-button>
          </div>
        </template>
        <el-table :data="recentCommits" style="width: 100%">
          <el-table-column label="提交信息" min-width="300">
            <template #default="{ row }">
              <div class="commit-message">
                <div class="commit-title">{{ row.title }}</div>
                <div class="commit-hash">{{ row.hash.substring(0, 7) }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="作者" width="180">
            <template #default="{ row }">
              <div class="commit-author">
                <el-avatar :size="24" :src="getAvatarUrl(row.authorEmail)"></el-avatar>
                <span>{{ row.author }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="日期" width="180">
            <template #default="{ row }">
              {{ formatDate(row.date) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewCommitDetail(row)"> 详情 </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div class="repo-overview">
      <el-card>
        <template #header>
          <div class="overview-header">
            <span>项目概览</span>
          </div>
        </template>
        <el-row :gutter="16">
          <el-col :xs="24" :md="12">
            <h3 class="section-title">主要贡献者</h3>
            <div class="contributors-list">
              <div
                v-for="contributor in topContributors"
                :key="contributor.email"
                class="contributor-item"
              >
                <el-avatar :size="32" :src="getAvatarUrl(contributor.email)"></el-avatar>
                <div class="contributor-info">
                  <div class="contributor-name">{{ contributor.name }}</div>
                  <div class="contribution-stats">
                    <span>{{ contributor.commits }} 提交</span>
                    <span class="additions">+{{ contributor.additions }}</span>
                    <span class="deletions">-{{ contributor.deletions }}</span>
                  </div>
                </div>
                <div class="contributor-percentage">
                  <el-progress
                    :percentage="contributor.percentage"
                    :color="contributor.color"
                    :stroke-width="8"
                    :show-text="false"
                  />
                  <span>{{ contributor.percentage }}%</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :md="12">
            <h3 class="section-title">活跃分支</h3>
            <div class="branches-list">
              <div v-for="branch in activeBranches" :key="branch.name" class="branch-item">
                <div class="branch-icon">
                  <el-icon><Share /></el-icon>
                </div>
                <div class="branch-info">
                  <div class="branch-name">{{ branch.name }}</div>
                  <div class="branch-stats">最近提交: {{ formatDate(branch.lastCommitDate) }}</div>
                </div>
                <div class="branch-commit-count">{{ branch.commitCount }} 提交</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Document, User, List, Histogram, Share } from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import dayjs from 'dayjs'

// 注册ECharts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
  PieChart,
  LineChart,
  CanvasRenderer
])

const router = useRouter()

// 统计数据
const stats = reactive({
  totalCommits: 1285,
  totalFiles: 358,
  totalContributors: 15,
  totalLines: 125678
})

// 图表配置
const commitTrendTimeRange = ref('week')
const commitTrendChart = ref(null)
const languageDistChart = ref(null)

// 最近提交数据
const recentCommits = ref([
  {
    hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    title: '添加报表导出功能',
    author: '张三',
    authorEmail: 'zhangsan@example.com',
    date: '2023-09-15T14:30:00'
  },
  {
    hash: '9876543210abcdef9876543210abcdef98765432',
    title: '修复导航栏响应式布局问题',
    author: '李四',
    authorEmail: 'lisi@example.com',
    date: '2023-09-14T10:15:00'
  },
  {
    hash: 'abcdef1234567890abcdef1234567890abcdef12',
    title: '优化数据加载性能',
    author: '王五',
    authorEmail: 'wangwu@example.com',
    date: '2023-09-13T16:45:00'
  },
  {
    hash: '1234567890abcdef1234567890abcdef12345678',
    title: '新增用户设置页面',
    author: '赵六',
    authorEmail: 'zhaoliu@example.com',
    date: '2023-09-12T09:22:00'
  }
])

// 主要贡献者
const topContributors = ref([
  {
    name: '张三',
    email: 'zhangsan@example.com',
    commits: 463,
    additions: 28540,
    deletions: 12136,
    percentage: 36,
    color: '#67C23A'
  },
  {
    name: '李四',
    email: 'lisi@example.com',
    commits: 356,
    additions: 23684,
    deletions: 9728,
    percentage: 28,
    color: '#409EFF'
  },
  {
    name: '王五',
    email: 'wangwu@example.com',
    commits: 252,
    additions: 18105,
    deletions: 7125,
    percentage: 20,
    color: '#E6A23C'
  },
  {
    name: '赵六',
    email: 'zhaoliu@example.com',
    commits: 203,
    additions: 11446,
    deletions: 5834,
    percentage: 16,
    color: '#F56C6C'
  }
])

// 活跃分支
const activeBranches = ref([
  {
    name: 'main',
    lastCommitDate: '2023-09-15T14:30:00',
    commitCount: 785
  },
  {
    name: 'dev',
    lastCommitDate: '2023-09-15T13:45:00',
    commitCount: 682
  },
  {
    name: 'feature/analytics',
    lastCommitDate: '2023-09-14T16:20:00',
    commitCount: 128
  },
  {
    name: 'feature/reports',
    lastCommitDate: '2023-09-13T11:10:00',
    commitCount: 86
  }
])

// 格式化数字（添加千位分隔符）
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 格式化日期
const formatDate = (dateString: string): string => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

// 获取头像URL
const getAvatarUrl = (email: string): string => {
  const hash = btoa(email).substring(0, 12)
  return `https://i.pravatar.cc/150?u=${hash}`
}

// 查看所有提交
const viewAllCommits = () => {
  router.push('/commits')
}

// 查看提交详情
const viewCommitDetail = (commit: any) => {
  router.push(`/commits?hash=${commit.hash}`)
}

// 初始化提交趋势图表
const initCommitTrendChart = () => {
  const chartDom = document.getElementById('commitTrendChart')
  if (!chartDom) return

  const chart = echarts.init(chartDom)

  // 生成工作日数据
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const commitData = [11, 22, 18, 29, 34, 14, 7]

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
  }

  chart.setOption(option)
}

// 初始化语言分布图表
const initLanguageDistChart = () => {
  const chartDom = document.getElementById('languageDistChart')
  if (!chartDom) return

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
  }

  chart.setOption(option)
}

// 组件挂载后初始化图表
onMounted(() => {
  // 创建图表容器ID
  const commitTrendChartEl = document.querySelector('.chart-section .chart-container')
  if (commitTrendChartEl) {
    commitTrendChartEl.id = 'commitTrendChart'
  }

  const languageDistChartEl = document.querySelectorAll('.chart-section .chart-container')[1]
  if (languageDistChartEl) {
    languageDistChartEl.id = 'languageDistChart'
  }

  // 初始化图表
  setTimeout(() => {
    initCommitTrendChart()
    initLanguageDistChart()
  }, 0)
})
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  padding-bottom: 20px;
  /* padding-top: 15px; */
}

.dashboard-header {
  margin-bottom: 20px;
  /* margin-top: 10px; */
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--color-text);
  font-weight: 600;
  line-height: 1.5;
}

.stats-cards {
  margin-bottom: 20px;
}

.stats-card {
  height: 100px;
  display: flex;
  align-items: center;
  padding: 16px;
}
.stats-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  font-size: 24px;
}

.commits-icon {
  background-color: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.files-icon {
  background-color: rgba(14, 165, 233, 0.1);
  color: #0ea5e9;
}

.contributors-icon {
  background-color: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.lines-icon {
  background-color: rgba(234, 88, 12, 0.1);
  color: #ea580c;
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1.2;
}

.stats-label {
  font-size: 14px;
  color: var(--color-text-light);
}

.chart-section {
  margin-bottom: 20px;
}

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

.activity-header,
.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-activity {
  margin-bottom: 20px;
}

.commit-message {
  display: flex;
  flex-direction: column;
}

.commit-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.commit-hash {
  font-family: monospace;
  font-size: 12px;
  color: var(--color-text-light);
}

.commit-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 16px;
  font-weight: 600;
}

.contributors-list,
.branches-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contributor-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contributor-info {
  flex: 1;
}

.contributor-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.contribution-stats {
  font-size: 12px;
  color: var(--color-text-light);
  display: flex;
  gap: 8px;
}

.contributor-percentage {
  width: 120px;
  text-align: right;
}

.branch-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.branch-icon {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.branch-info {
  flex: 1;
}

.branch-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.branch-stats {
  font-size: 12px;
  color: var(--color-text-light);
}

.branch-commit-count {
  font-weight: 500;
}

.additions {
  color: var(--color-success);
}

.deletions {
  color: var(--color-danger);
}

@media (max-width: 768px) {
  .stats-card {
    margin-bottom: 16px;
  }
}
</style>
