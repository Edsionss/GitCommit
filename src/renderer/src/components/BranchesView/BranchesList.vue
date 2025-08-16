<template>
  <el-card class="branches-table-card" v-loading="loading">
    <template #header>
      <div class="card-header">
        <span>分支列表</span>
        <el-input v-model="searchQuery" placeholder="搜索分支" class="search-input" clearable>
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </template>

    <el-table :data="filteredBranches" style="width: 100%">
      <el-table-column type="expand">
        <template #default="props">
          <div class="branch-detail">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="最后提交者">
                {{ props.row.lastCommitAuthor }}
              </el-descriptions-item>
              <el-descriptions-item label="提交日期">
                {{ formatDate(props.row.lastCommitDate) }}
              </el-descriptions-item>
              <el-descriptions-item label="提交ID">
                <el-tag size="small" type="info">{{ props.row.lastCommitHash }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="提交消息">
                {{ props.row.lastCommitMessage }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="60">
        <template #default="scope">
          <div class="branch-status">
            <el-icon v-if="scope.row.name === 'main'" color="#67C23A"><Star /></el-icon>
            <el-icon v-else-if="scope.row.isRemote" color="#409EFF"><Connection /></el-icon>
            <el-icon v-else color="#E6A23C"><Share /></el-icon>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="分支名称" min-width="200">
        <template #default="scope">
          <div class="branch-name">
            <span>{{ scope.row.name }}</span>
            <el-tag v-if="scope.row.current" size="small" type="success">当前分支</el-tag>
            <el-tag v-if="scope.row.isRemote" size="small" type="info">远程</el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="commitsCount" label="提交数" width="100" sortable />

      <el-table-column label="最近更新" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.lastCommitDate) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button-group>
            <el-button
              size="small"
              :disabled="scope.row.current"
              @click="$emit('checkout', scope.row)"
            >
              切换
            </el-button>
            <el-button
              size="small"
              type="primary"
              :disabled="scope.row.name === 'main'"
              @click="$emit('merge', scope.row)"
            >
              合并
            </el-button>
            <el-button
              size="small"
              type="danger"
              :disabled="scope.row.name === 'main' || scope.row.current"
              @click="$emit('delete', scope.row)"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Star, Connection, Share } from '@element-plus/icons-vue';

const props = defineProps({
  branches: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  formatDate: { type: Function, required: true }
});

defineEmits(['checkout', 'merge', 'delete']);

const searchQuery = ref('');

const filteredBranches = computed(() => {
  if (!searchQuery.value) return props.branches;
  const query = searchQuery.value.toLowerCase();
  return props.branches.filter(branch => 
    branch.name.toLowerCase().includes(query) ||
    branch.lastCommitMessage.toLowerCase().includes(query) ||
    branch.lastCommitAuthor.toLowerCase().includes(query)
  );
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  max-width: 250px;
}

.branches-table-card {
  margin-bottom: 20px;
}

.branch-detail {
  padding: 15px;
}

.branch-status {
  display: flex;
  justify-content: center;
  align-items: center;
}

.branch-name {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
