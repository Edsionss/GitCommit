import { registerStoreHandlers } from '@handlers/store_conf'
import { registerGitInfoHandlers } from './git/git-info'
import { registerGitScanHandlers } from './git/git-scan'
import { registerGitUtilsHandlers } from './git/git-utils'
import { registerFileSystemHandlers } from './fileSystem/file-system'
import { registerHistoryHandlers } from './history/history'
import { registerAiHandlers } from '@handlers/ai/ai'
import { initializeStockHandlers } from '@handlers/stock/index'
import { initializePuppeteerHandlers } from '@handlers/puppeteer'
import { initializeDatabase } from '@features/database'
import { initializeWebSocket } from '@handlers/websocket'
import { registerRoutesMenuHandlers } from '@handlers/routes_menu'
import { registerSettingsHandlers } from '@handlers/settings'
import { registerSystemToolsHandlers } from '@handlers/system_tools'
import { registerAutoWriteWorkRepoHandlers } from '@handlers/autoWriteWorkRepo'
import { registerApplicationHandlers } from '@handlers/application'
import { registerAuditLogHandlers } from '@handlers/auditLog'
import { registerChatHandlers } from '@handlers/chat/chat'
import { registerScanHistoryHandlers } from './scanHistory'
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
  registerSettingsHandlers()
  registerSystemToolsHandlers()
  registerAutoWriteWorkRepoHandlers()
  registerApplicationHandlers()
  registerAuditLogHandlers()
  registerChatHandlers()
  registerScanHistoryHandlers()
  // 注册 IPC 处理器
}
