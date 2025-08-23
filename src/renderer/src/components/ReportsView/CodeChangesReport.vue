<template>
  <a-card :loading="loading">
    <template #title>
      <div class="card-header">
        <span>代码变更报告</span>
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
      <ChartContainer title="每日修改活动">
        <BaseBarChart :chart-data="dailyActivityData" />
      </ChartContainer>

      <ChartContainer title="代码变更趋势">
        <BaseBarChart :chart-data="changesTrendData" />
      </ChartContainer>
    </div>

    <h3 class="section-title">变更最频繁的文件</h3>
    <a-table :data-source="topChangedFiles" :columns="columns" :pagination="{ pageSize: 5 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'changeFrequency'">
          <a-tag :color="getChangeFrequencyColor(record.changeFrequency)">
            {{ record.changeFrequency }}
          </a-tag>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import ChartContainer from '../charts/ChartContainer.vue'
import BaseBarChart from '../charts/BaseBarChart.vue'

defineProps({
  loading: { type: Boolean, default: false },
  topChangedFiles: { type: Array, required: true }
})

defineEmits(['exportReport'])

const columns = [
  { title: '文件路径', dataIndex: 'path', key: 'path', minWidth: 300 },
  {
    title: '变更次数',
    dataIndex: 'changes',
    key: 'changes',
    sorter: (a, b) => a.changes - b.changes,
    width: 120
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
  { title: '变更频率', dataIndex: 'changeFrequency', key: 'changeFrequency', width: 150 }
]

const getChangeFrequencyColor = (frequency: string) => {
  switch (frequency) {
    case '高频':
      return 'error'
    case '中频':
      return 'warning'
    case '低频':
      return 'processing'
    default:
      return 'default'
  }
}

const dailyActivityData = computed(() => ({
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  datasets: [
    {
      label: '修改次数',
      backgroundColor: '#faad14',
      data: [15, 28, 35, 42, 38, 12, 8]
    }
  ]
}))

const changesTrendData = computed(() => {
  const labels = []
  const additions = []
  const deletions = []
  for (let i = 29; i >= 0; i--) {
    labels.push(dayjs().subtract(i, 'day').format('MM-DD'))
    additions.push(Math.round(Math.random() * 300 + 100))
    deletions.push(Math.round(Math.random() * 200 + 50))
  }
  return {
    labels,
    datasets: [
      { label: '增加', backgroundColor: '#52c41a', data: additions },
      { label: '删除', backgroundColor: '#f5222d', data: deletions }
    ]
  }
})
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
