import { app, shell, BrowserWindow, ipcMain, dialog, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../build/CognitoOcean1.png?asset' // Vite/TypeScript 可能会帮你处理这个导入，但路径更可靠
import { registerIpcHandlers } from '@handlers/ipcHandlers'
import { startWebSocketServer, stopWebSocketServer } from '@services/websocket'
import { getLocalIpAddress } from '@nodeUtils/index'

// 创建窗口
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../build/CognitoOcean1.png'), // Windows和Linux会使用这个
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  // 修改会话的 CSP
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // 1. 定义你的 WebSocket 端口
    const wsPort = 8888 // <--- 如果你的端口号不是8888，请在这里修改

    // 2. 动态获取本机的局域网 IP 地址
    const localIp = getLocalIpAddress()

    // 3. 构建动态的 connect-src 策略
    // 基础策略总是允许 'self' 和 'localhost'
    const connectSrc = ["'self'", `ws://localhost:${wsPort}`]
    // 如果获取到了局域网 IP，就把它也加入白名单
    if (localIp) {
      connectSrc.push(`ws://${localIp}:${wsPort}`)
    }

    // 4. 根据开发环境和生产环境构建动态的 script-src 策略
    const scriptSrc = ["'self'"]
    if (is.dev) {
      // Vite 的 HMR 需要 'unsafe-eval'
      scriptSrc.push("'unsafe-eval'")
    }

    // 5. 整合所有的 CSP 策略
    const cspPolicies = [
      "default-src 'self'",
      `script-src ${scriptSrc.join(' ')}`,
      "style-src 'self' 'unsafe-inline'",
      // 这里是你之前定义的 img-src 规则，保持不变
      "img-src 'self' data: https://i.pravatar.cc https://*.cdn.com https://*.element-plus.org",
      // 使用我们动态生成的 connect-src
      `connect-src ${connectSrc.join(' ')}`
    ]

    // 6. 设置响应头
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          // 将所有策略用分号和空格连接成一个字符串
          cspPolicies.join('; ')
        ]
      }
    })
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR为基于电子-vite cli的渲染器。
  //加载用于开发的远程URL或用于生产的本地html文件。
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // WebSocket 服务器启动
  startWebSocketServer()

  // IPC 注册
  registerIpcHandlers()
  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 监听应用即将退出的事件
app.on('will-quit', () => {
  // 停止 WebSocket 服务器
  stopWebSocketServer()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
