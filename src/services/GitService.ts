import dayjs from 'dayjs'
import ExcelJS from 'exceljs'

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
}

export interface CommitFilter {
  repositories: string[]
  authors: string[]
  since?: string
  until?: string
  branches: string[]
  maxCount?: number
}

export interface GitScanOptions {
  authorFilter?: string
  dateRange?: [string, string]
  selectedFields: string[]
  maxCommits?: number
  branch?: string
  scanSubfolders?: boolean
  selectedRepos?: string[]
}

// 历史路径存储接口
export interface RepoHistory {
  path: string
  lastAccessed: string
  authors?: string[]
}

export class GitService {
  private repoHistory: RepoHistory[] = []
  private readonly historyKey = 'gitCommitExplorerHistory'

  constructor() {
    this.loadRepoHistory()
  }

  private loadRepoHistory(): void {
    try {
      const savedHistory = localStorage.getItem(this.historyKey)
      if (savedHistory) {
        this.repoHistory = JSON.parse(savedHistory)
      }
    } catch (error) {
      console.error('Failed to load repo history:', error)
      this.repoHistory = []
    }
  }

  private saveRepoHistory(): void {
    try {
      localStorage.setItem(this.historyKey, JSON.stringify(this.repoHistory))
    } catch (error) {
      console.error('Failed to save repo history:', error)
    }
  }

  getRepoHistory(): RepoHistory[] {
    return this.repoHistory
  }

  addToHistory(path: string, authors?: string[]): void {
    // 首先检查是否已存在相同路径
    const existingIndex = this.repoHistory.findIndex((item) => item.path === path)

    if (existingIndex !== -1) {
      // 如果存在，更新访问时间并移到列表顶部
      const existing = this.repoHistory[existingIndex]
      this.repoHistory.splice(existingIndex, 1)
      this.repoHistory.unshift({
        ...existing,
        lastAccessed: new Date().toISOString(),
        authors: authors || existing.authors
      })
    } else {
      // 如果不存在，添加新记录
      this.repoHistory.unshift({
        path,
        lastAccessed: new Date().toISOString(),
        authors
      })

      // 限制历史记录数量
      if (this.repoHistory.length > 10) {
        this.repoHistory = this.repoHistory.slice(0, 10)
      }
    }

    this.saveRepoHistory()
  }

  removeFromHistory(path: string): void {
    this.repoHistory = this.repoHistory.filter((item) => item.path !== path)
    this.saveRepoHistory()
  }

  async getRepoAuthors(repoPath: string): Promise<string[]> {
    try {
      const authors = await window.api.getRepoAuthors(repoPath)
      return authors
    } catch (error) {
      console.error('获取仓库作者失败:', error)
      throw error
    }
  }

  // async scanRepository(repoPath: string, options: GitScanOptions): Promise<GitCommit[]> {
  //   try {
  //     const { commits, analysisRules } = await window.api.scanGitRepo(repoPath, options)

  //     // 更新历史记录
  //     if (commits.length > 0) {
  //       const uniqueAuthors = [...new Set(commits.map((commit) => commit.author))]
  //       this.addToHistory(repoPath, uniqueAuthors)
  //     }

  //     return { commits, analysisRules }
  //   } catch (error) {
  //     console.error('扫描仓库失败:', error)
  //     throw error
  //   }
  // }

  private filterCommits(commits: GitCommit[], options: GitScanOptions): GitCommit[] {
    let filtered = [...commits]

    // 作者过滤
    if (options.authorFilter) {
      const authors = options.authorFilter.split(',').map((a) => a.trim().toLowerCase())
      filtered = filtered.filter((commit) =>
        authors.some(
          (author) =>
            commit.author.toLowerCase().includes(author) ||
            (commit.email && commit.email.toLowerCase().includes(author))
        )
      )
    }

    // 日期范围过滤
    if (options.dateRange && options.dateRange.length === 2) {
      const [start, end] = options.dateRange
      const startDate = start ? dayjs(start) : null
      const endDate = end ? dayjs(end) : null

      filtered = filtered.filter((commit) => {
        const commitDate = dayjs(commit.date)
        return (
          (!startDate || commitDate.isAfter(startDate)) &&
          (!endDate || commitDate.isBefore(endDate))
        )
      })
    }

    // 最大提交数限制
    if (options.maxCommits && options.maxCommits > 0) {
      filtered = filtered.slice(0, options.maxCommits)
    }

    return filtered
  }

  async exportData(
    commits: GitCommit[],
    format: string,
    outputPath: string,
    fileName?: string
  ): Promise<string | null> {
    try {
      if (!commits || commits.length === 0) {
        throw new Error('没有数据可导出')
      }

      let content: string = ''
      const defaultFileName = fileName || `GitCommits_${dayjs().format('YYYYMMDD_HHmmss')}`

      // 根据不同格式生成内容
      switch (format.toLowerCase()) {
        case 'csv':
          content = this.convertToCSV(commits)
          break
        case 'html':
          content = this.convertToHTML(commits)
          break
        case 'markdown':
        case 'md':
          content = this.convertToMarkdown(commits)
          break
        case 'json':
          content = JSON.stringify(commits, null, 2)
          break
        case 'xlsx':
        case 'excel':
          // Excel需要特殊处理
          // 由于无法在渲染进程直接写文件，我们通过IPC发送到主进程
          return await window.api.saveFile({
            path: outputPath,
            content: '',
            format: 'xlsx',
            fileName: `${defaultFileName}.xlsx`,
            commits: commits
          })
        default:
          content = this.convertToCustomFormat(commits)
      }

      // 保存文件
      return await window.api.saveFile({
        path: outputPath,
        content: content,
        format: format.toLowerCase(),
        fileName: `${defaultFileName}.${format.toLowerCase()}`
      })
    } catch (error) {
      console.error('导出失败:', error)
      throw error
    }
  }

  private convertToCSV(commits: GitCommit[]): string {
    // 创建CSV标题行
    const headers = [
      'repository',
      'commitId',
      'shortHash',
      'author',
      'email',
      'date',
      'message',
      'filesChanged',
      'insertions',
      'deletions'
    ]
    let csv = headers.join(',') + '\n'

    // 添加数据行
    commits.forEach((commit) => {
      const row = [
        this.escapeCSV(commit.repository),
        this.escapeCSV(commit.commitId),
        this.escapeCSV(commit.shortHash),
        this.escapeCSV(commit.author),
        this.escapeCSV(commit.email || ''),
        this.escapeCSV(commit.date),
        this.escapeCSV(commit.message),
        commit.filesChanged,
        commit.insertions,
        commit.deletions
      ]
      csv += row.join(',') + '\n'
    })

    return csv
  }

  private escapeCSV(str: string): string {
    if (!str) return '""'
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  private convertToHTML(commits: GitCommit[]): string {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Git Commit 历史</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .commit-id { font-family: monospace; }
  </style>
</head>
<body>
  <h1>Git Commit 历史</h1>
  <p>生成时间: ${new Date().toLocaleString()}</p>
  <p>共 ${commits.length} 条提交记录</p>
  
  <table>
    <thead>
      <tr>
        <th>仓库</th>
        <th>提交ID</th>
        <th>作者</th>
        <th>日期</th>
        <th>消息</th>
        <th>文件变更</th>
        <th>添加行数</th>
        <th>删除行数</th>
      </tr>
    </thead>
    <tbody>
`

    // 添加表格行
    commits.forEach((commit) => {
      html += `
      <tr>
        <td>${this.escapeHTML(commit.repository)}</td>
        <td class="commit-id">${this.escapeHTML(commit.shortHash)}</td>
        <td>${this.escapeHTML(commit.author)}</td>
        <td>${new Date(commit.date).toLocaleString()}</td>
        <td>${this.escapeHTML(commit.message)}</td>
        <td>${commit.filesChanged}</td>
        <td>${commit.insertions}</td>
        <td>${commit.deletions}</td>
      </tr>`
    })

    html += `
    </tbody>
  </table>
</body>
</html>`

    return html
  }

  private escapeHTML(str: string): string {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  private convertToMarkdown(commits: GitCommit[]): string {
    let md = `# Git Commit 历史\n\n`
    md += `生成时间: ${new Date().toLocaleString()}\n\n`
    md += `共 ${commits.length} 条提交记录\n\n`

    // 创建表头
    md += `| 仓库 | 提交ID | 作者 | 日期 | 消息 | 文件变更 | 添加行数 | 删除行数 |\n`
    md += `| --- | --- | --- | --- | --- | ---: | ---: | ---: |\n`

    // 添加表格行
    commits.forEach((commit) => {
      const date = new Date(commit.date).toLocaleString()
      md += `| ${commit.repository} | \`${commit.shortHash}\` | ${commit.author} | ${date} | ${commit.message.replace(/\|/g, '\\|')} | ${commit.filesChanged} | ${commit.insertions} | ${commit.deletions} |\n`
    })

    return md
  }

  private convertToCustomFormat(commits: GitCommit[]): string {
    return commits.map((commit) => `${commit.repository}: ${commit.message}`).join('\n')
  }
}

export const gitService = new GitService()
