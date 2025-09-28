import { session, app } from 'electron'
import { execSync } from 'child_process'
import { settingsService } from '@features/services/settings'
import { registerIpcHandlers } from '@handlers/ipcHandlers'
import { startWebSocketServer, stopWebSocketServer } from '@services/websocket'
import { db } from '@features/database'
import { is } from '@electron-toolkit/utils'
import { telegraphTest, thsTest, AutomaticallyFillWorkSheet } from '@nodeUtils/scraping'
// 创建窗口前的周期函数
export const beforeCreate = () => {
  // 在开发模式下，设置远程调试端口
  const DEBUG_PORT = '9222' // 选择一个未被占用的端口
  app.commandLine.appendSwitch('remote-debugging-port', DEBUG_PORT)

  // 如果是 Windows，尝试设置控制台编码为 UTF-8
  if (process.platform === 'win32') {
    try {
      execSync('chcp 65001')
    } catch (e) {
      console.warn('Failed to set console code page:', e)
    }
  }
  // 确保 stdout/stderr 默认用 utf-8
  process.stdout.setDefaultEncoding('utf8')
  process.stderr.setDefaultEncoding('utf8')
}
// 创建窗口时的周期函数
export const customCreateWindow = () => {
  // IPC 注册
  registerIpcHandlers()
  // 修改会话的 CSP
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // 根据开发环境和生产环境构建动态的 script-src 策略
    const scriptSrc = ["'self'"]
    if (is.dev) {
      // Vite 的 HMR 需要 'unsafe-eval'
      scriptSrc.push("'unsafe-eval'")
    }

    // 整合所有的 CSP 策略
    const cspPolicies = [
      "default-src 'self'",
      `script-src ${scriptSrc.join(' ')}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://i.pravatar.cc https://*.cdn.com https://*.element-plus.org",
      // 允许连接到任意 WebSocket 地址，修复局域网连接问题
      "connect-src 'self' ws:"
    ]

    // 设置响应头
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [cspPolicies.join('; ')]
      }
    })
  })
}

// 运行就绪时的周期函数
export const whenReady = () => {
  // WebSocket 服务器启动
  startWebSocketServer()

  // 同步开机自启设置
  const storedAutoStart = settingsService.getStoredAutoStartSetting()
  const actualAutoStart = settingsService.getAutoStartStatus()
  if (storedAutoStart && !actualAutoStart) {
    settingsService.setAutoStart(true) // 重新应用设置
  }

  // telegraphTest()
  // thsTest()
  // AutomaticallyFillWorkSheet({})
}
// 应用即将退出的周期函数
export const willQuit = () => {
  // 停止 WebSocket 服务器
  stopWebSocketServer()
  // 在这里关闭数据库连接
  if (db) {
    // 您的 db 实例
    console.log('Closing database connection...')
    db.close()
    console.log('Database connection closed.')
  }
}
// 激活应用时的周期函数
export const activate = () => {}
