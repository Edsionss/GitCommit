import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { applicationService } from '@services/application'
import icon from '../../build/CognitoOcean1.png?asset' // Vite/TypeScript 可能会帮你处理这个导入，但路径更可靠
import {
  beforeCreate,
  customCreateWindow,
  whenReady,
  willQuit,
  activate,
  showMainWindow
} from './main'

//创建窗口前的周期
beforeCreate()

// 将 mainWindow 声明在函数外部，以便在其他地方访问
let mainWindow: BrowserWindow | null = null

/**
 * 获取主窗口实例
 * @returns {BrowserWindow | null} 主窗口实例
 */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

/**
 * 触发主窗口任务栏闪烁
 */
export function flashMainWindow(): void {
  if (mainWindow && !mainWindow.isFocused()) {
    mainWindow.flashFrame(true)
  }
}

/**
 * 停止主窗口任务栏闪烁
 */
export function stopFlashMainWindow(): void {
  if (mainWindow) {
    mainWindow.flashFrame(false)
  }
}

// 创建窗口
function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 2000,
    height: 800,
    show: false,
    frame: false,
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

  // 创建窗口时的周期
  customCreateWindow()

  // 在窗口获得焦点时停止闪烁
  mainWindow.on('focus', stopFlashMainWindow)

  // 当窗口准备好显示时再显示它，以避免白屏
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // Start performance monitoring
  applicationService.startPerformanceMonitoring(mainWindow)

  // 打开外部链接时使用默认浏览器，而不是在应用内打开新窗口
  mainWindow.webContents.setWindowOpenHandler((details) => {
    const { shell } = require('electron')
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 添加 DevTools
  mainWindow.webContents.openDevTools({ mode: 'right' })

  // HMR为基于电子-vite cli的渲染器。
  //加载用于开发的远程URL或用于生产的本地html文件。
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.webContents.openDevTools()
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

  // 运行就绪时的周期
  whenReady()

  // 创建主窗口
  showMainWindow && createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    activate()
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 监听应用即将退出的事件
app.on('will-quit', () => {
  // 即将退出的周期
  willQuit()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 选择目录

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
