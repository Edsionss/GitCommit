import { registerStoreHandlers } from '@handlers/store/store'
import { registerGitInfoHandlers } from './git/git-info'
import { registerGitScanHandlers } from './git/git-scan'
import { registerGitUtilsHandlers } from './git/git-utils'
import { registerFileSystemHandlers } from './fileSystem/file-system'
import { registerHistoryHandlers } from './history/history'
import { registerExportHandlers } from './export/export'
import { registerAiHandlers } from '@handlers/ai/ai'
import { initializeStockHandlers } from '@handlers/stock/stock'

export function registerIpcHandlers() {
  // Register handlers from other modules
  registerGitInfoHandlers()
  registerGitScanHandlers()
  registerGitUtilsHandlers()
  registerFileSystemHandlers()
  registerHistoryHandlers()
  registerExportHandlers()
  registerAiHandlers()
  registerStoreHandlers()
  // initializeStockHandlers()
}
