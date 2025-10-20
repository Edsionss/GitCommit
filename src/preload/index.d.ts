import { ElectronAPI } from '@electron-toolkit/preload'
import type { GitCommit, RepoHistoryItem, ScanHistoryItem } from '@sharedType/git'
import type { AiConfig, ChatMessage, AiChatResponse } from '@sharedType/ai'
import type {
  DirectBroadcastPayload,
  ChatMessage as webSocketChatMessage
} from '@sharedType/WebSocket'
import type { RouteRecord, RouteRecordWithOptionalId } from '@sharedType/MenuManagement'
import { promises } from 'dns'
import type { StockNews, StockNewsQueryOptions } from '@sharedType/stockNews'
import type { StockHotRank, CreateStockHotRankDto } from '@sharedType/stockHotRank'
import type { StockSectorCamelCase } from '@sharedType/stock'
import type {
  ScheduledTask,
  CreateScheduledTaskDto,
  UpdateScheduledTaskDto
} from '@shared/types/dtos/Scheduler'
import type { BuiltInTask } from '@sharedTypes/parameterTypes'
import type { Script, CreateScriptDto, UpdateScriptDto } from '@shared/types/dtos/ScriptManagement'

// 聊天会话和消息的接口定义
interface ChatSession {
  id: string
  name: string
  startTime: string
  createdAt: string
  updatedAt: string
}

interface ChatMessageDB {
  id?: number
  sessionId: string
  sender: 'user' | 'ai'
  text: string
  isLoading?: boolean
  createdAt: string
}

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

// Define the shape of the API object
interface ExposedAPI {
  selectDirectory: () => Promise<SelectDirectoryResult | null>
  validateRepoPath: (path: string) => Promise<boolean>
  getRepoAuthors: (repoPaths: string[]) => Promise<string[]>
  getRepoBranches: (repoPath: string) => Promise<string[]>
  getSubRepos: (repoPath: string) => Promise<GetSubReposResult>
  scanGitRepo: (repoPath: string, options?: GitScanOptions, aiConfig?: AiConfig) => Promise<any>
  cancelScan: () => void
  aiChat: (params: {
    prompt: string
    aiConfig: AiConfig
    history?: ChatMessage[]
    isStream?: boolean
  }) => Promise<AiChatResponse>
  onChatStreamChunk: (callback: (chunk: string) => void) => void
  aiChatWithTools: (params: {
    prompt: string
    aiConfig: AiConfig
    history?: ChatMessage[]
    isStream?: boolean
    tools?: any[]
  }) => Promise<AiChatResponse>
  onScanProgress: (callback: (data: any) => void) => () => void
  onScanError: (callback: (data: any) => void) => () => void
  onScanCancelled: (callback: () => void) => () => void

  // History API
  getHistory: () => Promise<RepoHistoryItem[]>
  addHistory: (repoPath: string) => Promise<RepoHistoryItem[]>
  removeHistory: (repoPath: string) => Promise<RepoHistoryItem[]>
  clearHistory: () => Promise<RepoHistoryItem[]>

  // Scan History API
  getAllScanHistories: () => Promise<ScanHistoryItem[]>
  getScanHistoryById: (id: string) => Promise<ScanHistoryItem | null>
  addScanHistory: (scanHistory: Omit<ScanHistoryItem, 'id'>) => Promise<ScanHistoryItem>
  updateScanHistory: (id: string, updates: Partial<ScanHistoryItem>) => Promise<ScanHistoryItem | null>
  deleteScanHistory: (id: string) => Promise<boolean>
  deleteAllScanHistories: () => Promise<boolean>
  migrateScanHistoryFromLocalStorage: () => Promise<{ success: boolean; message: string }>

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
  getAllFlatMenus: () => Promise<RouteRecord[]>
  setAsDefaultMenu: () => Promise<{ success: boolean; error?: string }>

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

  // Scheduler API
  getScheduledTasks: () => Promise<ScheduledTask[]>
  createScheduledTask: (dto: CreateScheduledTaskDto) => Promise<ScheduledTask>
  updateScheduledTask: (id: string, dto: UpdateScheduledTaskDto) => Promise<ScheduledTask | null>
  deleteScheduledTask: (id: string) => Promise<{ success: boolean }>
  toggleScheduledTask: (id: string, is_enabled: 0 | 1) => Promise<ScheduledTask | null>
  getBuiltInTasks: () => Promise<BuiltInTask[]>
  // Window Management API
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  onWindowStateChange: (callback: (state: 'maximized' | 'unmaximized') => void) => () => void

  // Audit Log API
  auditLogGet: (page: number, pageSize: number) => Promise<{ records: AuditLog[]; total: number }>
  auditLogDelete: (ids: number[]) => Promise<{ changes: number }>
  auditLogClear: () => Promise<{ changes: number }>

  // System Log API
  systemLogGet: (page: number, pageSize: number) => Promise<{ records: SystemLog[]; total: number }>
  systemLogAdd: (logRequest: { content: string; level: 'log' | 'warn' | 'error' }) => Promise<SystemLog>
  systemLogDelete: (ids: number[]) => Promise<{ changes: number }>
  systemLogClear: () => Promise<{ changes: number }>

  // Stock API---------------------------------
  // News
  scrapeStockNews: (dateStr?: string, timeStr?: string) => Promise<any>
  getStockNewsByTradeDate: (tradeDate: string) => Promise<StockNews[]>
  cleanStockNews: () => Promise<any>

  // hot rank
  scrapeAllHotRank: () => Promise<any[]>
  getStockAllHotRankByTradeDate: (tradeDate?: string) => Promise<StockHotRank[]>
  cleanStockAllHotRank: () => Promise<any>

  // sectors
  scrapeStockSectors: () => Promise<StockSectorCamelCase[]>
  getStockSectorsByTradeDate: (tradeDate?: string) => Promise<StockSectorCamelCase[]>
  cleanStockSectors: () => Promise<any>

  // Application API
  resetDatabase: () => Promise<{ success: boolean; error?: string }>,
  getDependencies: () => Promise<{ dependencies: Record<string, string>; devDependencies: Record<string, string> }>

  // Chat API
  getAllChatSessions: () => Promise<ChatSession[]>
  getChatSessionById: (id: string) => Promise<ChatSession | null>
  createChatSession: (session: Omit<ChatSession, 'createdAt' | 'updatedAt'>) => Promise<ChatSession>
  updateChatSession: (id: string, updates: Partial<ChatSession>) => Promise<void>
  deleteChatSession: (id: string) => Promise<void>
  updateSessionName: (sessionId: string, name: string) => Promise<void>
  getMessagesBySessionId: (sessionId: string) => Promise<ChatMessageDB[]>
  addMessageToSession: (message: Omit<ChatMessageDB, 'id' | 'createdAt'>) => Promise<ChatMessageDB>
  updateMessage: (id: number, updates: Partial<ChatMessageDB>) => Promise<void>
  deleteMessage: (id: number) => Promise<void>
  deleteMessagesBySessionId: (sessionId: string) => Promise<void>

  // Ntfy Notification API
  sendNtfyMessage: (request: { topic: string; message: string }) => Promise<{ 
    success: boolean; 
    message?: string; 
    error?: string 
  }>
  getNotificationLogs: (request?: { 
    limit?: number; 
    offset?: number; 
    topic?: string; 
    status?: 'success' | 'failed' 
  }) => Promise<{ 
    success: boolean; 
    logs?: NotificationLog[]; 
    total?: number; 
    error?: string 
  }>,

  // Script Management API
  scriptManagement: {
    create: (data: CreateScriptDto) => Promise<Script>;
    getAll: () => Promise<Script[]>;
    getById: (id: string) => Promise<Script | null>;
    update: (id: string, data: UpdateScriptDto) => Promise<Script | null>;
    delete: (id: string) => Promise<void>;
    execute: (id: string) => Promise<{ stdout: string; stderr: string }>;
  }
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

// SystemLog interface
interface SystemLog {
  id: number
  content: string
  timestamp: string
  level: 'log' | 'warn' | 'error'
}

// NotificationLog interface
interface NotificationLog {
  id: number
  topic: string
  message: string
  status: 'success' | 'failed'
  error_message?: string
  created_at: string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ExposedAPI
  }
}
