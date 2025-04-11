<template>
  <el-card class="results-component" id="results-section">
    <template #header>
      <div class="card-header">
        <span>扫描结果 {{ commits.length > 0 ? `(${commits.length} 条记录)` : '(暂无数据)' }}</span>
        <div class="header-actions">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="table">表格视图</el-radio-button>
            <el-radio-button value="text">文本视图</el-radio-button>
          </el-radio-group>
          <el-button type="success" @click="exportResults" :disabled="commits.length === 0">
            <el-icon><Download /></el-icon> 导出结果
          </el-button>
        </div>
      </div>
    </template>

    <!-- 表格视图 -->
    <div v-if="commits.length > 0">
      <div v-if="viewMode === 'table'" class="table-view">
        <el-table :data="pagedCommits" border style="width: 100%">
          <el-table-column prop="hash" label="提交哈希" width="100">
            <template #default="scope">
              {{ scope.row.hash.substring(0, 7) }}
            </template>
          </el-table-column>
          <el-table-column prop="author" label="作者" width="120" />
          <el-table-column prop="date" label="日期" width="180" sortable />
          <el-table-column prop="message" label="提交信息" />
          <el-table-column label="变更统计" width="120">
            <template #default="scope">
              <span class="additions">+{{ scope.row.additions }}</span>
              <span class="deletions">-{{ scope.row.deletions }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button size="small" @click="viewCommitDetails(scope.row)"> 详情 </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页控件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="commits.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 文本视图 -->
      <div v-else-if="viewMode === 'text'" class="text-view">
        <el-input type="textarea" :rows="15" v-model="textViewContent" readonly />
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-else class="no-data">
      <el-empty description="暂无提交记录" />
    </div>

    <!-- 提交详情对话框 -->
    <el-dialog v-model="detailsDialogVisible" title="提交详情" width="70%">
      <div v-if="selectedCommit" class="commit-details">
        <div class="detail-item">
          <div class="detail-label">提交哈希:</div>
          <div class="detail-value">{{ selectedCommit.hash }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">作者:</div>
          <div class="detail-value">
            {{ selectedCommit.author }} &lt;{{ selectedCommit.email }}&gt;
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">日期:</div>
          <div class="detail-value">{{ selectedCommit.date }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">提交信息:</div>
          <div class="detail-value message">{{ selectedCommit.message }}</div>
        </div>
        <div class="detail-item files">
          <div class="detail-label">变更文件:</div>
          <div class="detail-value">
            <el-table :data="selectedCommit.files" border>
              <el-table-column prop="path" label="文件路径" />
              <el-table-column prop="status" label="状态" width="100" />
              <el-table-column label="变更" width="120">
                <template #default="scope">
                  <span class="additions">+{{ scope.row.additions }}</span>
                  <span class="deletions">-{{ scope.row.deletions }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

// 接口定义
interface CommitFile {
  path: string
  status: string
  additions: number
  deletions: number
}

interface Commit {
  hash: string
  author: string
  email: string
  date: string
  message: string
  files: CommitFile[]
  additions: number
  deletions: number
}

// 接收父组件传入的属性
const props = defineProps<{
  commits: Commit[]
  exportPath: string
}>()

const emit = defineEmits(['exportResults'])

// 组件状态
const viewMode = ref('table')
const detailsDialogVisible = ref(false)
const selectedCommit = ref<Commit | null>(null)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 分页后的数据
const pagedCommits = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return props.commits.slice(startIndex, endIndex)
})

// 处理每页显示数量变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1 // 重置到第一页
}

// 处理页码变化
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
}

// 文本视图内容
const textViewContent = computed(() => {
  return props.commits
    .map((commit) => {
      return `提交: ${commit.hash}\n作者: ${commit.author} <${commit.email}>\n日期: ${commit.date}\n\n    ${commit.message}\n\n变更: +${commit.additions} -${commit.deletions}\n----------------------------------------`
    })
    .join('\n\n')
})

// 查看提交详情
const viewCommitDetails = (commit: Commit) => {
  selectedCommit.value = commit
  detailsDialogVisible.value = true
}

// 导出结果
const exportResults = () => {
  if (props.commits.length === 0) {
    ElMessage.warning('没有可导出的结果')
    return
  }

  if (!props.exportPath) {
    ElMessage.warning('请先在高级筛选中选择导出路径')
    return
  }

  emit('exportResults')
}

// 重置分页
const resetPagination = () => {
  currentPage.value = 1
  pageSize.value = 10
}

// 暴露方法给父组件调用
defineExpose({
  resetPagination
})
</script>

<style scoped>
.results-component {
  width: 100%;
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

.table-view {
  width: 100%;
  overflow-x: auto;
}

.text-view {
  width: 100%;
}

.additions {
  color: #67c23a;
  margin-right: 8px;
}

.deletions {
  color: #f56c6c;
}

.no-data {
  padding: 40px 0;
  text-align: center;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.commit-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
}

.detail-label {
  font-weight: bold;
  width: 100px;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
}

.detail-value.message {
  white-space: pre-wrap;
}

.detail-item.files {
  flex-direction: column;
}

.detail-item.files .detail-label {
  margin-bottom: 8px;
}
</style>
