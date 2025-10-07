import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { AiConfig } from '@shared/types/dtos/ai'
import type { StockNews, StockNewsQueryOptions } from '@sharedType/stockNews'

// Git扫描选项
interface GitScanOptions {
  authorFilter?: string
  dateRange?: [string, string]
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
  },
  onDirectBroadcastReceived: (callback: (data: any) => void) => {
    const listener = (_: any, data: any) => callback(data)
    ipcRenderer.on('direct-broadcast-received', listener)
    return () => ipcRenderer.removeListener('direct-broadcast-received', listener)
  },
  storeGet: (key: string) => ipcRenderer.invoke('store:get', key),
  storeSet: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
  storeDelete: (key: string) => ipcRenderer.invoke('store:delete', key),
  // stock API
  searchStokes: (query: string) => ipcRenderer.invoke('stock:search', query),
  getStockInfoByCode: (code: string, name?: string) =>
    ipcRenderer.invoke('stock:getStockInfoByCode', code, name),

  //websocket
  getWsAddress: () => ipcRenderer.invoke('get-ws-address'),
  startWsServer: () => ipcRenderer.invoke('start-ws-server'),
  networkScan: (port: number): Promise<{ success: boolean; ips?: string[]; error?: string }> =>
    ipcRenderer.invoke('network:scan', port),
  sendRoomBroadcast: (message) => ipcRenderer.send('send-room-broadcast', message),
  sendDirectBroadcast: (payload) => ipcRenderer.send('send-direct-broadcast', payload),
  sendGlobalBroadcast: (payload) => ipcRenderer.send('send-global-broadcast', payload),
  createPrivateRoom: () => ipcRenderer.invoke('create-private-room'),

  // Menu Management API
  getAllMenus: () => ipcRenderer.invoke('routes-menu:get-all'),
  addMenu: (menu) => ipcRenderer.invoke('routes-menu:add', menu),
  addMenus: (menus) => ipcRenderer.invoke('routes-menu:addMany', menus),
  updateMenu: (menu) => ipcRenderer.invoke('routes-menu:update', menu),
  deleteMenu: (id) => ipcRenderer.invoke('routes-menu:delete', id),
  cleanMenu: () => ipcRenderer.invoke('routes-menu:clean'),

  // Settings API
  getAutoStartStatus: () => ipcRenderer.invoke('settings:get-auto-start'),
  setAutoStart: (isEnabled: boolean) => ipcRenderer.invoke('settings:set-auto-start', isEnabled),

  // System Tools API
  scheduleShutdown: (seconds: number) =>
    ipcRenderer.invoke('system-tools:schedule-shutdown', seconds),
  cancelShutdown: () => ipcRenderer.invoke('system-tools:cancel-shutdown'),
  getEnvVar: (key: string) => ipcRenderer.invoke('system-tools:get-env-var', key),
  setEnvVar: (key: string, value: string) =>
    ipcRenderer.invoke('system-tools:set-env-var', key, value),

  // AutoWriteWorkRepo
  AutomaticallyFillWorkSheet: (data: any) => ipcRenderer.invoke('autoWrite-WorkRepo', data),

  // Window Management API
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  onWindowStateChange: (callback) => {
    const listener = (_, state) => callback(state)
    ipcRenderer.on('window:maximized', () => callback('maximized'))
    ipcRenderer.on('window:unmaximized', () => callback('unmaximized'))

    return () => {
      ipcRenderer.removeListener('window:maximized', listener)
      ipcRenderer.removeListener('window:unmaximized', listener)
    }
  },

  // Audit Log API
  auditLogGet: (page: number, pageSize: number) =>
    ipcRenderer.invoke('auditLog:get', page, pageSize),
  auditLogDelete: (ids: number[]) => ipcRenderer.invoke('auditLog:delete', ids),
  auditLogClear: () => ipcRenderer.invoke('auditLog:clear'),

  // Stock API---------------------------------
  // News
  scrapeStockNews: (dateStr?: string, timeStr?: string) =>
    ipcRenderer.invoke('stock:scrape_news', dateStr, timeStr),
  getStockNews: (tradeDate: string) => ipcRenderer.invoke('stock:get_news', tradeDate),
  cleanStockNews: () => ipcRenderer.invoke('stock:clean_news')
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
