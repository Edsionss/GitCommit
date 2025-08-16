<template>
  <div class="recent-activity">
    <el-card>
      <template #header>
        <div class="activity-header">
          <span>最近提交记录</span>
          <el-button type="primary" link @click="$emit('viewAllCommits')">查看全部</el-button>
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
            <el-button type="primary" link @click="$emit('viewCommitDetail', row)"> 详情 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineProps({
  recentCommits: {
    type: Array,
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
});

defineEmits(['viewAllCommits', 'viewCommitDetail']);
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
