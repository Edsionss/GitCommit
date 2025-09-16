import { registerStoreHandlers } from '@handlers/store/store'
import { registerGitInfoHandlers } from './git/git-info'
import { registerGitScanHandlers } from './git/git-scan'
import { registerGitUtilsHandlers } from './git/git-utils'
import { registerFileSystemHandlers } from './fileSystem/file-system'
import { registerHistoryHandlers } from './history/history'
import { registerExportHandlers } from './export/export'
import { registerAiHandlers } from '@handlers/ai/ai'
import { initializeStockHandlers } from '@handlers/stock/stock'
import { initializePuppeteerHandlers } from '@handlers/puppeteer/puppeteer'
import { registerCheerioHandlers } from '@handlers/cheerio'
import { initializeDatabase } from '@features/database'
import { initializeWebSocket } from '@handlers/websocket'
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
  initializeStockHandlers()
  initializePuppeteerHandlers()
  registerCheerioHandlers()
  initializeDatabase()
  initializeWebSocket()
  // 注册 IPC 处理器
}
