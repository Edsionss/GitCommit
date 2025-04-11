<template>
  <el-card class="logs-component" id="logs-section">
    <div class="progress-header">
      <span>扫描进度</span>
      <div class="progress-actions">
        <el-tag type="info">{{ scanning ? scanStatus : '未开始' }}</el-tag>
        <el-button
          type="danger"
          size="small"
          @click="stopScanning"
          :disabled="!scanning"
          style="margin-left: 8px"
        >
          停止扫描
        </el-button>
      </div>
    </div>
    <el-progress
      :percentage="scanProgress"
      :format="progressFormat"
      :status="scanning ? '' : 'exception'"
    />
    <div class="log-area">
      <div class="log-header">
        <span>扫描日志</span>
        <div class="log-actions">
          <el-button size="small" @click="copyLogs" type="info">
            <el-icon><Document /></el-icon> 复制日志
          </el-button>
          <el-button size="small" @click="saveLogs" type="success">
            <el-icon><Download /></el-icon> 保存日志
          </el-button>
          <el-button size="small" @click="clearLogs">清空</el-button>
        </div>
      </div>
      <div class="markdown-logs custom-scrollbar">
        <el-scrollbar height="200px">
          <div v-if="scanLogs" v-html="formattedLogs" class="markdown-content"></div>
          <div v-else class="empty-logs">暂无日志，请先进行扫描操作</div>
        </el-scrollbar>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Download } from '@element-plus/icons-vue'
import { marked } from 'marked'

const emit = defineEmits(['stopScanning'])

// 状态变量
const scanProgress = ref(0)
const scanStatus = ref('准备中')
const scanLogs = ref('')
const scanning = ref(false)

// 格式化进度显示
const progressFormat = (percentage: number) => {
  return percentage === 100 ? '完成' : `${percentage}%`
}

// 格式化日志为Markdown
const formattedLogs = computed(() => {
  if (!scanLogs.value) return ''

  try {
    // 处理日志文本，添加Markdown格式
    let formattedText = scanLogs.value
      .replace(/\[(\d{2}:\d{2}:\d{2})\]/g, '**[$1]**') // 加粗时间戳
      .split('\n')
      .join('\n\n') // 确保每行之间有空行，便于Markdown解析

    // 用HTML标签直接标记颜色，因为Markdown不支持颜色
    formattedText = formattedText
      .replace(/失败|错误|error/gi, '<span class="log-error">$&</span>')
      .replace(/成功|完成|success|验证通过/gi, '<span class="log-success">$&</span>')

    // 使用marked解析Markdown
    return marked.parse(formattedText)
  } catch (error) {
    console.error('解析Markdown失败:', error)
    return `<pre>${scanLogs.value}</pre>` // 回退到普通文本展示
  }
})

// 添加日志
const addLog = (message: string) => {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  scanLogs.value += `[${timeStr}] ${message}\n`
}

// 清空日志
const clearLogs = () => {
  scanLogs.value = ''
}

// 停止扫描
const stopScanning = () => {
  if (scanning.value) {
    emit('stopScanning')
  }
}

// 复制日志到剪贴板
const copyLogs = () => {
  if (!scanLogs.value) {
    ElMessage.warning('没有可复制的日志')
    return
  }

  navigator.clipboard
    .writeText(scanLogs.value)
    .then(() => {
      ElMessage.success('日志已复制到剪贴板')
    })
    .catch((err) => {
      console.error('复制失败:', err)
      ElMessage.error('复制日志失败')
    })
}

// 保存日志到文件
const saveLogs = () => {
  if (!scanLogs.value) {
    ElMessage.warning('没有可保存的日志')
    return
  }

  // 模拟保存文件，实际应用中需要使用Electron的API
  const now = new Date()
  const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`

  // 这里可以调用electron的dialog.showSaveDialog和fs.writeFile
  // 由于这是模拟，我们只显示消息
  ElMessage.success(`日志已保存到 git_scan_log_${timestamp}.txt`)
  addLog(`日志已保存到 git_scan_log_${timestamp}.txt`)
}

// 暴露方法给父组件调用
defineExpose({
  addLog,
  clearLogs,
  setScanningState: (state: boolean) => {
    scanning.value = state
  },
  setScanStatus: (status: string) => {
    scanStatus.value = status
  },
  setScanProgress: (progress: number) => {
    scanProgress.value = progress
  }
})
</script>

<style scoped>
.logs-component {
  width: 100%;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-actions {
  display: flex;
  align-items: center;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0 8px;
}

.log-actions {
  display: flex;
  gap: 8px;
}

.log-area {
  margin-top: 16px;
}

.markdown-logs {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 13px;
  line-height: 1.6;
}

.empty-logs {
  color: #909399;
  font-style: italic;
  padding: 10px;
}

.log-error {
  color: #f56c6c;
  font-weight: bold;
}

.log-success {
  color: #67c23a;
  font-weight: bold;
}

.markdown-content {
  padding: 8px;
}

.markdown-content :deep(p) {
  margin: 4px 0;
  font-weight: normal;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: #303133;
}

.custom-scrollbar :deep(.el-scrollbar__thumb) {
  background-color: #409eff;
}
</style>
