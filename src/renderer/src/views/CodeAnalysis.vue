<template>
  <div class="code-analysis-container">
    <CodeAnalysisToolbar
      :repositories="repositories"
      v-model="selectedRepo"
      @analyze="analyzeCode"
    />

    <a-tabs v-model:activeKey="activeTab" class="analysis-tabs">
      <a-tab-pane key="quality" tab="代码质量">
        <CodeQualityOverview :loading="loading" :code-stats="codeStats" :code-issues="codeIssues" />
      </a-tab-pane>

      <a-tab-pane key="structure" tab="代码结构">
        <CodeStructureAnalysis :loading="loading" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue' // Changed from ElMessage
import CodeAnalysisToolbar from '@/components/CodeAnalysisView/CodeAnalysisToolbar.vue'
import CodeQualityOverview from '@/components/CodeAnalysisView/CodeQualityOverview.vue'
import CodeStructureAnalysis from '@/components/CodeAnalysisView/CodeStructureAnalysis.vue'
import { Tabs, TabPane, Row, Col } from 'ant-design-vue'

// 示例仓库数据
const repositories = [
  { id: 1, name: 'GitCommit' },
  { id: 2, name: 'WebProject' },
  { id: 3, name: 'APIService' }
]

// 状态变量
const selectedRepo = ref(1)
const activeTab = ref('quality')
const loading = ref(false)

// 代码统计数据
const codeStats = reactive({
  totalFiles: 326,
  avgComplexity: 4.8,
  issues: 47,
  qualityScore: '8.6/10'
})

// 代码问题数据
const codeIssues = [
  {
    file: 'src/components/Header.tsx',
    line: 43,
    type: '错误',
    message: '未使用的变量',
    severity: '高'
  },
  {
    file: 'src/utils/formatters.ts',
    line: 27,
    type: '警告',
    message: '未处理的Promise拒绝',
    severity: '中'
  },
  {
    file: 'src/views/Dashboard.vue',
    line: 128,
    type: '警告',
    message: '复杂性过高',
    severity: '中'
  },
  { file: 'src/api/services.js', line: 75, type: '错误', message: '可能的空引用', severity: '高' },
  {
    file: 'src/store/index.ts',
    line: 156,
    type: '信息',
    message: '可简化的条件语句',
    severity: '低'
  },
  { file: 'src/router/index.ts', line: 92, type: '警告', message: '未处理的异常', severity: '中' }
]

// 分析代码
const analyzeCode = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
    message.success('代码分析已完成') // Changed from ElMessage
  }, 1500)
}
</script>

<style scoped>
.code-analysis-container {
  width: 100%;
}

.analysis-tabs {
  margin-bottom: 20px;
}

.mr-5 {
  margin-right: 5px;
}
</style>
