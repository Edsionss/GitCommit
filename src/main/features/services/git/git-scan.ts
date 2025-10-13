import { sysLogger } from '@nodeUtils/sysLogger'
import simpleGit, { SimpleGit, LogOptions } from 'simple-git'
import * as path from 'path'
// import { isValidGitRepo, findGitRepos } from './git-utils-service'
import { isValidGitRepo, findGitRepos } from '@services/git/git-utils'
// import { generateChatResponse } from '../ai/ai-service'
import { generateChatResponse } from '@services/ai/ai'
import { ScanHistoryService } from './index'
import type {
  GitCommit,
  GitScanOptions,
  ProgressCallback,
  ScanProgress,
  ScanHistoryItem
} from '@sharedType/git'
import type { AiConfig } from '@sharedType/ai'

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
    const result = await generateChatResponse({ _: null, prompt, aiConfig })
    if (result) {
      return result
    }
    return '分析失败'
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
    throw new Error(errorMessage)
  }
}

export async function scanGitRepository(
  repoPath: string,
  options?: GitScanOptions,
  aiConfig?: AiConfig,
  onProgress?: ProgressCallback
): Promise<{ commits: GitCommit[]; analysisResult: any }> {
  const sendProgress = (progress: ScanProgress) => {
    if (cancelScanFlag) {
      throw new Error('操作已取消')
    }
    onProgress?.(progress)
  }

  // 收集扫描日志
  const scanLogs: string[] = options?.log || []

  const addScanLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const formattedLog = `[${timestamp}] ${msg}`
    scanLogs.push(formattedLog)
    sysLogger.log(formattedLog)
  }

  try {
    // 重置取消标志
    cancelScanFlag = false

    addScanLog(`开始扫描仓库: ${repoPath}`)

    let reposToScan: string[] = []
    if (options?.scanSubfolders) {
      // If specific sub-repos are selected, use them. Otherwise, find all.
      if (options.selectedRepos && options.selectedRepos.length > 0) {
        reposToScan = options.selectedRepos
        addScanLog(`使用选定的子仓库: ${reposToScan.join(', ')}`)
      } else {
        sendProgress({ phase: '正在查找子目录中的Git仓库...', percentage: 5 })
        addScanLog('正在查找子目录中的Git仓库...')
        const foundRepos = await findGitRepos(repoPath)
        reposToScan = foundRepos.map((r) => r.path)
        addScanLog(`找到 ${reposToScan.length} 个Git仓库`)
      }

      if (reposToScan.length === 0) {
        const errorMsg = '在指定目录及其子目录中未找到任何Git仓库'
        addScanLog(`错误: ${errorMsg}`)
        throw new Error(errorMsg)
      }
    } else {
      const isRepo = await isValidGitRepo(repoPath)
      if (!isRepo) {
        const errorMsg = `${repoPath} 不是一个有效的Git仓库`
        addScanLog(`错误: ${errorMsg}`)
        throw new Error(errorMsg)
      }
      reposToScan.push(repoPath)
      addScanLog(`扫描单个仓库: ${repoPath}`)
    }

    const allCommits: GitCommit[] = []
    const totalRepos = reposToScan.length

    for (let i = 0; i < totalRepos; i++) {
      const currentRepoPath = reposToScan[i]
      const repoName = path.basename(currentRepoPath)
      const progressPrefix = totalRepos > 1 ? `(${i + 1}/${totalRepos}) ${repoName}` : ''

      try {
        addScanLog(`${progressPrefix} - 初始化仓库`)
        sendProgress({
          phase: `${progressPrefix} - 初始化仓库`,
          percentage: 10 + (i / totalRepos) * 80
        })
        const git: SimpleGit = simpleGit(currentRepoPath)

        const branchSummary = await git.branchLocal()
        const currentBranch = branchSummary.current
        addScanLog(`${progressPrefix} - 当前分支: ${currentBranch}`)

        // 检查仓库是否为空
        const latestLog = await git.log(['-1']).catch(() => null)
        if (!latestLog) {
          const warnMsg = `跳过空仓库 (无提交): ${currentRepoPath}`
          addScanLog(`警告: ${warnMsg}`)
          sysLogger.warn(warnMsg)
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
          addScanLog(`${progressPrefix} - 筛选分支: ${options.branches.join(', ')}`)
        }
        if (options?.maxCommits && options.maxCommits > 0) {
          logOptions['-n'] = options.maxCommits
          addScanLog(`${progressPrefix} - 最大提交数: ${options.maxCommits}`)
        }

        if (options?.dateRange && options.dateRange[0] && options.dateRange[1]) {
          logOptions['--after'] = `"${options.dateRange[0]}"`
          logOptions['--before'] = `"${options.dateRange[1]}"`
          addScanLog(
            `${progressPrefix} - 日期范围: ${options.dateRange[0]} 至 ${options.dateRange[1]}`
          )
        }

        if (options?.authorFilter && options.authorFilter.length > 0) {
          logOptions['--author'] = options.authorFilter.join('|')
          addScanLog(`${progressPrefix} - 筛选作者: ${options.authorFilter.join(', ')}`)
        }

        addScanLog(`${progressPrefix} - 获取提交历史`)
        sendProgress({
          phase: `${progressPrefix} - 获取提交历史`,
          percentage: 20 + (i / totalRepos) * 80
        })
        const logResult = await git.log(logOptions)

        addScanLog(`${progressPrefix} - 解析提交数据`)
        sendProgress({
          phase: `${progressPrefix} - 解析提交数据`,
          percentage: 50 + (i / totalRepos) * 80
        })

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

        addScanLog(`${progressPrefix} - 完成，找到 ${logResult.all.length} 条提交记录`)
      } catch (repoError) {
        const errorMsg = repoError instanceof Error ? repoError.message : String(repoError)
        addScanLog(`扫描仓库 ${currentRepoPath} 失败: ${errorMsg}`)
        sysLogger.error(`扫描仓库 ${currentRepoPath} 失败: ${errorMsg}`)
        // Continue to the next repo
      }
    }

    sysLogger.log(
      `Returning ${allCommits.length} commits. Sample:`,
      JSON.stringify(allCommits.slice(0, 2), null, 2)
    )
    addScanLog(`总共找到 ${allCommits.length} 条提交记录`)

    let analysisResult: any = ''
    if (options?.AutoAiAnalysis && options?.analysisRules && aiConfig) {
      if (allCommits.length) {
        addScanLog('开始AI分析...')
        sendProgress({ phase: ` -  AI分析结果中`, percentage: 90 })
        analysisResult = await aiAnalysisCommits(aiConfig, allCommits, options.analysisRules)
        addScanLog('AI分析完成')
        sendProgress({ phase: ` -  AI分析完成`, percentage: 95 })
      } else {
        analysisResult = '没有提交记录可供分析'
        addScanLog('没有提交记录可供分析')
      }
    }
    sendProgress({ phase: '完成', percentage: 100, commits: allCommits })
    addScanLog('扫描完成')

    // 保存扫描结果到数据库
    try {
      const scanHistoryService = new ScanHistoryService()
      const scanHistory: Omit<ScanHistoryItem, 'id'> = {
        repoPath: repoPath,
        scanTime: new Date().toISOString(),
        status: 'completed',
        results: allCommits,
        analysisResult: analysisResult,
        scanOptions: options || {},
        log: scanLogs,
        totalCommits: allCommits.length
      }
      await scanHistoryService.addScanHistory(scanHistory)
      addScanLog('扫描历史已保存到数据库')
      sysLogger.log('Scan history saved to database successfully')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      addScanLog(`保存扫描历史失败: ${errorMsg}`)
      sysLogger.error('Failed to save scan history to database:', error)
    }

    return { commits: allCommits, analysisResult }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    addScanLog(`扫描失败: ${errorMessage}`)
    // BrowserWindow.getAllWindows()[0]?.webContents.send('scan-error', { message: errorMessage })
    throw new Error(errorMessage)
  }
}

export function setCancelScanFlag(value: boolean) {
  cancelScanFlag = value
}
