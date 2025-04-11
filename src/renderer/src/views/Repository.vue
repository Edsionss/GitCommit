<template>
  <div class="repository-container">
    <div class="repository-header">
      <h2 class="page-title">代码仓库</h2>
      <div class="repository-actions">
        <el-button type="primary" @click="openRepositoryDialog">
          <el-icon class="mr-5"><FolderAdd /></el-icon>
          添加仓库
        </el-button>
        <el-button @click="refreshRepositories">
          <el-icon class="mr-5"><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <el-card v-if="repositories.length === 0" class="empty-state">
      <el-empty description="暂无仓库数据">
        <el-button type="primary" @click="openRepositoryDialog">添加仓库</el-button>
      </el-empty>
    </el-card>

    <div v-else class="repository-list">
      <el-row :gutter="20">
        <el-col v-for="repo in repositories" :key="repo.id" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="repo-card">
            <div class="repo-header">
              <el-avatar :size="40" class="repo-avatar">
                {{ repo.name.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="repo-info">
                <h3 class="repo-name">{{ repo.name }}</h3>
                <p class="repo-path text-secondary">{{ repo.path }}</p>
              </div>
              <el-dropdown trigger="click">
                <el-button type="info" text circle>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="openRepo(repo)">
                      <el-icon><View /></el-icon>
                      查看仓库
                    </el-dropdown-item>
                    <el-dropdown-item @click="analyzeRepo(repo)">
                      <el-icon><DataAnalysis /></el-icon>
                      分析仓库
                    </el-dropdown-item>
                    <el-dropdown-item @click="exportRepoData(repo)">
                      <el-icon><Download /></el-icon>
                      导出数据
                    </el-dropdown-item>
                    <el-dropdown-item @click="openSettingsDialog(repo)" divided>
                      <el-icon><Setting /></el-icon>
                      仓库设置
                    </el-dropdown-item>
                    <el-dropdown-item @click="confirmRemoveRepo(repo)" divided type="danger">
                      <el-icon><Delete /></el-icon>
                      删除仓库
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="repo-body">
              <div class="repo-stats">
                <div class="stat-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ repo.commits }} 提交</span>
                </div>
                <div class="stat-item">
                  <el-icon><User /></el-icon>
                  <span>{{ repo.contributors }} 贡献者</span>
                </div>
                <div class="stat-item">
                  <el-icon><Document /></el-icon>
                  <span>{{ repo.files }} 文件</span>
                </div>
              </div>
              <div class="repo-tags">
                <el-tag v-for="tag in repo.tags" :key="tag" size="small" class="mr-5">
                  {{ tag }}
                </el-tag>
              </div>
              <div class="repo-updated">最后更新: {{ formatDate(repo.lastUpdated) }}</div>
            </div>
            <div class="repo-footer">
              <el-button type="primary" @click="analyzeRepo(repo)">分析仓库</el-button>
              <el-button @click="openRepo(repo)">查看详情</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 添加/编辑仓库对话框 -->
    <el-dialog v-model="repositoryDialog.visible" :title="repositoryDialog.title" width="500px">
      <el-form
        ref="repoForm"
        :model="repositoryDialog.formData"
        :rules="repositoryDialog.rules"
        label-width="80px"
      >
        <el-form-item label="仓库名称" prop="name">
          <el-input v-model="repositoryDialog.formData.name" placeholder="输入仓库名称"></el-input>
        </el-form-item>
        <el-form-item label="仓库路径" prop="path">
          <el-input v-model="repositoryDialog.formData.path" placeholder="输入Git仓库本地路径">
            <template #append>
              <el-button @click="selectDirectory">
                <el-icon><FolderOpened /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="repositoryDialog.formData.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="可选，添加标签"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="repositoryDialog.formData.description"
            type="textarea"
            :rows="3"
            placeholder="可选，添加描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="repositoryDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveRepository">保存</el-button>
      </template>
    </el-dialog>

    <!-- 仓库设置对话框 -->
    <el-dialog v-model="settingsDialog.visible" title="仓库设置" width="500px">
      <el-tabs v-model="settingsDialog.activeTab">
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="settingsDialog.formData" label-width="100px">
            <el-form-item label="分析分支">
              <el-select v-model="settingsDialog.formData.branch" placeholder="选择要分析的分支">
                <el-option
                  v-for="branch in settingsDialog.branches"
                  :key="branch"
                  :label="branch"
                  :value="branch"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="日期范围">
              <el-date-picker
                v-model="settingsDialog.formData.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="排除目录">
              <el-select
                v-model="settingsDialog.formData.excludedDirs"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="输入要排除的目录"
              >
                <el-option
                  v-for="dir in ['node_modules', 'dist', '.git', 'build']"
                  :key="dir"
                  :label="dir"
                  :value="dir"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="高级设置" name="advanced">
          <el-form :model="settingsDialog.formData" label-width="160px">
            <el-form-item label="合并相似作者">
              <el-switch v-model="settingsDialog.formData.mergeSimilarAuthors"></el-switch>
            </el-form-item>
            <el-form-item label="忽略合并提交">
              <el-switch v-model="settingsDialog.formData.ignoreMergeCommits"></el-switch>
            </el-form-item>
            <el-form-item label="仅统计变更文件">
              <el-switch v-model="settingsDialog.formData.onlyCountChangedFiles"></el-switch>
            </el-form-item>
            <el-form-item label="分析提交信息">
              <el-switch v-model="settingsDialog.formData.analyzeCommitMessages"></el-switch>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="settingsDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  FolderAdd,
  Refresh,
  Calendar,
  User,
  Document,
  MoreFilled,
  View,
  DataAnalysis,
  Download,
  Setting,
  Delete,
  FolderOpened
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 可用标签
const availableTags = [
  'Web',
  'Mobile',
  'Desktop',
  'Backend',
  'Frontend',
  'Library',
  'API',
  'UI',
  '个人项目',
  '团队项目'
]

// 示例仓库数据
const repositories = ref([
  {
    id: 1,
    name: 'GitCommit',
    path: 'D:/Projects/GitCommit',
    description: 'Git提交记录分析工具',
    commits: 246,
    contributors: 5,
    files: 180,
    tags: ['Desktop', 'Frontend'],
    lastUpdated: new Date('2023-04-05')
  },
  {
    id: 2,
    name: 'WebProject',
    path: 'D:/Projects/WebProject',
    description: '一个Web项目',
    commits: 128,
    contributors: 3,
    files: 95,
    tags: ['Web', 'Frontend'],
    lastUpdated: new Date('2023-04-02')
  },
  {
    id: 3,
    name: 'APIService',
    path: 'D:/Projects/APIService',
    description: 'API服务',
    commits: 321,
    contributors: 7,
    files: 210,
    tags: ['Backend', 'API'],
    lastUpdated: new Date('2023-04-07')
  }
])

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

// 打开编辑仓库对话框
const editRepository = (repo: any) => {
  repositoryDialog.title = '编辑仓库'
  repositoryDialog.isEdit = true
  repositoryDialog.editId = repo.id
  repositoryDialog.formData = {
    name: repo.name,
    path: repo.path,
    description: repo.description || '',
    tags: [...repo.tags]
  }
  repositoryDialog.visible = true
}

// 保存仓库
const saveRepository = () => {
  // 这里应该有表单验证
  if (repositoryDialog.isEdit && repositoryDialog.editId) {
    // 编辑现有仓库
    const index = repositories.value.findIndex((r) => r.id === repositoryDialog.editId)
    if (index !== -1) {
      repositories.value[index] = {
        ...repositories.value[index],
        name: repositoryDialog.formData.name,
        path: repositoryDialog.formData.path,
        description: repositoryDialog.formData.description,
        tags: [...repositoryDialog.formData.tags],
        lastUpdated: new Date()
      }
      ElMessage.success('仓库已更新')
    }
  } else {
    // 添加新仓库
    const newRepo = {
      id: Date.now(),
      name: repositoryDialog.formData.name,
      path: repositoryDialog.formData.path,
      description: repositoryDialog.formData.description,
      commits: 0,
      contributors: 0,
      files: 0,
      tags: [...repositoryDialog.formData.tags],
      lastUpdated: new Date()
    }
    repositories.value.push(newRepo)
    ElMessage.success('仓库已添加')
  }
  repositoryDialog.visible = false
}

// 选择目录
const selectDirectory = () => {
  // 这里应该调用Electron的dialog.showOpenDialog
  // 模拟选择
  setTimeout(() => {
    repositoryDialog.formData.path = 'D:/Selected/Repository/Path'
  }, 500)
}

// 刷新仓库列表
const refreshRepositories = () => {
  // 这里应该重新加载仓库数据
  ElMessage.success('仓库列表已刷新')
}

// 打开仓库设置对话框
const openSettingsDialog = (repo: any) => {
  settingsDialog.repoId = repo.id
  settingsDialog.visible = true
}

// 保存仓库设置
const saveSettings = () => {
  // 保存设置
  ElMessage.success('设置已保存')
  settingsDialog.visible = false
}

// 打开仓库
const openRepo = (repo: any) => {
  // 跳转到仓库详情页面
  ElMessage.info(`打开仓库: ${repo.name}`)
}

// 分析仓库
const analyzeRepo = (repo: any) => {
  // 开始分析仓库
  ElMessage.info(`开始分析仓库: ${repo.name}`)
}

// 导出仓库数据
const exportRepoData = (repo: any) => {
  // 导出仓库数据
  ElMessage.info(`导出仓库数据: ${repo.name}`)
}

// 确认删除仓库
const confirmRemoveRepo = (repo: any) => {
  ElMessageBox.confirm(
    `确定要删除仓库 ${repo.name} 吗？此操作不会删除磁盘上的文件，仅从列表中移除。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      repositories.value = repositories.value.filter((r) => r.id !== repo.id)
      ElMessage.success('仓库已删除')
    })
    .catch(() => {
      // 取消删除
    })
}
</script>

<style scoped>
.repository-container {
  width: 100%;
}

.repository-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.repository-actions {
  display: flex;
  gap: 10px;
}

.mr-5 {
  margin-right: 5px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.repository-list {
  margin-top: 20px;
}

.repo-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.repo-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg) !important;
}

.repo-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.repo-avatar {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
}

.repo-info {
  margin-left: 12px;
  flex: 1;
}

.repo-name {
  margin: 0 0 5px 0;
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.repo-path {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  word-break: break-all;
}

.repo-body {
  flex: 1;
  margin-bottom: 15px;
}

.repo-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stat-item .el-icon {
  margin-right: 5px;
}

.repo-tags {
  margin-bottom: 10px;
}

.repo-updated {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.repo-footer {
  display: flex;
  gap: 10px;
}

.text-secondary {
  color: var(--text-secondary);
}
</style>
