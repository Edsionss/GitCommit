import { ipcMain } from 'electron'
import simpleGit, { SimpleGit } from 'simple-git'

export function registerGitInfoHandlers() {
  // 获取仓库作者列表
  ipcMain.handle('get-repo-authors', async (_, repoPath: string) => {
    try {
      const git: SimpleGit = simpleGit(repoPath)
      // 使用git shortlog获取所有作者
      const result = await git.raw(['shortlog', '-sne', 'HEAD'])

      // 解析输出，提取作者姓名和邮箱
      const authors: string[] = []
      const regex = /^\s*\d+\s+(.+?)\s+<(.+?)>$/gm
      let match

      while ((match = regex.exec(result)) !== null) {
        if (match[1] && match[2]) {
          authors.push(`${match[1]} <${match[2]}>`)
        }
      }

      return authors
    } catch (error) {
      console.error('获取Git作者列表失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(errorMessage)
    }
  })

  // 获取仓库分支列表
  ipcMain.handle('git:getBranches', async (_, repoPath: string) => {
    try {
      const git: SimpleGit = simpleGit(repoPath)
      const branches = await git.branchLocal()
      return branches.all
    } catch (error) {
      console.error(`获取Git分支列表失败 for repo ${repoPath}:`, error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(errorMessage)
    }
  })
}
