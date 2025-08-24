import { ipcMain } from 'electron'
import { registerGitInfoHandlers } from './git/git-info.handlers'
import { registerGitScanHandlers } from './git/git-scan.handlers'
import { registerGitUtilsHandlers } from './git/git-utils.handlers'
import { isValidGitRepo } from './git/git-utils-service'
import { registerFileSystemHandlers } from './fileSystem/file-system.handlers'
import { registerHistoryHandlers } from './history/history-handlers'
import { registerExportHandlers } from './export/export-handlers'

export function registerIpcHandlers() {
  // Register handlers from other modules
  registerGitInfoHandlers()
  registerGitScanHandlers()
  registerGitUtilsHandlers()
  registerFileSystemHandlers()
  registerHistoryHandlers()
  registerExportHandlers()
}
