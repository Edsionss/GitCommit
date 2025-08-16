import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

console.log('Preload script loaded and exposing API');

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
}

// Custom APIs for renderer
const api = {
  // 选择目录
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('select-directory'),

  // 验证路径
  validateRepoPath: (path: string): Promise<boolean> =>
    ipcRenderer.invoke('validate-repo-path', path),

  // 获取仓库作者列表
  getRepoAuthors: (repoPath: string): Promise<string[]> =>
    ipcRenderer.invoke('get-repo-authors', repoPath),

  // 扫描Git仓库
  scanGitRepo: (repoPath: string, options?: GitScanOptions): Promise<GitCommit[]> =>
    ipcRenderer.invoke('scan-git-repo', repoPath, options),

  // 保存文件
  saveFile: (options: {
    path: string
    content: string
    format: string
    fileName?: string
    commits?: GitCommit[]
  }): Promise<string | null> => ipcRenderer.invoke('save-file', options),

  // 取消扫描
  cancelScan: () => ipcRenderer.send('cancel-scan'),

  // 监听扫描进度
  onScanProgress: (callback: (data: { phase: string; percentage: number }) => void) => {
    const listener = (_: any, data: { phase: string; percentage: number }) => callback(data)
    ipcRenderer.on('scan-progress', listener)
    return () => {
      ipcRenderer.removeListener('scan-progress', listener)
    }
  },

  // 监听扫描错误
  onScanError: (callback: (data: { message: string }) => void) => {
    const listener = (_: any, data: { message: string }) => callback(data)
    ipcRenderer.on('scan-error', listener)
    return () => {
      ipcRenderer.removeListener('scan-error', listener)
    }
  },

  // 监听扫描取消
  onScanCancelled: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('scan-cancelled', listener)
    return () => {
      ipcRenderer.removeListener('scan-cancelled', listener)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
