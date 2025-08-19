<template>
  <div class="repository-container">
    <RepositoryToolbar @addRepo="openRepositoryDialog" @refreshRepos="refreshRepositories" />

    <a-card v-if="repositories.length === 0" class="empty-state">
      <a-empty description="暂无仓库数据">
        <a-button type="primary" @click="openRepositoryDialog">添加仓库</a-button>
      </a-empty>
    </a-card>

    <RepositoryList
      v-else
      :repositories="repositories"
      :format-date="formatDate"
      @openRepo="openRepo"
      @analyzeRepo="analyzeRepo"
      @exportRepoData="exportRepoData"
      @openSettingsDialog="openSettingsDialog"
      @confirmRemoveRepo="confirmRemoveRepo"
    />

    <AddEditRepositoryDialog
      :visible="repositoryDialog.visible"
      :title="repositoryDialog.title"
      :is-edit="repositoryDialog.isEdit"
      :edit-id="repositoryDialog.editId"
      :form-data="repositoryDialog.formData"
      :available-tags="availableTags"
      @update:visible="repositoryDialog.visible = $event"
      @save="saveRepository"
    />

    <RepositorySettingsDialog
      :visible="settingsDialog.visible"
      :active-tab="settingsDialog.activeTab"
      :repo-id="settingsDialog.repoId"
      :branches="settingsDialog.branches"
      :form-data="settingsDialog.formData"
      @update:visible="settingsDialog.visible = $event"
      @save-settings="saveSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue' // Changed from ElMessage, ElMessageBox
import RepositoryToolbar from '@/components/RepositoryView/RepositoryToolbar.vue'
import RepositoryList from '@/components/RepositoryView/RepositoryList.vue'
import AddEditRepositoryDialog from '@/components/RepositoryView/AddEditRepositoryDialog.vue'
import RepositorySettingsDialog from '@/components/RepositoryView/RepositorySettingsDialog.vue'

import repositoryAvailableTagsData from '@/mock/repositoryAvailableTags.json'
import repositoriesMockData from '@mock/repositoriesData.json'

// 可用标签
const availableTags = ref(repositoryAvailableTagsData)

// 示例仓库数据
const repositories = ref(
  repositoriesMockData.map((repo) => ({ ...repo, lastUpdated: new Date(repo.lastUpdated) }))
)

// 格式化日期
const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 仓库对话框数据
const repositoryDialog = reactive({
  visible: false,
  title: '添加仓库',
  isEdit: false,
  editId: null,
  formData: {
    name: '',
    path: '',
    description: '',
    tags: [] as string[]
  },
  rules: {
    name: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
    path: [{ required: true, message: '请输入仓库路径', trigger: 'blur' }]
  }
})

// 仓库设置对话框数据
const settingsDialog = reactive({
  visible: false,
  activeTab: 'basic',
  repoId: null,
  branches: ['master', 'main', 'develop', 'feature/new-ui'],
  formData: {
    branch: 'main',
    dateRange: null,
    excludedDirs: ['node_modules', 'dist', '.git'],
    mergeSimilarAuthors: true,
    ignoreMergeCommits: true,
    onlyCountChangedFiles: false,
    analyzeCommitMessages: true
  }
})

// 打开添加仓库对话框
const openRepositoryDialog = () => {
  repositoryDialog.title = '添加仓库'
  repositoryDialog.isEdit = false
  repositoryDialog.editId = null
  repositoryDialog.formData = {
    name: '',
    path: '',
    description: '',
    tags: []
  }
  repositoryDialog.visible = true
}

// 保存仓库
const saveRepository = (data: any) => {
  if (data.isEdit && data.id) {
    const index = repositories.value.findIndex((r) => r.id === data.id)
    if (index !== -1) {
      repositories.value[index] = {
        ...repositories.value[index],
        name: data.name,
        path: data.path,
        description: data.description,
        tags: [...data.tags],
        lastUpdated: new Date()
      }
      message.success('仓库已更新')
    }
  } else {
    const newRepo = {
      id: Date.now(),
      name: data.name,
      path: data.path,
      description: data.description,
      commits: 0,
      contributors: 0,
      files: 0,
      tags: [...data.tags],
      lastUpdated: new Date()
    }
    repositories.value.push(newRepo)
    message.success('仓库已添加')
  }
  repositoryDialog.visible = false
}

// 刷新仓库列表
const refreshRepositories = () => {
  message.success('仓库列表已刷新')
}

// 打开仓库设置对话框
const openSettingsDialog = (repo: any) => {
  settingsDialog.repoId = repo.id
  settingsDialog.visible = true
}

// 保存仓库设置
const saveSettings = () => {
  message.success('设置已保存')
  settingsDialog.visible = false
}

// 打开仓库
const openRepo = (repo: any) => {
  message.info(`打开仓库: ${repo.name}`)
}

// 分析仓库
const analyzeRepo = (repo: any) => {
  message.info(`开始分析仓库: ${repo.name}`)
}

// 导出仓库数据
const exportRepoData = (repo: any) => {
  message.info(`导出仓库数据: ${repo.name}`)
}

// 确认删除仓库
const confirmRemoveRepo = (repo: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除仓库 ${repo.name} 吗？此操作不会删除磁盘上的文件，仅从列表中移除。`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      repositories.value = repositories.value.filter((r) => r.id !== repo.id)
      message.success('仓库已删除')
    },
    onCancel() {
      // 取消删除
    }
  })
}
</script>

<style scoped>
.repository-container {
  width: 100%;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.mr-5 {
  margin-right: 5px;
}
</style>
