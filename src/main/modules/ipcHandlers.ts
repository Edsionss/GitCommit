import { ipcMain } from 'electron'
import { registerGitInfoHandlers } from './git/git-info'
import { registerGitScanHandlers } from './git/git-scan'
import { registerGitUtilsHandlers, isValidGitRepo } from './git/git-utils'
import { registerFileSystemHandlers } from '@main/modules/fileSystem'

export function registerIpcHandlers() {
  

  // Register handlers from other modules
  registerGitInfoHandlers()
  registerGitScanHandlers()
  registerGitUtilsHandlers()
  registerFileSystemHandlers(isValidGitRepo)
}
