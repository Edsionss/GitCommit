<template>
  <div class="recent-activity">
    <a-card>
      <template #title>
        <div class="activity-header">
          <span>最近提交记录</span>
          <a-button type="link" @click="$emit('viewAllCommits')">查看全部</a-button>
        </div>
      </template>
      <a-table
        :data-source="recentCommits"
        :columns="columns"
        :pagination="false"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'commitInfo'">
            <div class="commit-message">
              <div class="commit-title">{{ record.title }}</div>
              <div class="commit-hash">{{ record.hash.substring(0, 7) }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'authorInfo'">
            <div class="commit-author">
              <a-avatar :size="24" :src="getAvatarUrl(record.authorEmail)"></a-avatar>
              <span>{{ record.author }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'date'">
            {{ formatDate(record.date) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" @click="$emit('viewCommitDetail', record)"> 详情 </a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFormatters } from '@/composables/useFormatters'

defineProps({
  recentCommits: {
    type: Array,
    required: true
  },
  getAvatarUrl: {
    type: Function,
    required: true
  }
})

defineEmits(['viewAllCommits', 'viewCommitDetail'])

const { formatDate } = useFormatters()

const columns = ref([
  {
    title: '提交信息',
    dataIndex: 'title',
    key: 'commitInfo',
    width: 300
  },
  {
    title: '作者',
    dataIndex: 'author',
    key: 'authorInfo',
    width: 180
  },
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 120
  }
])
</script>

<style scoped>
.recent-activity {
  margin-bottom: 20px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
</style>
