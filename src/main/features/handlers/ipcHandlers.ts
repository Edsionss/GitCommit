import { registerStoreHandlers } from '@handlers/store_conf'
import { registerGitInfoHandlers } from './git/git-info'
import { registerGitScanHandlers } from './git/git-scan'
import { registerGitUtilsHandlers } from './git/git-utils'
import { registerFileSystemHandlers } from './fileSystem/file-system'
import { registerHistoryHandlers } from './history/history'
import { registerAiHandlers } from '@handlers/ai/ai'
import { initializeStockHandlers } from '@handlers/stock/stock'
import { initializePuppeteerHandlers } from '@handlers/puppeteer/puppeteer'
import { initializeDatabase } from '@features/database'
import { initializeWebSocket } from '@handlers/websocket'
import { registerRoutesMenuHandlers } from './routes_menu'

export function registerIpcHandlers() {
  // Register handlers from other modules
  registerGitInfoHandlers()
  registerGitScanHandlers()
  registerGitUtilsHandlers()
  registerFileSystemHandlers()
  registerHistoryHandlers()
  registerAiHandlers()
  registerStoreHandlers()
  initializeStockHandlers()
  initializePuppeteerHandlers()
  initializeDatabase()
  initializeWebSocket()
  registerRoutesMenuHandlers()
  // 注册 IPC 处理器
}
