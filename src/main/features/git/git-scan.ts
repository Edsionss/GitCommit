import { ipcMain, BrowserWindow } from 'electron'
import { scanGitRepository, setCancelScanFlag } from './git-scan-service'
import type { GitScanOptions, AiConfig } from '@shared/types/dtos/git.dto'

export function registerGitScanHandlers() {
  // Git操作 - 扫描仓库
  ipcMain.handle(
    'scan-git-repo',
    async (_, repoPath: string, options?: GitScanOptions, aiConfig?: AiConfig) => {
      console.log('scan-git-repo options:', JSON.stringify(options, null, 2))
      try {
        return await scanGitRepository(repoPath, options, aiConfig)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        BrowserWindow.getAllWindows()[0]?.webContents.send('scan-error', { message: errorMessage })
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
