import { ipcMain, BrowserWindow } from 'electron'
import { scanGitRepository, setCancelScanFlag } from '@services/git/git-scan'
import type { GitScanOptions, ProgressCallback } from '@shared/types/dtos/git'
import type { AiConfig } from '@shared/types/dtos/ai'

export function registerGitScanHandlers() {
  // Git操作 - 扫描仓库
  ipcMain.handle(
    'scan-git-repo',
    async (_, repoPath: string, options?: GitScanOptions, aiConfig?: AiConfig) => {
      const mainWindow = BrowserWindow.getAllWindows()[0]

      const progressCallback: ProgressCallback = (progress) => {
        mainWindow?.webContents.send('scan-progress', progress)
      }

      try {
        return await scanGitRepository(repoPath, options, aiConfig, progressCallback)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        mainWindow?.webContents.send('scan-error', { message: errorMessage })
        // 重新抛出错误，让前端的 await 调用失败
        throw new Error(errorMessage)
      }
    }
  )

  // 处理取消扫描请求
  ipcMain.on('cancel-scan', () => {
    setCancelScanFlag(true)
    BrowserWindow.getAllWindows()[0]?.webContents.send('scan-cancelled')
  })
}
