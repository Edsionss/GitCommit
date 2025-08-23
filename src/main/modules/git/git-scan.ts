import { ipcMain, BrowserWindow } from 'electron'
import simpleGit, { SimpleGit, LogOptions } from 'simple-git'
import * as path from 'path'
import { isValidGitRepo, findGitRepos } from '@main/modules/git/git-utils'
import { generateChatResponse } from '@main/modules/ai/ai-service'
import type { GitCommit, GitScanOptions, AiConfig } from '@shared/types/dtos/git.dto'

let cancelScanFlag = false
const aiAnalysisCommits = async (
  aiConfig: AiConfig,
  commits: GitCommit[],
  rules: any
): Promise<string> => {
  try {
    if (!aiConfig.provider || !aiConfig.apiKey) {
      throw new Error('please set ai provider and api key')
    }
    if (!commits || !rules) {
      throw new Error('not commits or rules')
    }
    const prompt = `
    这是一份git的提交记录${JSON.stringify(commits)};
    请根据如下规则进行分析并给出结果
    ${rules}
    `
    const result = await generateChatResponse(null, prompt, aiConfig)
    if (result) {
      return result
    }
    return '分析失败'
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
    throw new Error(errorMessage)
  }
}

export function registerGitScanHandlers() {
  // Git操作 - 扫描仓库
  ipcMain.handle(
    'scan-git-repo',
    async (_, repoPath: string, options?: GitScanOptions, aiConfig?: AiConfig) => {
      console.log('scan-git-repo options:', JSON.stringify(options, null, 2))
      const mainWindow = BrowserWindow.getAllWindows()[0]
      const sendProgress = (phase: string, percentage: number, commits?: GitCommit[]) => {
        if (cancelScanFlag) {
          throw new Error('操作已取消')
        }
        mainWindow?.webContents.send('scan-progress', { phase, percentage, commits })
      }

      try {
        // 重置取消标志
        cancelScanFlag = false

        let reposToScan: string[] = []
        if (options?.scanSubfolders) {
          // If specific sub-repos are selected, use them. Otherwise, find all.
          if (options.selectedRepos && options.selectedRepos.length > 0) {
            reposToScan = options.selectedRepos
          } else {
            sendProgress('正在查找子目录中的Git仓库...', 5)
            const foundRepos = await findGitRepos(repoPath)
            reposToScan = foundRepos.map((r) => r.path)
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

          try {
            sendProgress(`${progressPrefix} - 初始化仓库`, 10 + (i / totalRepos) * 80)
            const git: SimpleGit = simpleGit(currentRepoPath)

            const branchSummary = await git.branchLocal()
            const currentBranch = branchSummary.current

            // 检查仓库是否为空
            const latestLog = await git.log(['-1']).catch(() => null)
            if (!latestLog) {
              console.warn(`Skipping empty repository (no commits): ${currentRepoPath}`)
              mainWindow?.webContents.send('add-log', `跳过空仓库 (无提交): ${repoName}`, 'warning')
              continue
            }

            const logOptions: LogOptions = {
              '-i': null, // 忽略大小写
              '--no-merges': null,
              '--date': 'iso',
              '--pretty': 'format:%H|%h|%an|%ae|%ad|%s|%b',
              '--numstat': null
            }

            if (options?.branches && options.branches.length > 0) {
              options.branches.forEach((branch) => {
                logOptions[branch] = null
              })
            }
            if (options?.maxCommits && options.maxCommits > 0) {
              logOptions['-n'] = options.maxCommits
            }

            if (options?.dateRange && options.dateRange[0] && options.dateRange[1]) {
              logOptions['--after'] = `"${options.dateRange[0]}"`
              logOptions['--before'] = `"${options.dateRange[1]}"`
            }

            if (options?.authorFilter && options.authorFilter.length > 0) {
              logOptions['--author'] = options.authorFilter.join('|')
            }

            sendProgress(`${progressPrefix} - 获取提交历史`, 20 + (i / totalRepos) * 80)
            const logResult = await git.log(logOptions)

            sendProgress(`${progressPrefix} - 解析提交数据`, 50 + (i / totalRepos) * 80)

            for (const commit of logResult.all) {
              if (cancelScanFlag) throw new Error('操作已取消')

              let insertions = 0,
                deletions = 0,
                filesChanged = 0
              if (commit.diff && commit.diff.files) {
                filesChanged = commit.diff.files.length
                commit.diff.files.forEach((file) => {
                  insertions += file.insertions || 0
                  deletions += file.deletions || 0
                })
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
                deletions,
                branch: options?.branches?.join(', ') || currentBranch
              })
            }
          } catch (repoError) {
            const errorMsg = repoError instanceof Error ? repoError.message : String(repoError)
            console.error(`扫描仓库 ${currentRepoPath} 失败: ${errorMsg}`)
            mainWindow?.webContents.send(
              'add-log',
              `扫描仓库 ${repoName} 失败: ${errorMsg}`,
              'error'
            )
            // Continue to the next repo
          }
        }

        console.log(
          `Returning ${allCommits.length} commits. Sample:`,
          JSON.stringify(allCommits.slice(0, 2), null, 2)
        )
        let analysisResult: any = ''
        if (options?.AutoAiAnalysis && options?.analysisRules && aiConfig) {
          sendProgress(` -  AI分析结果中`, 90)
          analysisResult = await aiAnalysisCommits(aiConfig, allCommits, options.analysisRules)
          sendProgress(` -  AI分析结果: ${analysisResult}`, 95)
        }
        sendProgress('完成', 100, allCommits)

        return { commits: allCommits, analysisResult }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        BrowserWindow.getAllWindows()[0]?.webContents.send('scan-error', { message: errorMessage })
        throw new Error(errorMessage)
      }
    }
  )

  // 处理取消扫描请求
  ipcMain.on('cancel-scan', () => {
    cancelScanFlag = true
    BrowserWindow.getAllWindows()[0]?.webContents.send('scan-cancelled')
  })
}
