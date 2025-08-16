<template>
  <div class="branches-container">
    <div class="branches-header">
      <h2 class="page-title">分支管理</h2>
      <div class="branches-actions">
        <el-select v-model="selectedRepo" placeholder="选择仓库" class="filter-item">
          <el-option
            v-for="repo in repositories"
            :key="repo.id"
            :label="repo.name"
            :value="repo.id"
          />
        </el-select>
        <el-button type="primary" @click="refreshBranches">
          <el-icon class="mr-5"><RefreshRight /></el-icon>
          刷新分支
        </el-button>
        <el-button type="success" @click="createBranch">
          <el-icon class="mr-5"><Plus /></el-icon>
          新建分支
        </el-button>
      </div>
    </div>

<<<<<<< Updated upstream
    <el-row :gutter="20">
      <el-col :xs="24" :lg="16">
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
                    @click="checkoutBranch(scope.row)"
                  >
                    切换
                  </el-button>
                  <el-button
                    size="small"
                    type="primary"
                    :disabled="scope.row.name === 'main'"
                    @click="mergeBranch(scope.row)"
                  >
                    合并
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    :disabled="scope.row.name === 'main' || scope.row.current"
                    @click="deleteBranch(scope.row)"
                  >
                    删除
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="branch-visualization-card">
          <template #header>
            <div class="card-header">
              <span>分支可视化</span>
            </div>
          </template>

          <div class="branch-graph-container" ref="branchGraph">
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
                <span
                  >源: <b>{{ mr.source }}</b></span
                >
                <el-icon><ArrowRight /></el-icon>
                <span
                  >目标: <b>{{ mr.target }}</b></span
                >
              </div>
              <div class="mr-actions">
                <span class="mr-author">{{ mr.author }} · {{ formatDate(mr.date) }}</span>
                <div>
                  <el-button size="small" @click="viewMergeRequest(mr)">查看</el-button>
                  <el-button
                    size="small"
                    type="success"
                    :disabled="mr.status !== '待合并'"
                    @click="approveMergeRequest(mr)"
                  >
                    合并
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无待处理的合并请求" />
        </el-card>
      </el-col>
    </el-row>
=======
    <a-row :gutter="20">
      <a-col :xs="24" :lg="16">
        <BranchesList 
          :branches="branches"
          :loading="loading"
          :format-date="formatDate"
          @checkout="checkoutBranch"
          @merge="mergeBranch"
          @delete="deleteBranch"
        />
      </a-col>

      <a-col :xs="24" :lg="8">
        <BranchSidebar 
          :branch-stats="branchStats"
          :merge-requests="mergeRequests"
          :format-date="formatDate"
          @view-merge-request="viewMergeRequest"
          @approve-merge-request="approveMergeRequest"
        />
      </a-col>
    </a-row>
>>>>>>> Stashed changes

    <!-- 新建分支对话框 -->
    <el-dialog v-model="createBranchDialog.visible" title="新建分支" width="500px" destroy-on-close>
      <el-form :model="createBranchDialog.form" label-width="120px">
        <el-form-item label="源分支">
          <el-select v-model="createBranchDialog.form.sourceBranch" placeholder="选择源分支">
            <el-option
              v-for="branch in branches"
              :key="branch.name"
              :label="branch.name"
              :value="branch.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="新分支名称">
          <el-input v-model="createBranchDialog.form.name" placeholder="输入新分支名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="createBranchDialog.form.description"
            type="textarea"
            placeholder="分支描述（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createBranchDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="doCreateBranch">创建</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 合并分支对话框 -->
    <el-dialog v-model="mergeBranchDialog.visible" title="合并分支" width="500px" destroy-on-close>
      <el-form :model="mergeBranchDialog.form" label-width="120px">
        <el-form-item label="源分支">
          <el-input v-model="mergeBranchDialog.form.sourceBranch" disabled />
        </el-form-item>
        <el-form-item label="目标分支">
          <el-select v-model="mergeBranchDialog.form.targetBranch" placeholder="选择目标分支">
            <el-option
              v-for="branch in branches.filter(
                (b) => b.name !== mergeBranchDialog.form.sourceBranch
              )"
              :key="branch.name"
              :label="branch.name"
              :value="branch.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="合并方式">
          <el-radio-group v-model="mergeBranchDialog.form.mergeType">
            <el-radio :value="'merge'">普通合并 (Merge)</el-radio>
            <el-radio :value="'rebase'">变基 (Rebase)</el-radio>
            <el-radio :value="'squash'">压缩提交 (Squash)</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="合并信息">
          <el-input
            v-model="mergeBranchDialog.form.message"
            type="textarea"
            placeholder="合并提交信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="mergeBranchDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="doMergeBranch">合并</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
<<<<<<< Updated upstream
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  RefreshRight,
  Plus,
  Search,
  Star,
  Connection,
  Share,
  ArrowRight
} from '@element-plus/icons-vue'
=======
import { ref, onMounted, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue' // Changed from ElMessage, ElMessageBox
import BranchesToolbar from '@/components/BranchesView/BranchesToolbar.vue'
import BranchesList from '@/components/BranchesView/BranchesList.vue'
import BranchSidebar from '@/components/BranchesView/BranchSidebar.vue'
import CreateBranchDialog from '@/components/BranchesView/CreateBranchDialog.vue'
import MergeBranchDialog from '@/components/BranchesView/MergeBranchDialog.vue'
>>>>>>> Stashed changes
import dayjs from 'dayjs'

// 仓库数据
const repositories = [
  { id: 1, name: 'GitCommit' },
  { id: 2, name: 'WebProject' },
  { id: 3, name: 'APIService' }
]
const selectedRepo = ref(1)

// 加载状态
const loading = ref(false)
const graphReady = ref(false)

// 搜索过滤
const searchQuery = ref('')

// 分支数据
const branches = ref([
  {
    name: 'main',
    current: true,
    isRemote: false,
    commitsCount: 243,
    lastCommitHash: 'a1b2c3d4e5f6g7h8i9j0',
    lastCommitAuthor: '张三',
    lastCommitDate: '2023-09-15T14:30:00',
    lastCommitMessage: '更新依赖包和CI配置'
  },
  {
    name: 'dev',
    current: false,
    isRemote: false,
    commitsCount: 215,
    lastCommitHash: 'b2c3d4e5f6g7h8i9j0k1',
    lastCommitAuthor: '李四',
    lastCommitDate: '2023-09-14T10:15:00',
    lastCommitMessage: '修复用户认证模块的bug'
  },
  {
    name: 'feature/dashboard',
    current: false,
    isRemote: false,
    commitsCount: 87,
    lastCommitHash: 'c3d4e5f6g7h8i9j0k1l2',
    lastCommitAuthor: '王五',
    lastCommitDate: '2023-09-13T16:45:00',
    lastCommitMessage: '完成新版仪表盘的UI开发'
  },
  {
    name: 'feature/reports',
    current: false,
    isRemote: false,
    commitsCount: 52,
    lastCommitHash: 'd4e5f6g7h8i9j0k1l2m3',
    lastCommitAuthor: '赵六',
    lastCommitDate: '2023-09-12T09:20:00',
    lastCommitMessage: '增加PDF报表导出功能'
  },
  {
    name: 'origin/main',
    current: false,
    isRemote: true,
    commitsCount: 243,
    lastCommitHash: 'a1b2c3d4e5f6g7h8i9j0',
    lastCommitAuthor: '张三',
    lastCommitDate: '2023-09-15T14:30:00',
    lastCommitMessage: '更新依赖包和CI配置'
  },
  {
    name: 'origin/dev',
    current: false,
    isRemote: true,
    commitsCount: 211,
    lastCommitHash: 'b2c3d4e5f6g7h8i9j0k1',
    lastCommitAuthor: '李四',
    lastCommitDate: '2023-09-14T10:15:00',
    lastCommitMessage: '修复用户认证模块的bug'
  }
])

// 过滤后的分支列表
const filteredBranches = computed(() => {
  if (!searchQuery.value) return branches.value

  const query = searchQuery.value.toLowerCase()
  return branches.value.filter((branch) => {
    return (
      branch.name.toLowerCase().includes(query) ||
      branch.lastCommitMessage.toLowerCase().includes(query) ||
      branch.lastCommitAuthor.toLowerCase().includes(query)
    )
  })
})

// 分支统计数据
const branchStats = reactive({
  totalBranches: 6,
  activeBranches: 4,
  aheadCount: 8
})

// 合并请求数据
const mergeRequests = ref([
  {
    id: 1,
    title: '实现报表导出功能',
    source: 'feature/reports',
    target: 'dev',
    status: '待合并',
    author: '赵六',
    date: '2023-09-12T11:30:00'
  },
  {
    id: 2,
    title: '完成新版仪表盘UI',
    source: 'feature/dashboard',
    target: 'dev',
    status: '审核中',
    author: '王五',
    date: '2023-09-13T17:45:00'
  },
  {
    id: 3,
    title: '修复认证模块问题',
    source: 'dev',
    target: 'main',
    status: '已通过',
    author: '李四',
    date: '2023-09-14T14:20:00'
  }
])

// 新建分支对话框
const createBranchDialog = reactive({
  visible: false,
  form: {
    sourceBranch: 'main',
    name: '',
    description: ''
  }
})

// 合并分支对话框
const mergeBranchDialog = reactive({
  visible: false,
  form: {
    sourceBranch: '',
    targetBranch: 'main',
    mergeType: 'merge',
    message: ''
  }
})

// 获取合并请求状态类型
const getMrStatusType = (status: string): string => {
  switch (status) {
    case '待合并':
      return 'success'
    case '审核中':
      return 'warning'
    case '已通过':
      return 'info'
    default:
      return 'info'
  }
}

// 格式化日期
const formatDate = (dateString: string): string => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

// 刷新分支列表
const refreshBranches = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
    message.success('分支列表已刷新') // Changed from ElMessage
  }, 1000)
}

// 打开新建分支对话框
const createBranch = () => {
  createBranchDialog.form.sourceBranch = 'main'
  createBranchDialog.form.name = ''
  createBranchDialog.form.description = ''
  createBranchDialog.visible = true
}

// 创建分支
const doCreateBranch = () => {
  if (!createBranchDialog.form.name) {
    message.warning('请输入分支名称') // Changed from ElMessage
    return
  }

  loading.value = true

  setTimeout(() => {
    loading.value = false
    createBranchDialog.visible = false

    // 添加新分支到列表
    branches.value.push({
      name: createBranchDialog.form.name,
      current: false,
      isRemote: false,
      commitsCount:
        branches.value.find((b) => b.name === createBranchDialog.form.sourceBranch)?.commitsCount ||
        0,
      lastCommitHash:
        branches.value.find((b) => b.name === createBranchDialog.form.sourceBranch)
          ?.lastCommitHash || '',
      lastCommitAuthor:
        branches.value.find((b) => b.name === createBranchDialog.form.sourceBranch)
          ?.lastCommitAuthor || '',
      lastCommitDate: new Date().toISOString(),
      lastCommitMessage: `从 ${createBranchDialog.form.sourceBranch} 创建分支`
    })

    branchStats.totalBranches++
    branchStats.activeBranches++

    message.success(`已创建分支: ${createBranchDialog.form.name}`) // Changed from ElMessage
  }, 1000)
}

// 切换分支
const checkoutBranch = (branch: any) => {
  if (branch.isRemote) {
    message.warning('不能直接切换到远程分支') // Changed from ElMessage
    return
  }

  Modal.confirm({
    title: '切换分支',
    content: `确定要切换到分支 "${branch.name}" 吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      loading.value = true

      setTimeout(() => {
        loading.value = false

        // 更新当前分支状态
        branches.value.forEach((b) => {
          b.current = b.name === branch.name
        })

        message.success(`已切换到分支: ${branch.name}`) // Changed from ElMessage
      }, 1000)
    },
    onCancel() {
      // 用户取消操作
    },
  });
}

// 打开合并分支对话框
const mergeBranch = (branch: any) => {
  if (branch.isRemote) {
    message.warning('不能直接合并远程分支') // Changed from ElMessage
    return
  }

  mergeBranchDialog.form.sourceBranch = branch.name
  mergeBranchDialog.form.targetBranch = 'main'
  mergeBranchDialog.form.mergeType = 'merge'
  mergeBranchDialog.form.message = `将 ${branch.name} 合并到 main`
  mergeBranchDialog.visible = true
}

// 执行分支合并
const doMergeBranch = () => {
  if (!mergeBranchDialog.form.targetBranch) {
    message.warning('请选择目标分支') // Changed from ElMessage
    return
  }

  loading.value = true

  setTimeout(() => {
    loading.value = false
    mergeBranchDialog.visible = false

    message.success(
      `已将分支 ${mergeBranchDialog.form.sourceBranch} 合并到 ${mergeBranchDialog.form.targetBranch}`
    ) // Changed from ElMessage
  }, 1500)
}

// 删除分支
const deleteBranch = (branch: any) => {
  if (branch.name === 'main') {
    message.error('不能删除主分支') // Changed from ElMessage
    return
  }

  if (branch.current) {
    message.error('不能删除当前分支') // Changed from ElMessage
    return
  }

  Modal.confirm({
    title: '删除分支',
    content: `确定要删除分支 "${branch.name}" 吗？此操作不可撤销。`,
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      loading.value = true

      setTimeout(() => {
        loading.value = false

        // 从列表中移除分支
        const index = branches.value.findIndex((b) => b.name === branch.name)
        if (index !== -1) {
          branches.value.splice(index, 1)
        }

        branchStats.totalBranches--
        if (!branch.isRemote) {
          branchStats.activeBranches--
        }

        message.success(`已删除分支: ${branch.name}`) // Changed from ElMessage
      }, 1000)
    },
    onCancel() {
      // 用户取消操作
    },
  });
}

// 查看合并请求
const viewMergeRequest = (mergeRequest: any) => {
  message.info(`查看合并请求 #${mergeRequest.id}: ${mergeRequest.title}`) // Changed from ElMessage
}

// 批准并合并
const approveMergeRequest = (mergeRequest: any) => {
  if (mergeRequest.status !== '待合并') {
    return
  }

  Modal.confirm({
    title: '批准合并请求',
    content: `确定要批准并合并请求 "${mergeRequest.title}" 吗？`,
    okText: '批准并合并',
    cancelText: '取消',
    onOk() {
      loading.value = true

      setTimeout(() => {
        loading.value = false

        // 更新合并请求状态
        mergeRequest.status = '已通过'

        message.success(`已批准并合并: ${mergeRequest.title}`) // Changed from ElMessage
      }, 1500)
    },
    onCancel() {
      // 用户取消操作
    },
  });
}

// 初始化分支图
const initBranchGraph = () => {
  graphReady.value = true

  // 在实际项目中，这里会使用图形库(如D3.js)渲染分支图
  // 示例中使用setTimeout模拟异步加载
  setTimeout(() => {
    const container = document.getElementById('branchGraphContainer')
    if (container) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="margin: 10px 0;">图表加载中，这里将显示分支关系图</div>
          <img src="https://git-scm.com/book/en/v2/images/advance-master.png" 
               alt="Branch Graph Example" 
               style="max-width: 100%; height: auto;" />
        </div>
      `
    }
  }, 500)
}

// 组件挂载时执行
onMounted(() => {
  refreshBranches()

  // 创建分支图容器ID
  const graphContainer = document.querySelector('.branch-graph-container')
  if (graphContainer) {
    graphContainer.id = 'branchGraphContainer'
  }
})
</script>

<style scoped>
.branches-container {
  width: 100%;
  padding-top: 5px;
}

.branches-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--color-text);
  font-weight: 600;
}

.branches-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 180px;
}

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

.branch-visualization-card {
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

.merge-requests-card {
  margin-bottom: 20px;
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

.mr-5 {
  margin-right: 5px;
}

@media (max-width: 768px) {
  .branches-actions {
    flex-direction: column;
  }

  .filter-item {
    width: 100%;
  }
}
</style>