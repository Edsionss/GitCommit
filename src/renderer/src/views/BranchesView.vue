<template>
  <div class="branches-container">
    <BranchesToolbar 
      :repositories="repositories"
      v-model="selectedRepo"
      @refresh="refreshBranches"
      @create="createBranch"
    />

    <el-row :gutter="20">
      <el-col :xs="24" :lg="16">
        <BranchesList 
          :branches="branches"
          :loading="loading"
          :format-date="formatDate"
          @checkout="checkoutBranch"
          @merge="mergeBranch"
          @delete="deleteBranch"
        />
      </el-col>

      <el-col :xs="24" :lg="8">
        <BranchSidebar 
          :branch-stats="branchStats"
          :merge-requests="mergeRequests"
          :format-date="formatDate"
          @view-merge-request="viewMergeRequest"
          @approve-merge-request="approveMergeRequest"
        />
      </el-col>
    </el-row>

    <CreateBranchDialog 
      :visible="createBranchDialog.visible"
      :branches="branches"
      @update:visible="createBranchDialog.visible = $event"
      @create="doCreateBranch"
    />

    <MergeBranchDialog 
      :visible="mergeBranchDialog.visible"
      :branches="branches"
      :source-branch="mergeBranchDialog.form.sourceBranch"
      @update:visible="mergeBranchDialog.visible = $event"
      @merge="doMergeBranch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BranchesToolbar from '@/components/BranchesView/BranchesToolbar.vue'
import BranchesList from '@/components/BranchesView/BranchesList.vue'
import BranchSidebar from '@/components/BranchesView/BranchSidebar.vue'
import CreateBranchDialog from '@/components/BranchesView/CreateBranchDialog.vue'
import MergeBranchDialog from '@/components/BranchesView/MergeBranchDialog.vue'
import dayjs from 'dayjs'

import repositoriesData from '@/mock/repositories.json'
import branchesData from '@/mock/branchesView.json'
import branchStatsData from '@/mock/branchStats.json'
import mergeRequestsData from '@/mock/mergeRequests.json'

// 数据
const repositories = ref(repositoriesData)
const branches = ref(branchesData)
const branchStats = reactive(branchStatsData)
const mergeRequests = ref(mergeRequestsData)

const selectedRepo = ref(1)
const loading = ref(false)

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



// 格式化日期
const formatDate = (dateString: string): string => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

// 刷新分支列表
const refreshBranches = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
    ElMessage.success('分支列表已刷新')
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
    ElMessage.warning('请输入分支名称')
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

    ElMessage.success(`已创建分支: ${createBranchDialog.form.name}`)
  }, 1000)
}

// 切换分支
const checkoutBranch = (branch: any) => {
  if (branch.isRemote) {
    ElMessage.warning('不能直接切换到远程分支')
    return
  }

  ElMessageBox.confirm(`确定要切换到分支 "${branch.name}" 吗？`, '切换分支', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      loading.value = true

      setTimeout(() => {
        loading.value = false

        // 更新当前分支状态
        branches.value.forEach((b) => {
          b.current = b.name === branch.name
        })

        ElMessage.success(`已切换到分支: ${branch.name}`)
      }, 1000)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 打开合并分支对话框
const mergeBranch = (branch: any) => {
  if (branch.isRemote) {
    ElMessage.warning('不能直接合并远程分支')
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
    ElMessage.warning('请选择目标分支')
    return
  }

  loading.value = true

  setTimeout(() => {
    loading.value = false
    mergeBranchDialog.visible = false

    ElMessage.success(
      `已将分支 ${mergeBranchDialog.form.sourceBranch} 合并到 ${mergeBranchDialog.form.targetBranch}`
    )
  }, 1500)
}

// 删除分支
const deleteBranch = (branch: any) => {
  if (branch.name === 'main') {
    ElMessage.error('不能删除主分支')
    return
  }

  if (branch.current) {
    ElMessage.error('不能删除当前分支')
    return
  }

  ElMessageBox.confirm(`确定要删除分支 "${branch.name}" 吗？此操作不可撤销。`, '删除分支', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
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

        ElMessage.success(`已删除分支: ${branch.name}`)
      }, 1000)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 查看合并请求
const viewMergeRequest = (mergeRequest: any) => {
  ElMessage.info(`查看合并请求 #${mergeRequest.id}: ${mergeRequest.title}`)
}

// 批准并合并
const approveMergeRequest = (mergeRequest: any) => {
  if (mergeRequest.status !== '待合并') {
    return
  }

  ElMessageBox.confirm(`确定要批准并合并请求 "${mergeRequest.title}" 吗？`, '批准合并请求', {
    confirmButtonText: '批准并合并',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      loading.value = true

      setTimeout(() => {
        loading.value = false

        // 更新合并请求状态
        mergeRequest.status = '已通过'

        ElMessage.success(`已批准并合并: ${mergeRequest.title}`)
      }, 1500)
    })
    .catch(() => {
      // 用户取消操作
    })
}



// 组件挂载时执行
onMounted(() => {
  refreshBranches()
})
</script>

<style scoped>
.branches-container {
  width: 100%;
  padding-top: 5px;
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
