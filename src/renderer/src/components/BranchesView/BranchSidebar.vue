<template>
  <div>
    <a-card class="branch-visualization-card">
      <template #title>
        <div class="card-header">
          <span>分支可视化</span>
        </div>
      </template>

      <div class="branch-graph-container" ref="branchGraphEl">
        <a-empty v-if="!graphReady" description="加载分支图...">
          <a-button type="primary" @click="initBranchGraph">加载</a-button>
        </a-empty>
      </div>

      <div class="branch-stats">
        <a-row :gutter="10">
          <a-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ branchStats.totalBranches }}</div>
              <div class="stat-label">分支总数</div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ branchStats.activeBranches }}</div>
              <div class="stat-label">活跃分支</div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ branchStats.aheadCount }}</div>
              <div class="stat-label">领先提交</div>
            </div>
          </a-col>
        </a-row>
      </div>
    </a-card>

    <a-card class="merge-requests-card">
      <template #title>
        <div class="card-header">
          <span>待处理合并请求</span>
        </div>
      </template>

      <div v-if="mergeRequests.length > 0">
        <div v-for="mr in mergeRequests" :key="mr.id" class="merge-request-item">
          <div class="mr-header">
            <span class="mr-title">{{ mr.title }}</span>
            <a-tag :color="getMrStatusType(mr.status)">{{ mr.status }}</a-tag>
          </div>
          <div class="mr-info">
            <span
              >源: <b>{{ mr.source }}</b></span
            >
            <ArrowRightOutlined />
            <span
              >目标: <b>{{ mr.target }}</b></span
            >
          </div>
          <div class="mr-actions">
            <span class="mr-author">{{ mr.author }} · {{ formatDate(mr.date) }}</span>
            <div>
              <a-button
                size="small"
                @click="$emit('viewMergeRequest', mr)"
                style="margin-right: 5px"
                >查看</a-button
              >
              <a-button
                size="small"
                type="primary"
                :disabled="mr.status !== '待合并'"
                @click="$emit('approveMergeRequest', mr)"
              >
                合并
              </a-button>
            </div>
          </div>
        </div>
      </div>
      <a-empty v-else description="暂无待处理的合并请求" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowRightOutlined } from '@ant-design/icons-vue'
import type { PropType } from 'vue'

interface MergeRequest {
  id: number
  title: string
  source: string
  target: string
  status: string
  author: string
  date: string
}

interface BranchStats {
  totalBranches: number
  activeBranches: number
  aheadCount: number
}

defineProps({
  branchStats: { type: Object as PropType<BranchStats>, required: true },
  mergeRequests: { type: Array as PropType<MergeRequest[]>, required: true },
  formatDate: { type: Function, required: true }
})

defineEmits(['viewMergeRequest', 'approveMergeRequest'])

const graphReady = ref(false)
const branchGraphEl = ref<HTMLElement | null>(null)

const getMrStatusType = (status: string) => {
  switch (status) {
    case '待合并':
      return 'green'
    case '审核中':
      return 'orange'
    case '已通过':
      return 'blue'
    default:
      return 'blue'
  }
}

const initBranchGraph = () => {
  graphReady.value = true
  setTimeout(() => {
    if (branchGraphEl.value) {
      branchGraphEl.value.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; font-family: sans-serif; color: #666;">
          <div style="margin: 10px 0;">图表加载中，这里将显示分支关系图</div>
          <img src="https://git-scm.com/book/en/v2/images/advance-master.png"
               alt="Branch Graph Example"
               style="max-width: 100%; height: auto;" />
        </div>
      `
    }
  }, 500)
}

onMounted(() => {
  // The graph can be initialized on mount or triggered by user action
})
</script>

<style scoped>
.branch-visualization-card,
.merge-requests-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.branch-graph-container {
  height: 300px;
  background-color: var(--color-background-soft);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  overflow: hidden;
}
.branch-stats {
  padding: 10px 0;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--color-primary);
}
.stat-label {
  font-size: 14px;
  color: var(--color-text-light);
}
.merge-request-item {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}
.merge-request-item:last-child {
  border-bottom: none;
}
.mr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.mr-title {
  font-weight: 500;
}
.mr-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--color-text-light);
}
.mr-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mr-author {
  font-size: 13px;
  color: var(--color-text-light);
}
</style>
