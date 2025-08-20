import { ipcMain } from 'electron'
import simpleGit, { SimpleGit } from 'simple-git'

export function registerGitInfoHandlers() {
  // 获取仓库作者列表
  ipcMain.handle('get-repo-authors', async (_, repoPaths: string | string[]) => {
    try {
      const allAuthors = new Set<string>()
      const paths = Array.isArray(repoPaths) ? repoPaths : [repoPaths]

      for (const repoPath of paths) {
        const git: SimpleGit = simpleGit(repoPath)
        const result = await git.raw(['shortlog', '-sne', 'HEAD'])

        const regex = /^\s*\d+\s+(.+?)\s+<(.+?)>$/gm
        let match

        while ((match = regex.exec(result)) !== null) {
          if (match[1]) {
            allAuthors.add(match[1])
          }
        }
      }

      return Array.from(allAuthors)
    } catch (error) {
      console.error('获取Git作者列表失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw errorMessage
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
      throw errorMessage
    }
  })
}
