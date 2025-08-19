<template>
  <div class="scan-results-table">
    <a-table
      :data-source="results"
      :columns="columns"
      :pagination="{ pageSize: 10 }"
      :scroll="{ x: 'max-content' }"
      row-key="commitId"
    >
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex === 'shortHash'">
          <a-tag color="blue">{{ text }}</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'date'">
          {{ formatDate(text) }}
        </template>
        <template v-else-if="column.dataIndex === 'filesChanged'">
          <a-tag>{{ text }}</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'insertions'">
          <span style="color: green;">+{{ text }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'deletions'">
          <span style="color: red;">-{{ text }}</span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import dayjs from 'dayjs'
import { GitCommit } from '@services/GitService'

defineProps({
  results: { type: Array as PropType<GitCommit[]>, required: true },
})

const columns = [
  { title: '仓库', dataIndex: 'repository', key: 'repository', width: 120 },
  { title: '短哈希', dataIndex: 'shortHash', key: 'shortHash', width: 100 },
  { title: '作者', dataIndex: 'author', key: 'author', width: 120 },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 150 },
  { title: '日期', dataIndex: 'date', key: 'date', width: 180 },
  { title: '消息', dataIndex: 'message', key: 'message', ellipsis: true },
  { title: '文件变更', dataIndex: 'filesChanged', key: 'filesChanged', width: 100 },
  { title: '新增', dataIndex: 'insertions', key: 'insertions', width: 80 },
  { title: '删除', dataIndex: 'deletions', key: 'deletions', width: 80 },
]

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.scan-results-table {
  padding: var(--spacing-md);
}
</style>
