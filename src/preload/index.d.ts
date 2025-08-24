import { ElectronAPI } from '@electron-toolkit/preload'
import type { GitCommit, RepoHistoryItem } from '@shared/types/dtos/git'
import type { AiConfig } from '@shared/types/dtos/ai'

// Define interfaces for the data structures used in the API
interface GitScanOptions {
  authorFilter?: string
  dateRange?: [string, string]
  selectedFields: string[]
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
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ExposedAPI
  }
}
