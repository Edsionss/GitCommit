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
  selectedFields: string[]
  maxCommits?: number
  branches?: string[]
  scanSubfolders?: boolean
  selectedRepos?: string[]
  AutoAiAnalysis?: boolean
  analysisRules?: string
}

export interface AiConfig {
  provider: 'openai' | 'gemini' | 'anthropic' | 'kimi' | 'custom' | null
  apiKey: string
  endpoint?: string
  model?: string
}
