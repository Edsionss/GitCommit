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

export async function findGitRepos(dir: string): Promise<{ name: string; path: string }[]> {
  let repos: { name: string; path: string }[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '.git') {
        const repoPath = path.dirname(fullPath)
        repos.push({
          name: path.basename(repoPath),
          path: repoPath
        })
        // Once a .git folder is found, don't go deeper into that directory structure
        continue
      }
      // Ignore node_modules to speed up scanning
      if (entry.name !== 'node_modules') {
        try {
          repos = repos.concat(await findGitRepos(fullPath))
        } catch (error) {
          // Ignore errors from directories we can't access
          console.error(`Could not access ${fullPath}, skipping.`)
        }
      }
    }
  }
  // Return unique paths
  const uniquePaths = new Set<string>()
  return repos.filter((repo) => {
    if (uniquePaths.has(repo.path)) {
      return false
    } else {
      uniquePaths.add(repo.path)
      return true
    }
  })
}
