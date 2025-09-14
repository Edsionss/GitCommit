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
          <span style="color: green">+{{ text }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'deletions'">
          <span style="color: red">-{{ text }}</span>
        </template>
      </template>
      <template #expandedRowRender="{ record }">
        <div class="expanded-row-content">
          <p>
            <strong>完整提交ID:</strong>
            <a-typography-paragraph copyable style="display: inline">{{
              record.commitId
            }}</a-typography-paragraph>
          </p>
          <p v-if="record.branch">
            <strong>分支:</strong> <a-tag color="cyan">{{ record.branch }}</a-tag>
          </p>
          <div>
            <strong>消息:</strong>
            <pre class="commit-message-pre">{{ record.message }}</pre>
          </div>
          <div v-if="record.body">
            <strong>详细描述:</strong>
            <pre class="commit-message-pre">{{ record.body }}</pre>
          </div>
          <p>
            <strong>邮箱:</strong> {{ record.email }}
            <a-divider type="vertical" />
            <strong>文件变更数:</strong> {{ record.filesChanged }}
            <a-divider type="vertical" />
            <strong>新增行数:</strong> <span style="color: green">{{ record.insertions }}</span>
            <a-divider type="vertical" />
            <strong>删除行数:</strong> <span style="color: red">{{ record.deletions }}</span>
          </p>
        </div>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import dayjs from 'dayjs'
import type { GitCommit } from '@shared/types/dtos/git'

defineProps({
  results: { type: Array as PropType<GitCommit[]>, required: true }
})

const columns = [
  { title: '仓库', dataIndex: 'repository', key: 'repository', width: 120 },
  { title: '作者', dataIndex: 'author', key: 'author', width: 120 },
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
    width: 180,
    sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  }
  // 其他列默认不显示，通过展开行显示
]

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.scan-results-table {
  padding: var(--spacing-md);
  height: 100%;
  overflow: auto;
}

.expanded-row-content {
  padding: 10px 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 10px;
}

.commit-message-pre {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  font-size: 12px;
  background-color: #eee;
  padding: 5px;
  border-radius: 3px;
}
</style>
