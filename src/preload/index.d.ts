import { ElectronAPI } from '@electron-toolkit/preload'
import type { GitCommit, RepoHistoryItem } from '@sharedType/git'
import type { AiConfig } from '@sharedType/ai'
import type {
  DirectBroadcastPayload,
  ChatMessage as webSocketChatMessage
} from '@sharedTypes/WebSocket'
import type { RouteRecord, RouteRecordWithOptionalId } from '@shared/types/dtos/MenuManagement'
import { promises } from 'dns'
import type { StockNews, StockNewsQueryOptions } from '@sharedType/stockNews'

// Define interfaces for the data structures used in the API
interface GitScanOptions {
  authorFilter?: string
  dateRange?: [string, string]
  maxCommits?: number
  branch?: string
  scanSubfolders?: boolean
  selectedRepos?: string[]
}

interface SelectDirectoryResult {
  path: string
  isValid: boolean
}

interface GetSubReposResult {
  success: boolean
  repos?: string[]
  error?: string
}

interface AiChatResponse {
  success: boolean
  message?: string
  error?: string
}

interface ChatMessage {
  sender: 'user' | 'ai'
  text: string
}

// Define the shape of the API object
interface ExposedAPI {
  selectDirectory: () => Promise<SelectDirectoryResult | null>
  validateRepoPath: (path: string) => Promise<boolean>
  getRepoAuthors: (repoPaths: string[]) => Promise<string[]>
  getRepoBranches: (repoPath: string) => Promise<string[]>
  getSubRepos: (repoPath: string) => Promise<GetSubReposResult>
  scanGitRepo: (repoPath: string, options?: GitScanOptions, aiConfig?: AiConfig) => Promise<any>
  cancelScan: () => void
  aiChat: (
    prompt: string,
    aiConfig: AiConfig,
    history?: ChatMessage[],
    isStream?: boolean
  ) => Promise<AiChatResponse>
  onScanProgress: (callback: (data: any) => void) => () => void
  onScanError: (callback: (data: any) => void) => () => void
  onScanCancelled: (callback: () => void) => () => void

  // History API
  getHistory: () => Promise<RepoHistoryItem[]>
  addHistory: (repoPath: string) => Promise<RepoHistoryItem[]>
  removeHistory: (repoPath: string) => Promise<RepoHistoryItem[]>
  clearHistory: () => Promise<RepoHistoryItem[]>

  // Export API
  exportCommits: (commits: GitCommit[], format: 'json' | 'csv') => Promise<string | null>

  // 使用泛型和 keyof 来实现完整的类型安全

  storeGet: (key: string) => Promise<any>
  storeSet(key: string, value: any): Promise<void>
  storeDelete(key: string): Promise<void>

  searchStokes: (query: string) => Promise<any[]>
  getStockInfoByCode: (code: string, name?: string) => Promise<any>

  //websocket
  startWsServer: () => Promise<void>
  networkScan: (port: number) => Promise<{ success: boolean; ips?: string[]; error?: string }>
  getWsAddress: () => Promise<string>
  sendRoomBroadcast: (message: { text: string; nickname: string; token: string }) => void
  sendDirectBroadcast: (payload: DirectBroadcastPayload) => void
  sendGlobalBroadcast: (payload: DirectBroadcastPayload) => void
  onDirectBroadcastReceived: (callback: (data: any) => void) => () => void
  createPrivateRoom: () => Promise<any>

  // Menu Management API
  getAllMenus: () => Promise<RouteRecord[]>
  addMenu: (menu: Omit<RouteRecord, 'id'>) => Promise<any>
  addMenus: (menu: RouteRecordWithOptionalId[]) => Promise<any>
  updateMenu: (menu: Partial<RouteRecord>) => Promise<any>
  deleteMenu: (id: string) => Promise<any>
  cleanMenu: () => Promise<any>

  // Settings API
  getAutoStartStatus: () => Promise<boolean>
  setAutoStart: (isEnabled: boolean) => Promise<{ success: boolean; error?: string }>

  // System Tools API
  scheduleShutdown: (
    seconds: number
  ) => Promise<{ success: boolean; message?: string; error?: string }>
  cancelShutdown: () => Promise<{ success: boolean; message?: string; error?: string }>
  getEnvVar: (key: string) => Promise<{ success: boolean; value?: string; error?: string }>
  setEnvVar: (key: string, value: string) => Promise<{ success: boolean; error?: string }>

  // AutoWriteWorkRepo
  AutomaticallyFillWorkSheet: (data: any) => promises<string>

  // Window Management API
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  onWindowStateChange: (callback: (state: 'maximized' | 'unmaximized') => void) => () => void

  // Audit Log API
  auditLogGet: (page: number, pageSize: number) => Promise<{ records: AuditLog[]; total: number }>
  auditLogDelete: (ids: number[]) => Promise<{ changes: number }>
  auditLogClear: () => Promise<{ changes: number }>

  // Stock API---------------------------------
  // News
  scrapeStockNews: (dateStr?: string, timeStr?: string) => Promise<any>
  getStockNews: (tradeDate: string) => Promise<StockNews[]>
  cleanStockNews: () => Promise<any>
}

// AuditLog a new interface
interface AuditLog {
  id: number
  timestamp: string
  actionType: 'INSERT' | 'UPDATE' | 'DELETE'
  tableName: string
  recordId?: string
  userId?: string
  oldData?: string
  newData?: string
  remarks?: string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ExposedAPI
  }
}
