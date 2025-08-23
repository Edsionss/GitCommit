import { ElectronAPI } from '@electron-toolkit/preload'

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

interface AiConfig {
  provider: 'openai' | 'gemini' | 'anthropic' | 'custom' | null
  apiKey: string
  endpoint?: string
  model?: string
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
  saveFile: (options: any) => Promise<string | null>
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
  onAddLog: (callback: (message: string, type: string) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ExposedAPI
  }
}
