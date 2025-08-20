import { ipcMain } from 'electron'
import simpleGit, { SimpleGit } from 'simple-git'

export function registerGitInfoHandlers() {
  // 获取仓库作者列表
  ipcMain.handle('get-repo-authors', async (_, repoPaths: string | string[]) => {
    const allAuthors = new Set<string>()
    const paths = Array.isArray(repoPaths) ? repoPaths : [repoPaths]

    for (const repoPath of paths) {
      try {
        const git: SimpleGit = simpleGit(repoPath)

        // 检查仓库是否至少有一个提交，否则 shortlog 会失败
        const log = await git.log(['-1']).catch(() => null)
        if (!log) {
          console.warn(`Skipping empty repository (no commits): ${repoPath}`)
          continue
        }

        const result = await git.raw(['shortlog', '-sne', 'HEAD'])
        const regex = /^\s*\d+\s+(.+?)\s+<(.+?)>$/gm
        let match

        while ((match = regex.exec(result)) !== null) {
          if (match[1]) {
            allAuthors.add(match[1])
          }
        }
      } catch (error) {
        console.error(`获取Git作者列表失败 for repo ${repoPath}:`, error)
        // 不要抛出错误，只记录并继续下一个
      }
    }

    return Array.from(allAuthors)
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
