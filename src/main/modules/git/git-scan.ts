import { ipcMain, BrowserWindow } from 'electron'
import simpleGit, { SimpleGit, LogOptions } from 'simple-git'
import * as path from 'path'
import { isValidGitRepo, findGitRepos } from '@main/modules/git/git-utils'

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
}

// Git扫描选项
export interface GitScanOptions {
  authorFilter?: string[]
  dateRange?: [string, string]
  selectedFields: string[]
  maxCommits?: number
  branch?: string
  scanSubfolders?: boolean
  selectedRepos?: string[]
}

let cancelScanFlag = false

export function registerGitScanHandlers() {
  // Git操作 - 扫描仓库
  ipcMain.handle('scan-git-repo', async (_, repoPath: string, options?: GitScanOptions) => {
    console.log('scan-git-repo options:', JSON.stringify(options, null, 2));
    try {
      // 重置取消标志
      cancelScanFlag = false

      const mainWindow = BrowserWindow.getAllWindows()[0]
      const sendProgress = (phase: string, percentage: number) => {
        if (cancelScanFlag) {
          throw new Error('操作已取消')
        }
        mainWindow?.webContents.send('scan-progress', { phase, percentage })
      }

      let reposToScan: string[] = []
      if (options?.scanSubfolders) {
        // If specific sub-repos are selected, use them. Otherwise, find all.
        if (options.selectedRepos && options.selectedRepos.length > 0) {
          reposToScan = options.selectedRepos;
        } else {
          sendProgress('正在查找子目录中的Git仓库...', 5)
          reposToScan = await findGitRepos(repoPath)
        }

        if (reposToScan.length === 0) {
          throw new Error('在指定目录及其子目录中未找到任何Git仓库')
        }
      } else {
        const isRepo = await isValidGitRepo(repoPath)
        if (!isRepo) {
          throw new Error(`${repoPath} 不是一个有效的Git仓库`)
        }
        reposToScan.push(repoPath)
      }

      const allCommits: GitCommit[] = []
      const totalRepos = reposToScan.length

      for (let i = 0; i < totalRepos; i++) {
        const currentRepoPath = reposToScan[i]
        const repoName = path.basename(currentRepoPath)
        const progressPrefix = totalRepos > 1 ? `(${i + 1}/${totalRepos}) ${repoName}` : ''

        sendProgress(`${progressPrefix} - 初始化仓库`, 10 + (i / totalRepos) * 80)
        const git: SimpleGit = simpleGit(currentRepoPath)

        const logOptions: LogOptions = {
          '-i': null, // 忽略大小写
          '--no-merges': null,
          '--date': 'iso',
          '--pretty': 'format:%H|%h|%an|%ae|%ad|%s|%b',
          '--numstat': null,
        };

        if (options?.branch && options.branch !== 'HEAD') {
          logOptions.file = [options.branch]; // simple-git uses `file` for branch
        }
        if (options?.maxCommits && options.maxCommits > 0) {
          logOptions['-n'] = options.maxCommits;
        }
        
        if (options?.dateRange && options.dateRange[0] && options.dateRange[1]) {
          logOptions['--after'] = `"${options.dateRange[0]}"`;
          logOptions['--before'] = `"${options.dateRange[1]}"`;
        }

        if (options?.authorFilter && options.authorFilter.length > 0) {
          logOptions['--author'] = options.authorFilter.join('|');
        }

        sendProgress(`${progressPrefix} - 获取提交历史`, 20 + (i / totalRepos) * 80)
        const logResult = await git.log(logOptions)

        sendProgress(`${progressPrefix} - 解析提交数据`, 50 + (i / totalRepos) * 80) 
        
        for (const commit of logResult.all) {
          if (cancelScanFlag) throw new Error('操作已取消')

          let insertions = 0, deletions = 0, filesChanged = 0
          if (commit.diff && commit.diff.files) {
            filesChanged = commit.diff.files.length;
            commit.diff.files.forEach(file => {
              insertions += file.insertions || 0;
              deletions += file.deletions || 0;
            });
          }

          allCommits.push({
            repository: repoName,
            repoPath: currentRepoPath,
            commitId: commit.hash,
            shortHash: commit.hash.substring(0, 7),
            author: commit.author_name,
            email: commit.author_email,
            date: commit.date,
            message: commit.message.split('\n')[0],
            body: commit.body,
            filesChanged,
            insertions,
            deletions
          })
        }
      }

      console.log(`Returning ${allCommits.length} commits. Sample:`, JSON.stringify(allCommits.slice(0, 2), null, 2));
      sendProgress('完成', 100)
      return allCommits
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      BrowserWindow.getAllWindows()[0]?.webContents.send('scan-error', { message: errorMessage })
      throw new Error(errorMessage)
    }
  })

  // 处理取消扫描请求
  ipcMain.on('cancel-scan', () => {
    cancelScanFlag = true
    BrowserWindow.getAllWindows()[0]?.webContents.send('scan-cancelled')
  })
}