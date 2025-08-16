<template>
  <div class="commits-list" v-if="commits.length > 0">
    <div
      v-for="(commit, index) in commits"
      :key="commit.hash"
      class="commit-item"
      :class="{ active: selectedCommitIndex === index }"
      @click="$emit('selectCommit', index)"
    >
      <div class="commit-header">
        <div class="commit-title">{{ commit.title }}</div>
        <div class="commit-hash">{{ commit.hash.substring(0, 7) }}</div>
      </div>

      <div class="commit-info">
        <div class="commit-author">
          <a-avatar :size="24" :src="getAvatarUrl(commit.authorEmail)"></a-avatar>
          <span>{{ commit.author }}</span>
        </div>
        <div class="commit-time">{{ formatDate(commit.date) }}</div>
      </div>

      <div class="commit-stats">
        <div class="commit-files"><FileTextOutlined /> {{ commit.files.length }} 文件</div>
        <div class="commit-changes">
          <span class="additions">+{{ commit.additions }}</span>
          <span class="deletions">-{{ commit.deletions }}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="empty-state" v-else>
    <a-empty description="暂无提交记录">
      <a-button type="primary" @click="$emit('refresh')">刷新提交记录</a-button>
    </a-empty>
  </div>
</template>

<script setup lang="ts">
import { FileTextOutlined } from '@ant-design/icons-vue'
import type { PropType } from 'vue'

interface Commit {
  hash: string;
  title: string;
  authorEmail: string;
  author: string;
  date: string;
  files: any[];
  additions: number;
  deletions: number;
}

defineProps({
  commits: {
    type: Array as PropType<Commit[]>,
    required: true
  },
  selectedCommitIndex: {
    type: Number,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  getAvatarUrl: {
    type: Function,
    required: true
  }
})

defineEmits(['selectCommit', 'refresh'])
</script>

<style scoped>
.commits-list {
  width: 350px;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.commit-item {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s;
}

.commit-item:hover {
  background-color: var(--color-background-soft);
}

.commit-item.active {
  background-color: var(--color-background-mute);
}

.commit-header,
.commit-info,
.commit-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.commit-stats {
  margin-bottom: 0;
}

.commit-title {
  flex: 1;
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.commit-hash {
  font-family: monospace;
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
}

.commit-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-sm);
}

.commit-time {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.commit-files {
  display: flex;
  align-items: center;
  gap: 4px;
}

.commit-changes {
  display: flex;
  gap: 8px;
}

.additions {
  color: var(--color-success);
}

.deletions {
  color: var(--color-danger);
}

.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 350px;
}
</style>
