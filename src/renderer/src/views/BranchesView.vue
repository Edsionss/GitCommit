<template>
  <div class="branches-container">
    <div class="branches-header">
      <BranchesToolbar
        :repositories="repositories"
        :selected-repo="selectedRepo"
        @update:selectedRepo="selectedRepo = $event"
        @refresh="refreshBranches"
        @create="createBranch"
      />
    </div>

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

    <CreateBranchDialog
      v-model:visible="createBranchDialog.visible"
      :form="createBranchDialog.form"
      :branches="branches"
      @create="doCreateBranch"
    />

    <MergeBranchDialog
      v-model:visible="mergeBranchDialog.visible"
      :form="mergeBranchDialog.form"
      :branches="branches"
      @merge="doMergeBranch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { message, Modal } from 'ant-design-vue' // Changed from ElMessage, ElMessageBox
import BranchesToolbar from '@/components/BranchesView/BranchesToolbar.vue'
import BranchesList from '@/components/BranchesView/BranchesList.vue'
import BranchSidebar from '@/components/BranchesView/BranchSidebar.vue'
import CreateBranchDialog from '@/components/BranchesView/CreateBranchDialog.vue'
import MergeBranchDialog from '@/components/BranchesView/MergeBranchDialog.vue'
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
    }
  })
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
    }
  })
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
    }
  })
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

@media (max-width: 768px) {
  .branches-actions {
    flex-direction: column;
  }
}
</style>
