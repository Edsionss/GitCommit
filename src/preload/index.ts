import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { AiConfig } from '@shared/types/dtos/ai'

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

// 选择目录返回结果
interface SelectDirectoryResult {
  path: string
  isValid: boolean
}

// 获取子仓库返回结果
interface GetSubReposResult {
  success: boolean
  repos?: string[]
  error?: string
}

interface ChatMessage {
  sender: 'user' | 'ai'
  text: string
}

// 暴露给渲染进程的API
const api = {
  // 选择目录
  selectDirectory: (): Promise<SelectDirectoryResult | null> =>
    ipcRenderer.invoke('select-directory'),

  // 验证路径
  validateRepoPath: (path: string): Promise<boolean> =>
    ipcRenderer.invoke('validate-repo-path', path),

  // 获取仓库作者列表
  getRepoAuthors: (repoPath: string): Promise<string[]> =>
    ipcRenderer.invoke('get-repo-authors', repoPath),

  // 获取仓库分支
  getRepoBranches: (repoPath: string): Promise<string[]> =>
    ipcRenderer.invoke('git:getBranches', repoPath),

  // 获取子仓库
  getSubRepos: (repoPath: string): Promise<GetSubReposResult> =>
    ipcRenderer.invoke('get-sub-repos', repoPath),

  // 扫描Git仓库
  scanGitRepo: (repoPath: string, options?: GitScanOptions, aiConfig?: AiConfig): Promise<any> =>
    ipcRenderer.invoke('scan-git-repo', repoPath, options, aiConfig),

  // 取消扫描
  cancelScan: () => ipcRenderer.send('cancel-scan'),

  // AI Chat
  aiChat: (prompt: string, aiConfig: AiConfig, history?: ChatMessage[]): Promise<any> =>
    ipcRenderer.invoke('ai:chat', prompt, aiConfig, history),
  onChatStreamChunk: (callback: (chunk: string) => void) =>
    ipcRenderer.on('ai:chatStream:chunk', (_, chunk) => callback(chunk)),

  // History API
  getHistory: () => ipcRenderer.invoke('history:get'),
  addHistory: (repoPath: string) => ipcRenderer.invoke('history:add', repoPath),
  removeHistory: (repoPath: string) => ipcRenderer.invoke('history:remove', repoPath),
  clearHistory: () => ipcRenderer.invoke('history:clear'),

  // Export API
  exportCommits: (commits, format) => ipcRenderer.invoke('export:commits', commits, format),

  // 监听事件
  onScanProgress: (callback: (data: any) => void) => {
    const listener = (_: any, data: any) => callback(data)
    ipcRenderer.on('scan-progress', listener)
    return () => ipcRenderer.removeListener('scan-progress', listener)
  },
  onScanError: (callback: (data: any) => void) => {
    const listener = (_: any, data: any) => callback(data)
    ipcRenderer.on('scan-error', listener)
    return () => ipcRenderer.removeListener('scan-error', listener)
  },
  onScanCancelled: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('scan-cancelled', listener)
    return () => ipcRenderer.removeListener('scan-cancelled', listener)
  }
}

// 暴露API
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
