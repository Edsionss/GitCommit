//扫描记录接口
export interface ScanHistoryItem {
  id: string
  analysisResult: string
  log: string[]
  repoPath: string
  results: GitCommit[]
  scanOptions: GitScanOptions
  scanTime: string
  status: string
  totalCommits: number
}

// Git提交记录接口
export interface GitCommit {
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
  branch?: string
}

// Git扫描选项
export interface GitScanOptions {
  authorFilter?: string[]
  dateRange?: [string, string]
  maxCommits?: number
  branches?: string[]
  scanSubfolders?: boolean
  selectedRepos?: string[]
  AutoAiAnalysis?: boolean
  analysisRules?: string
}

// 扫描进度回调接口
export interface ScanProgress {
  phase: string
  percentage: number
  commits?: GitCommit[]
}

// 仓库历史记录接口
export interface RepoHistoryItem {
  path: string
  lastAccessed: string
}

// 进度回调
export type ProgressCallback = (progress: ScanProgress) => void
