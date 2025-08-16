<template>
  <div class="contributors-container">
    <div class="contributors-header">
      <h2 class="page-title">贡献者分析</h2>
      <div class="contributors-actions">
        <a-select v-model:value="selectedRepo" placeholder="选择仓库" class="filter-item">
          <a-select-option v-for="repo in repositories" :key="repo.id" :value="repo.id">{{
            repo.name
          }}</a-select-option>
        </a-select>
        <a-range-picker
          v-model:value="dateRange"
          :placeholder="['开始日期', '结束日期']"
          class="filter-item"
        />
        <a-button type="primary" @click="analyzeContributors">
          <template #icon><BarChartOutlined /></template>
          分析
        </a-button>
      </div>
    </div>

    <ContributorsStats :stats="contributorStats" :format-number="formatNumber" />

    <a-row :gutter="20" class="content-row">
      <a-col :span="16">
        <ContributorsList
          :contributors="contributors"
          :loading="loading"
          :total-commits="contributorStats.totalCommits"
          :format-date="formatDate"
          :format-number="formatNumber"
          :get-initials="getInitials"
          :get-contributor-color="getContributorColor"
          @select="selectContributor"
        />
      </a-col>

      <a-col :span="8">
        <ContributorDetails
          :contributor="selectedContributor"
          :all-contributors="contributors"
          :get-initials="getInitials"
          :format-number="formatNumber"
          :get-contributor-color="getContributorColor"
          @clear="clearSelectedContributor"
        />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { message, Select as ASelect, DatePicker as ARangePicker, Button as AButton, Row as ARow, Col as ACol } from 'ant-design-vue'
import ContributorsStats from '@/components/ContributorsView/ContributorsStats.vue'
import ContributorsList from '@/components/ContributorsView/ContributorsList.vue'
import ContributorDetails from '@/components/ContributorsView/ContributorDetails.vue'
import { BarChartOutlined } from '@ant-design/icons-vue';

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

// 获取贡献者标识颜色
const getContributorColor = (id) => {
  const colors = ['#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', '#7209b7']
  return colors[(id - 1) % colors.length]
}

// 选择贡献者
const selectContributor = (row) => {
  selectedContributor.value = row
}

// 清除选中贡献者
const clearSelectedContributor = () => {
  selectedContributor.value = null
}

// 分析贡献者
const analyzeContributors = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false;
    message.success('贡献者分析已完成');
  }, 800);
};
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

.content-row {
  margin-bottom: 20px;
}
</style>
