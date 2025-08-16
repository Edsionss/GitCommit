<template>
  <div>
    <el-card class="branch-visualization-card">
      <template #header>
        <div class="card-header">
          <span>分支可视化</span>
        </div>
      </template>

      <div class="branch-graph-container" ref="branchGraphEl">
        <el-empty v-if="!graphReady" description="加载分支图...">
          <el-button type="primary" @click="initBranchGraph">加载</el-button>
        </el-empty>
      </div>

      <div class="branch-stats">
        <el-row :gutter="10">
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ branchStats.totalBranches }}</div>
              <div class="stat-label">分支总数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ branchStats.activeBranches }}</div>
              <div class="stat-label">活跃分支</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ branchStats.aheadCount }}</div>
              <div class="stat-label">领先提交</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card class="merge-requests-card">
      <template #header>
        <div class="card-header">
          <span>待处理合并请求</span>
        </div>
      </template>

      <div v-if="mergeRequests.length > 0">
        <div v-for="mr in mergeRequests" :key="mr.id" class="merge-request-item">
          <div class="mr-header">
            <span class="mr-title">{{ mr.title }}</span>
            <el-tag :type="getMrStatusType(mr.status)">{{ mr.status }}</el-tag>
          </div>
          <div class="mr-info">
            <span>源: <b>{{ mr.source }}</b></span>
            <el-icon><ArrowRight /></el-icon>
            <span>目标: <b>{{ mr.target }}</b></span>
          </div>
          <div class="mr-actions">
            <span class="mr-author">{{ mr.author }} · {{ formatDate(mr.date) }}</span>
            <div>
              <el-button size="small" @click="$emit('viewMergeRequest', mr)">查看</el-button>
              <el-button
                size="small"
                type="success"
                :disabled="mr.status !== '待合并'"
                @click="$emit('approveMergeRequest', mr)"
              >
                合并
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无待处理的合并请求" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';

const props = defineProps({
  branchStats: { type: Object, required: true },
  mergeRequests: { type: Array, required: true },
  formatDate: { type: Function, required: true }
});

defineEmits(['viewMergeRequest', 'approveMergeRequest']);

const graphReady = ref(false);
const branchGraphEl = ref(null);

const getMrStatusType = (status: string) => {
  switch (status) {
    case '待合并': return 'success';
    case '审核中': return 'warning';
    case '已通过': return 'info';
    default: return 'info';
  }
};

const initBranchGraph = () => {
  graphReady.value = true;
  setTimeout(() => {
    if (branchGraphEl.value) {
      branchGraphEl.value.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; font-family: sans-serif; color: #666;">
          <div style="margin: 10px 0;">图表加载中，这里将显示分支关系图</div>
          <img src="https://git-scm.com/book/en/v2/images/advance-master.png" 
               alt="Branch Graph Example" 
               style="max-width: 100%; height: auto;" />
        </div>
      `;
    }
  }, 500);
};

onMounted(() => {
  // The graph can be initialized on mount or triggered by user action
});
</script>

<style scoped>
.branch-visualization-card, .merge-requests-card {
  margin-bottom: 20px;
}
.card-header { display: flex; justify-content: space-between; align-items: center; }
.branch-graph-container { height: 300px; background-color: var(--color-background-soft); border-radius: 4px; display: flex; justify-content: center; align-items: center; margin-bottom: 20px; overflow: hidden; }
.branch-stats { padding: 10px 0; }
.stat-item { display: flex; flex-direction: column; align-items: center; text-align: center; }
.stat-value { font-size: 24px; font-weight: bold; color: var(--color-primary); }
.stat-label { font-size: 14px; color: var(--color-text-light); }
.merge-request-item { padding: 12px; border-bottom: 1px solid var(--color-border); }
.merge-request-item:last-child { border-bottom: none; }
.mr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.mr-title { font-weight: 500; }
.mr-info { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 14px; color: var(--color-text-light); }
.mr-actions { display: flex; justify-content: space-between; align-items: center; }
.mr-author { font-size: 13px; color: var(--color-text-light); }
</style>
