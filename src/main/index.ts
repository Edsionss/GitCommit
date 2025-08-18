import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import simpleGit, { SimpleGit } from 'simple-git'
import { promises as fs } from 'fs'
import * as path from 'path'
import * as ExcelJS from 'exceljs'

// Git提交记录接口
interface GitCommit {
  repository: string
  repoPath: string
  commitId: string
  shortHash: string
  author: string
  email: string
  date: string
  message: string
  body?: string
  filesChanged: number
  insertions: number
  deletions: number
}

// Git扫描选项
interface GitScanOptions {
  authorFilter?: string
  dateRange?: [string, string]
  selectedFields: string[]
  maxCommits?: number
  branch?: string
  scanSubfolders?: boolean
  selectedRepos?: string[]
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
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

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 验证路径是否为有效的Git仓库
async function isValidGitRepo(repoPath: string): Promise<boolean> {
  try {
    const git: SimpleGit = simpleGit(repoPath)
    // 检查目录是否是git仓库
    const isRepo = await git.checkIsRepo()
    return isRepo
  } catch (error) {
    console.error('验证Git仓库失败:', error)
    return false
  }
}

// 选择目录
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (!result.canceled && result.filePaths.length > 0) {
    const repoPath = result.filePaths[0]
    const isValid = await isValidGitRepo(repoPath)
    return { path: repoPath, isValid }
  }
  return null
})

// 验证路径
ipcMain.handle('validate-repo-path', async (_, repoPath: string) => {
  return await isValidGitRepo(repoPath)
})

// 获取子目录中的Git仓库
ipcMain.handle('get-sub-repos', async (_, repoPath: string) => {
  if (!repoPath) return { success: true, repos: [] };
  try {
    const repos = await findGitRepos(repoPath);
    return { success: true, repos };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('查找子仓库失败:', errorMessage);
    return { success: false, error: errorMessage };
  }
})

// 获取仓库作者列表
ipcMain.handle('get-repo-authors', async (_, repoPath: string) => {
  try {
    const git: SimpleGit = simpleGit(repoPath)
    // 使用git shortlog获取所有作者
    const result = await git.raw(['shortlog', '-sne', 'HEAD'])

    // 解析输出，提取作者姓名和邮箱
    const authors: string[] = []
    const regex = /^\s*\d+\s+(.+?)\s+<(.+?)>$/gm
    let match

    while ((match = regex.exec(result)) !== null) {
      if (match[1] && match[2]) {
        authors.push(`${match[1]} <${match[2]}>`)
      }
    }

    return authors
  } catch (error) {
    console.error('获取Git作者列表失败:', error)
    throw error
  }
})

// 添加取消扫描标志
let cancelScanFlag = false

async function findGitRepos(dir: string): Promise<string[]> {
  const repos: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '.git') {
        repos.push(path.dirname(fullPath))
        // Once a .git folder is found, don't go deeper into that directory structure
        continue
      }
      // Ignore node_modules to speed up scanning
      if (entry.name !== 'node_modules') {
        try {
          repos.push(...(await findGitRepos(fullPath)))
        } catch (error) {
          // Ignore errors from directories we can't access
          console.error(`Could not access ${fullPath}, skipping.`)
        }
      }
    }
  }
  // Return unique paths
  return [...new Set(repos)]
}

// Git操作 - 扫描仓库
ipcMain.handle('scan-git-repo', async (_, repoPath: string, options?: GitScanOptions) => {
  try {
    // 重置取消标志
    cancelScanFlag = false

    const mainWindow = BrowserWindow.getAllWindows()[0]
    const sendProgress = (phase: string, percentage: number) => {
      if (cancelScanFlag) {
        throw new Error('操作已取消')
      }
      mainWindow?.webContents.send('scan-progress', { phase, percentage })
    }

    let reposToScan: string[] = []
    if (options?.scanSubfolders) {
      // If specific sub-repos are selected, use them. Otherwise, find all.
      if (options.selectedRepos && options.selectedRepos.length > 0) {
        reposToScan = options.selectedRepos;
      } else {
        sendProgress('正在查找子目录中的Git仓库...', 5)
        reposToScan = await findGitRepos(repoPath)
      }

      if (reposToScan.length === 0) {
        throw new Error('在指定目录及其子目录中未找到任何Git仓库')
      }
    } else {
      const isRepo = await isValidGitRepo(repoPath)
      if (!isRepo) {
        throw new Error(`${repoPath} 不是一个有效的Git仓库`)
      }
      reposToScan.push(repoPath)
    }

    const allCommits: GitCommit[] = []
    const totalRepos = reposToScan.length

    for (let i = 0; i < totalRepos; i++) {
      const currentRepoPath = reposToScan[i]
      const repoName = path.basename(currentRepoPath)
      const progressPrefix = totalRepos > 1 ? `(${i + 1}/${totalRepos}) ${repoName}` : ''

      sendProgress(`${progressPrefix} - 初始化仓库`, 10 + (i / totalRepos) * 80)
      const git: SimpleGit = simpleGit(currentRepoPath)

      const logOptions: string[] = [
        '--no-merges',
        '--date=iso',
        '--pretty=format:%H|%h|%an|%ae|%ad|%s|%b',
        '--numstat'
      ]

      if (options?.branch && options.branch !== 'HEAD') {
        logOptions.unshift(options.branch)
      }
      if (options?.maxCommits && options.maxCommits > 0) {
        logOptions.unshift(`-n${options.maxCommits}`)
      }
      if (options?.authorFilter) {
        const authors = options.authorFilter.split(',').map((a) => a.trim())
        for (const author of authors) {
          logOptions.unshift(`--author=${author}`)
        }
      }
      if (options?.dateRange && options.dateRange[0] && options.dateRange[1]) {
        logOptions.unshift(`--after=${options.dateRange[0]}`, `--before=${options.dateRange[1]}`)
      }

      sendProgress(`${progressPrefix} - 获取提交历史`, 20 + (i / totalRepos) * 80)
      const output = await git.raw(logOptions)

      sendProgress(`${progressPrefix} - 解析提交数据`, 50 + (i / totalRepos) * 80)
      const blocks = output.split('\n\n')
      for (let j = 0; j < blocks.length; j++) {
        if (cancelScanFlag) throw new Error('操作已取消')
        const block = blocks[j].trim()
        if (!block) continue

        const lines = block.split('\n')
        if (lines.length === 0) continue

        const commitInfo = lines[0].split('|')
        if (commitInfo.length < 6) continue

        let insertions = 0, deletions = 0, filesChanged = 0
        for (let k = 1; k < lines.length; k++) {
          const statLine = lines[k].trim()
          if (!statLine) continue
          const parts = statLine.split('\t')
          if (parts.length === 3) {
            filesChanged++
            insertions += parseInt(parts[0]) || 0
            deletions += parseInt(parts[1]) || 0
          }
        }

        allCommits.push({
          repository: repoName,
          repoPath: currentRepoPath,
          commitId: commitInfo[0],
          shortHash: commitInfo[1],
          author: commitInfo[2],
          email: commitInfo[3],
          date: commitInfo[4],
          message: commitInfo[5],
          body: commitInfo.length > 6 ? commitInfo.slice(6).join('|') : '',
          filesChanged,
          insertions,
          deletions
        })
      }
    }

    sendProgress('完成', 100)
    return allCommits
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    BrowserWindow.getAllWindows()[0]?.webContents.send('scan-error', { message: errorMessage })
    throw error
  }
})

// 保存文件
ipcMain.handle(
  'save-file',
  async (
    _,
    options: {
      path: string
      content: string
      format: string
      fileName?: string
      commits?: GitCommit[]
    }
  ) => {
    try {
      // 构建默认文件名
      const defaultFileName = options.fileName || `Git提交记录_${Date.now()}.${options.format}`

      // 获取文件保存位置
      const result = await dialog.showSaveDialog({
        defaultPath: path.join(options.path, defaultFileName),
        filters: [{ name: options.format.toUpperCase(), extensions: [options.format] }]
      })

      if (result.canceled || !result.filePath) {
        return null
      }

      // 对Excel格式特殊处理
      if (options.format === 'xlsx' && options.commits) {
        await createExcelFile(result.filePath, options.commits)
        return result.filePath
      }

      // 对大文件处理
      const contentBuffer = Buffer.from(options.content, 'utf8')
      const MAX_SIZE = 100 * 1024 * 1024 // 100MB

      if (contentBuffer.length > MAX_SIZE) {
        // 分卷保存
        const chunks = Math.ceil(contentBuffer.length / MAX_SIZE)
        for (let i = 0; i < chunks; i++) {
          const start = i * MAX_SIZE
          const end = Math.min((i + 1) * MAX_SIZE, contentBuffer.length)
          const chunkContent = contentBuffer.slice(start, end)

          const chunkFileName = result.filePath.replace(
            `.${options.format}`,
            `_part${i + 1}.${options.format}`
          )

          await fs.writeFile(chunkFileName, chunkContent)
        }

        return result.filePath.replace(`.${options.format}`, `_part1-${chunks}.${options.format}`)
      } else {
        // 正常保存
        await fs.writeFile(result.filePath, options.content, 'utf8')
        return result.filePath
      }
    } catch (error) {
      console.error('保存文件错误:', error)
      throw error
    }
  }
)

// 创建Excel文件
async function createExcelFile(filePath: string, commits: GitCommit[]): Promise<void> {
  try {
    const workbook = new ExcelJS.Workbook()

    // 添加提交记录工作表
    const commitSheet = workbook.addWorksheet('提交记录')

    // 添加表头
    if (commits.length > 0) {
      const headers = Object.keys(commits[0])
      commitSheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: 20
      }))

      // 格式化表头
      const headerRow = commitSheet.getRow(1)
      headerRow.font = { bold: true }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      }

      // 添加数据
      commits.forEach((commit) => {
        const row: any = {}
        headers.forEach((header) => {
          row[header] = commit[header as keyof GitCommit]
        })
        commitSheet.addRow(row)
      })

      // 表格样式
      commitSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
          })
        }
      })
    }

    // 添加统计摘要工作表
    const statsSheet = workbook.addWorksheet('统计摘要')

    // 作者统计
    statsSheet.addRow(['作者统计'])
    statsSheet.addRow(['作者', '提交数', '文件更改', '新增行数', '删除行数'])

    const authorStats: {
      [author: string]: {
        commits: number
        files: number
        insertions: number
        deletions: number
      }
    } = {}

    commits.forEach((commit) => {
      if (!authorStats[commit.author]) {
        authorStats[commit.author] = {
          commits: 0,
          files: 0,
          insertions: 0,
          deletions: 0
        }
      }

      authorStats[commit.author].commits++
      authorStats[commit.author].files += commit.filesChanged
      authorStats[commit.author].insertions += commit.insertions
      authorStats[commit.author].deletions += commit.deletions
    })

    Object.entries(authorStats).forEach(([author, stats]) => {
      statsSheet.addRow([author, stats.commits, stats.files, stats.insertions, stats.deletions])
    })

    // 保存文件
    await workbook.xlsx.writeFile(filePath)
  } catch (error) {
    console.error('创建Excel文件失败:', error)
    throw error
  }
}

// 处理取消扫描请求
ipcMain.on('cancel-scan', () => {
  cancelScanFlag = true
  BrowserWindow.getAllWindows()[0]?.webContents.send('scan-cancelled')
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
