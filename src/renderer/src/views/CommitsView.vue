<template>
  <div class="commits-container">
    <div class="toolbar">
      <div class="repo-selector">
        <el-select v-model="selectedRepo" placeholder="选择仓库" filterable>
          <el-option
            v-for="repo in repositories"
            :key="repo.id"
            :label="repo.name"
            :value="repo.id"
          />
        </el-select>
      </div>

      <div class="filters">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :shortcuts="dateShortcuts"
        />

        <el-select v-model="selectedBranch" placeholder="分支" filterable>
          <el-option v-for="branch in branches" :key="branch" :label="branch" :value="branch" />
        </el-select>

        <el-select v-model="selectedAuthor" placeholder="作者" filterable allow-create>
          <el-option v-for="author in authors" :key="author" :label="author" :value="author" />
        </el-select>

        <el-input v-model="searchKeyword" placeholder="搜索提交信息" clearable class="search-input">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="actions">
        <el-button type="primary" @click="refreshCommits">
          <el-icon><RefreshRight /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="main-content" v-loading="loading">
      <div class="commits-list" v-if="commits.length > 0">
        <div
          v-for="(commit, index) in filteredCommits"
          :key="commit.hash"
          class="commit-item"
          :class="{ active: selectedCommitIndex === index }"
          @click="selectCommit(index)"
        >
          <div class="commit-header">
            <div class="commit-title">{{ commit.title }}</div>
            <div class="commit-hash">{{ commit.hash.substring(0, 7) }}</div>
          </div>

          <div class="commit-info">
            <div class="commit-author">
              <el-avatar :size="24" :src="getAvatarUrl(commit.authorEmail)"></el-avatar>
              <span>{{ commit.author }}</span>
            </div>
            <div class="commit-time">{{ formatDate(commit.date) }}</div>
          </div>

          <div class="commit-stats">
            <div class="commit-files">
              <el-icon><Document /></el-icon> {{ commit.files.length }} 文件
            </div>
            <div class="commit-changes">
              <span class="additions">+{{ commit.additions }}</span>
              <span class="deletions">-{{ commit.deletions }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <el-empty description="暂无提交记录" v-if="!loading">
          <el-button type="primary" @click="refreshCommits">刷新提交记录</el-button>
        </el-empty>
      </div>

      <div class="commit-details" v-if="selectedCommit">
        <el-tabs>
          <el-tab-pane label="提交详情">
            <div class="commit-detail-header">
              <h2 class="commit-title">{{ selectedCommit.title }}</h2>
              <div class="commit-hash">
                <span>完整哈希值：</span>
                <el-tag size="small" @click="copyToClipboard(selectedCommit.hash)">
                  {{ selectedCommit.hash }}
                  <el-icon><CopyDocument /></el-icon>
                </el-tag>
              </div>
            </div>

            <div class="commit-meta">
              <div class="meta-item">
                <span class="meta-label">作者：</span>
                <span class="meta-value"
                  >{{ selectedCommit.author }} &lt;{{ selectedCommit.authorEmail }}&gt;</span
                >
              </div>
              <div class="meta-item">
                <span class="meta-label">日期：</span>
                <span class="meta-value">{{
                  formatDate(selectedCommit.date, 'YYYY-MM-DD HH:mm:ss')
                }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">分支：</span>
                <span class="meta-value">
                  <el-tag size="small" v-for="branch in selectedCommit.branches" :key="branch">
                    {{ branch }}
                  </el-tag>
                </span>
              </div>
            </div>

            <div class="commit-message" v-if="selectedCommit.fullMessage">
              <h3>提交信息</h3>
              <pre>{{ selectedCommit.fullMessage }}</pre>
            </div>

            <div class="commit-parent" v-if="selectedCommit.parents.length > 0">
              <h3>父提交</h3>
              <div class="parent-hashes">
                <el-tag
                  v-for="parent in selectedCommit.parents"
                  :key="parent"
                  size="small"
                  @click="loadCommit(parent)"
                >
                  {{ parent.substring(0, 7) }}
                </el-tag>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="变更文件">
            <div class="files-summary">
              <div class="files-count">
                <span>共 {{ selectedCommit.files.length }} 个文件变更</span>
                <span class="changes-summary">
                  <span class="additions">+{{ selectedCommit.additions }}</span>
                  <span class="deletions">-{{ selectedCommit.deletions }}</span>
                </span>
              </div>

              <div class="files-filter">
                <el-input v-model="fileFilter" placeholder="筛选文件" clearable size="small">
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
            </div>

            <div class="file-list">
              <div
                v-for="(file, fileIndex) in filteredFiles"
                :key="file.path"
                class="file-item"
                :class="{ active: selectedFileIndex === fileIndex }"
                @click="selectFile(fileIndex)"
              >
                <div class="file-icon">
                  <el-icon v-if="file.status === 'added'"><Plus /></el-icon>
                  <el-icon v-else-if="file.status === 'modified'"><Edit /></el-icon>
                  <el-icon v-else-if="file.status === 'deleted'"><Delete /></el-icon>
                  <el-icon v-else-if="file.status === 'renamed'"><Right /></el-icon>
                </div>

                <div class="file-path">{{ file.path }}</div>

                <div class="file-changes">
                  <span class="additions">+{{ file.additions }}</span>
                  <span class="deletions">-{{ file.deletions }}</span>
                </div>
              </div>
            </div>

            <div class="diff-viewer" v-if="selectedFile">
              <div class="diff-header">
                <div class="file-path">{{ selectedFile.path }}</div>
                <div class="diff-actions">
                  <el-button-group>
                    <el-button size="small" :disabled="!canShowSideBySide">
                      <el-icon><DCaret /></el-icon> 并排视图
                    </el-button>
                    <el-button size="small">
                      <el-icon><Bottom /></el-icon> 统一视图
                    </el-button>
                  </el-button-group>
                </div>
              </div>

              <div class="diff-content">
                <!-- 这里放置差异内容 -->
                <pre v-if="selectedFile.diff" class="diff-code">{{ selectedFile.diff }}</pre>
                <el-empty description="无法显示差异" v-else></el-empty>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
<<<<<<< Updated upstream
import {
  RefreshRight,
  Search,
  Document,
  CopyDocument,
  Plus,
  Edit,
  Delete,
  Right,
  DCaret,
  Bottom
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
=======
import { message } from 'ant-design-vue' // Changed from ElMessage
import CommitsToolbar from '@/components/CommitsView/CommitsToolbar.vue'
import CommitsList from '@/components/CommitsView/CommitsList.vue'
import CommitDetails from '@/components/CommitsView/CommitDetails.vue'

import repositoriesData from '@/mock/repositories.json'
import branchesData from '@/mock/branches.json'
import authorsData from '@/mock/authors.json'
import commitsData from '@/mock/commits.json'
>>>>>>> Stashed changes

// 加载状态
const loading = ref(false)

// 仓库数据
const repositories = ref([
  { id: 1, name: 'electron-app' },
  { id: 2, name: 'vue-project' },
  { id: 3, name: 'react-dashboard' }
])
const selectedRepo = ref(1)

// 分支数据
const branches = ref(['main', 'dev', 'feature/dashboard', 'feature/reports'])
const selectedBranch = ref('main')

// 作者数据
const authors = ref(['张三', '李四', '王五', '赵六'])
const selectedAuthor = ref('')

// 日期范围
const dateRange = ref([
  dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD')
])

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 搜索关键词
const searchKeyword = ref('')

// 提交数据
const commits = ref([
  {
    hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    title: '添加报表导出功能',
    fullMessage: '添加报表导出功能\n\n实现了Excel和PDF格式的报表导出\n解决了#123问题',
    author: '张三',
    authorEmail: 'zhangsan@example.com',
    date: '2023-09-15T14:30:00',
    additions: 156,
    deletions: 23,
    branches: ['main', 'dev'],
    parents: ['9876543210abcdef9876543210abcdef98765432'],
    files: [
      {
        path: 'src/renderer/src/views/Reports.vue',
        status: 'added',
        additions: 120,
        deletions: 0,
        diff: '@@ -0,0 +1,120 @@\n+<template>\n+  <div class="reports-container">\n+    <h2>报表生成</h2>\n+    <!-- 更多代码 -->\n+  </div>\n+</template>'
      },
      {
        path: 'src/renderer/src/utils/exportUtils.ts',
        status: 'modified',
        additions: 36,
        deletions: 23,
        diff: '@@ -10,7 +10,10 @@\n function exportToExcel() {\n-  // 旧实现\n+  // 新实现\n+  // 添加了更多功能\n+  // 支持自定义格式\n }'
      }
    ]
  },
  {
    hash: '9876543210abcdef9876543210abcdef98765432',
    title: '修复导航栏响应式布局问题',
    fullMessage: '修复导航栏响应式布局问题\n\n在小屏幕设备上修复了布局错乱的问题',
    author: '李四',
    authorEmail: 'lisi@example.com',
    date: '2023-09-14T10:15:00',
    additions: 42,
    deletions: 18,
    branches: ['main'],
    parents: ['abcdef1234567890abcdef1234567890abcdef12'],
    files: [
      {
        path: 'src/renderer/src/components/TheHeader.vue',
        status: 'modified',
        additions: 25,
        deletions: 10,
        diff: '@@ -15,10 +15,25 @@\n .responsive-nav {\n-  display: block;\n+  display: flex;\n+  flex-direction: column;\n+  @media (min-width: 768px) {\n+    flex-direction: row;\n+  }\n }'
      },
      {
        path: 'src/renderer/src/App.vue',
        status: 'modified',
        additions: 17,
        deletions: 8,
        diff: '@@ -22,8 +22,17 @@\n <style>\n .app-container {\n-  /* 旧样式 */\n+  /* 新样式 */\n+  display: grid;\n+  grid-template-columns: 1fr;\n+  @media (min-width: 768px) {\n+    grid-template-columns: 250px 1fr;\n+  }\n }\n </style>'
      }
    ]
  }
])

// 选中的提交
const selectedCommitIndex = ref(0)
const selectedCommit = computed(() => {
  return selectedCommitIndex.value >= 0 && selectedCommitIndex.value < filteredCommits.value.length
    ? filteredCommits.value[selectedCommitIndex.value]
    : null
})

// 选中的文件
const selectedFileIndex = ref(0)
const selectedFile = computed(() => {
  if (!selectedCommit.value) return null

  return selectedFileIndex.value >= 0 && selectedFileIndex.value < filteredFiles.value.length
    ? filteredFiles.value[selectedFileIndex.value]
    : null
})

// 文件过滤
const fileFilter = ref('')
const filteredFiles = computed(() => {
  if (!selectedCommit.value) return []

  if (!fileFilter.value) return selectedCommit.value.files

  return selectedCommit.value.files.filter((file) =>
    file.path.toLowerCase().includes(fileFilter.value.toLowerCase())
  )
})

// 提交过滤
const filteredCommits = computed(() => {
  let result = commits.value

  // 按作者过滤
  if (selectedAuthor.value) {
    result = result.filter((commit) => commit.author === selectedAuthor.value)
  }

  // 按日期范围过滤
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const startDate = dayjs(dateRange.value[0])
    const endDate = dayjs(dateRange.value[1]).endOf('day')

    result = result.filter((commit) => {
      const commitDate = dayjs(commit.date)
      return commitDate.isAfter(startDate) && commitDate.isBefore(endDate)
    })
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (commit) =>
        commit.title.toLowerCase().includes(keyword) ||
        (commit.fullMessage && commit.fullMessage.toLowerCase().includes(keyword))
    )
  }

  return result
})

// 显示并排视图
const canShowSideBySide = computed(() => {
  return (
    selectedFile.value &&
    selectedFile.value.status !== 'deleted' &&
    selectedFile.value.status !== 'added'
  )
})

// 方法
const selectCommit = (index: number) => {
  selectedCommitIndex.value = index
  selectedFileIndex.value = 0
}

const selectFile = (index: number) => {
  selectedFileIndex.value = index
}

const refreshCommits = () => {
  loading.value = true

  // 模拟API请求
  setTimeout(() => {
<<<<<<< Updated upstream
    loading.value = false
    ElMessage.success('提交记录已刷新')
  }, 1000)
}
=======
    loading.value = false;
    message.success('提交记录已刷新'); // Changed from ElMessage
  }, 1000);
};
>>>>>>> Stashed changes

const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
<<<<<<< Updated upstream
      ElMessage.success('已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}
=======
      message.success('已复制到剪贴板'); // Changed from ElMessage
    })
    .catch(() => {
      message.error('复制失败'); // Changed from ElMessage
    });
};
>>>>>>> Stashed changes

const formatDate = (dateString: string, format = 'YYYY-MM-DD HH:mm') => {
  return dayjs(dateString).format(format)
}

const getAvatarUrl = (email: string) => {
  // 基于邮箱生成头像URL，实际项目中可能会使用Gravatar等服务
  const hash = btoa(email).substring(0, 12)
  return `https://i.pravatar.cc/150?u=${hash}`
}

const loadCommit = (hash: string) => {
<<<<<<< Updated upstream
  // 实际项目中这里会请求特定提交的详细信息
  ElMessage.info(`加载提交: ${hash}`)
}
=======
  message.info(`加载提交: ${hash}`); // Changed from ElMessage
};
>>>>>>> Stashed changes

// 监听仓库变化
watch(selectedRepo, () => {
  refreshCommits()
})

// 监听分支变化
watch(selectedBranch, () => {
  refreshCommits()
})

// 挂载时获取数据
onMounted(() => {
  refreshCommits()
})
</script>

<style scoped>
.commits-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  background-color: var(--color-background-soft);
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.repo-selector {
  min-width: 200px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.search-input {
  min-width: 200px;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.commits-list {
  width: 350px;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.commit-item {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s;
}

.commit-item:hover {
  background-color: var(--color-background-soft);
}

.commit-item.active {
  background-color: var(--color-background-mute);
}

.commit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.commit-title {
  flex: 1;
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.commit-hash {
  font-family: monospace;
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
}

.commit-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.commit-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-sm);
}

.commit-time {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.commit-stats {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.commit-files {
  display: flex;
  align-items: center;
  gap: 4px;
}

.commit-changes {
  display: flex;
  gap: 8px;
}

.additions {
  color: var(--color-success);
}

.deletions {
  color: var(--color-danger);
}

.commit-details {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.commit-detail-header {
  margin-bottom: 16px;
}

.commit-meta {
  background-color: var(--color-background-soft);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.meta-item {
  margin-bottom: 8px;
}

.meta-label {
  font-weight: var(--font-weight-medium);
  margin-right: 8px;
}

.commit-message {
  margin-bottom: 16px;
}

.commit-message pre {
  background-color: var(--color-background-soft);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
}

.parent-hashes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.files-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.changes-summary {
  margin-left: 12px;
}

.file-list {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
}

.file-item:hover {
  background-color: var(--color-background-soft);
}

.file-item.active {
  background-color: var(--color-background-mute);
}

.file-icon {
  margin-right: 8px;
}

.file-path {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-changes {
  display: flex;
  gap: 8px;
}

.diff-viewer {
  margin-top: 16px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.diff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--color-background-mute);
  border-bottom: 1px solid var(--color-border);
}

.diff-content {
  overflow-x: auto;
}

.diff-code {
  margin: 0;
  padding: 12px;
  font-family: monospace;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  white-space: pre;
}

.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .commits-list {
    width: 100%;
    max-height: 300px;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
}
</style>
