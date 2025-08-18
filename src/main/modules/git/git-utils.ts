import { ipcMain } from 'electron'
import simpleGit, { SimpleGit } from 'simple-git'
import { promises as fs } from 'fs'
import * as path from 'path'

// 验证路径是否为有效的Git仓库
export async function isValidGitRepo(repoPath: string): Promise<boolean> {
  try {
    const git: SimpleGit = simpleGit(repoPath)
    // 检查目录是否是git仓库
    const isRepo = await git.checkIsRepo()
    return isRepo
  } catch (error) {
    console.error('验证Git仓库失败:', error)
    return false
  }
}

export async function findGitRepos(dir: string): Promise<string[]> {
  const repos: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '.git') {
        repos.push(path.dirname(fullPath))
        // Once a .git folder is found, don't go deeper into that directory structure
        continue
      }
      // Ignore node_modules to speed up scanning
      if (entry.name !== 'node_modules') {
        try {
          repos.push(...(await findGitRepos(fullPath)))
        } catch (error) {
          // Ignore errors from directories we can't access
          console.error(`Could not access ${fullPath}, skipping.`)
        }
      }
    }
  }
  // Return unique paths
  return [...new Set(repos)]
}

export function registerGitUtilsHandlers() {
  // 验证路径
  ipcMain.handle('validate-repo-path', async (_, repoPath: string) => {
    return await isValidGitRepo(repoPath)
  })

  // 获取子目录中的Git仓库
  ipcMain.handle('get-sub-repos', async (_, repoPath: string) => {
    if (!repoPath) return { success: true, repos: [] };
    try {
      const repos = await findGitRepos(repoPath);
      return { success: true, repos };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('查找子仓库失败:', errorMessage);
      return { success: false, error: errorMessage };
    }
  })
}