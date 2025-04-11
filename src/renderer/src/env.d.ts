/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 提交记录接口
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

// 提交历史记录
interface RepoHistory {
  path: string
  lastAccessed: string
  authors?: string[]
}

// 定义window对象上的API接口
interface Window {
  api: {
    // 选择目录
    selectDirectory: () => Promise<string | null>

    // 验证路径
    validateRepoPath: (path: string) => Promise<boolean>

    // 获取仓库作者列表
    getRepoAuthors: (repoPath: string) => Promise<string[]>

    // 扫描Git仓库
    scanGitRepo: (repoPath: string, options?: GitScanOptions) => Promise<GitCommit[]>

    // 保存文件
    saveFile: (options: {
      path: string
      content: string
      format: string
      fileName?: string
      commits?: GitCommit[]
    }) => Promise<string | null>

    // 取消扫描
    cancelScan: () => void

    // 监听扫描进度
    onScanProgress: (callback: (data: { phase: string; percentage: number }) => void) => () => void

    // 监听扫描错误
    onScanError: (callback: (data: { message: string }) => void) => () => void

    // 监听扫描取消
    onScanCancelled: (callback: () => void) => () => void
  }
}
