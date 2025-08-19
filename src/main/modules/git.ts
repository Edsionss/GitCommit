import { ipcMain } from 'electron'
import { isValidGitRepo, getSubRepos } from '@main/modules/git/git-utils'
import { registerGitInfoHandlers } from './git/git-info'
import { registerGitScanHandlers } from './git/git-scan'

export function registerGitHandlers() {
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

  registerGitInfoHandlers()
  registerGitScanHandlers()
}