<template>
  <a-card :loading="loading">
    <template #title>
      <div class="card-header">
        <span>提交活动报告</span>
        <div class="header-actions">
          <a-button type="primary" @click="$emit('exportReport', 'excel')">
            <template #icon><FileExcelOutlined /></template>
            导出 Excel
          </a-button>
          <a-button danger @click="$emit('exportReport', 'pdf')">
            <template #icon><FilePdfOutlined /></template>
            导出 PDF
          </a-button>
        </div>
      </div>
    </template>

    <div class="reports-preview">
      <ChartContainer title="提交频率">
        <BaseBarChart :chart-data="commitFrequencyData" />
      </ChartContainer>

      <ChartContainer title="提交时间分布">
        <BasePieChart :chart-data="commitTimeData" type="pie" />
      </ChartContainer>
    </div>

    <h3 class="section-title">提交统计摘要</h3>
    <a-descriptions :column="4" bordered size="small">
      <a-descriptions-item label="总提交数">{{ commitStats.totalCommits }}</a-descriptions-item>
      <a-descriptions-item label="最活跃日期">{{ commitStats.mostActiveDay }}</a-descriptions-item>
      <a-descriptions-item label="平均每日提交">{{
        commitStats.avgCommitsPerDay
      }}</a-descriptions-item>
      <a-descriptions-item label="贡献者数量">{{
        commitStats.contributorsCount
      }}</a-descriptions-item>
      <a-descriptions-item label="添加的行数">{{ commitStats.addedLines }}</a-descriptions-item>
      <a-descriptions-item label="删除的行数">{{ commitStats.deletedLines }}</a-descriptions-item>
      <a-descriptions-item label="修改的文件数">{{
        commitStats.modifiedFiles
      }}</a-descriptions-item>
      <a-descriptions-item label="平均提交大小">{{
        commitStats.avgCommitSize
      }}</a-descriptions-item>
    </a-descriptions>

    <h3 class="section-title">贡献者排名</h3>
    <a-table :data-source="topContributors" :columns="columns" :pagination="{ pageSize: 5 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'percentage'">
          <a-progress :percent="record.percentage" :stroke-color="record.color" />
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons-vue'
import ChartContainer from '../charts/ChartContainer.vue'
import BaseBarChart from '../charts/BaseBarChart.vue'
import BasePieChart from '../charts/BasePieChart.vue'

defineProps({
  loading: { type: Boolean, default: false },
  commitStats: { type: Object, required: true },
  topContributors: { type: Array, required: true }
})

defineEmits(['exportReport'])

const columns = [
  {
    title: '排名',
    dataIndex: 'rank',
    key: 'rank',
    customRender: ({ index }) => index + 1,
    width: 60
  },
  { title: '贡献者', dataIndex: 'name', key: 'name', minWidth: 140 },
  { title: '邮箱', dataIndex: 'email', key: 'email', minWidth: 200 },
  {
    title: '提交数',
    dataIndex: 'commits',
    key: 'commits',
    sorter: (a, b) => a.commits - b.commits,
    width: 100
  },
  {
    title: '添加行数',
    dataIndex: 'additions',
    key: 'additions',
    sorter: (a, b) => a.additions - b.additions,
    width: 120
  },
  {
    title: '删除行数',
    dataIndex: 'deletions',
    key: 'deletions',
    sorter: (a, b) => a.deletions - b.deletions,
    width: 120
  },
  { title: '贡献占比', dataIndex: 'percentage', key: 'percentage', width: 150 }
]

const commitFrequencyData = computed(() => ({
  labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  datasets: [
    {
      label: '提交数量',
      backgroundColor: '#1890ff',
      data: [12, 24, 36, 42, 28, 31, 38, 45, 39, 42, 28, 19]
    }
  ]
}))

const commitTimeData = computed(() => ({
  labels: ['上午 (6-12点)', '下午 (12-18点)', '晚上 (18-24点)', '凌晨 (0-6点)'],
  datasets: [
    {
      backgroundColor: ['#52c41a', '#1890ff', '#faad14', '#f5222d'],
      data: [42, 68, 56, 18]
    }
  ]
}))
</script>

<style scoped>
.reports-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.section-title {
  margin: 32px 0 16px;
  font-size: 18px;
  font-weight: 600;
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
</style>
