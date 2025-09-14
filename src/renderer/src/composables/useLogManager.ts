import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { marked } from 'marked'

export function useLogManager() {
  const scanLogs = ref('')

  const formattedLogs = computed(() => {
    if (!scanLogs.value) return ''
    try {
      let formattedText = scanLogs.value
        .replace(/[\[\](\d{2}:\d{2}:\d{2})\]]/g, '**[$1]**')
        .replace(/\n/g, '  \n')

      formattedText = formattedText
        .replace(/失败|错误|error/gi, '<span class="log-error">$&</span>')
        .replace(/成功|完成|success|验证通过/gi, '<span class="log-success">$&</span>')

      return marked.parse(formattedText)
    } catch (error) {
      console.error('解析Markdown失败:', error)
      return `<pre>${scanLogs.value}</pre>`
    }
  })

  const addLog = (logMessage: string) => {
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    scanLogs.value += `[${timeStr}] ${logMessage}\n`
  }

  const clearLogs = () => {
    scanLogs.value = ''
  }

  const copyLogs = () => {
    if (!scanLogs.value) {
      message.warning('没有可复制的日志')
      return
    }
    navigator.clipboard
      .writeText(scanLogs.value)
      .then(() => {
        message.success('日志已复制到剪贴板')
      })
      .catch((err) => {
        console.error('复制失败:', err)
        message.error('复制日志失败')
      })
  }

  const saveLogs = () => {
    if (!scanLogs.value) {
      message.warning('没有可保存的日志')
      return
    }
    // In a real app, this would invoke an Electron API
    message.info('保存日志功能需要主进程支持。')
  }

  return {
    scanLogs,
    formattedLogs,
    addLog,
    clearLogs,
    copyLogs,
    saveLogs
  }
}
