import { ipcMain } from 'electron'
import { apiRegistry } from './apiRegistry' // 导入新的 API 注册表
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
import { registerScanHistoryHandlers } from './git/index'
import { registerSchedulerHandlers } from '@handlers/scheduler'
import { registerSystemLogHandlers } from '@handlers/systemLog'
import { registerNtfyNotificationHandlers } from './NtfyNotification'
import { registerScriptManagementHandlers } from '@handlers/ScriptManagement'

export function registerIpcHandlers() {
  // 1. 保留所有原有的注册函数调用，确保现有功能不受影响
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
  registerSchedulerHandlers()
  registerSystemLogHandlers()
  registerNtfyNotificationHandlers()
  registerScriptManagementHandlers()

  // 2. 从 apiRegistry 动态注册新的 IPC 处理器
  console.log('[IPC] Registering dynamic IPC handlers...')
  apiRegistry.forEach(({ channel, handler }) => {
    ipcMain.handle(channel, handler)
  })
  console.log(`[IPC] ✅ Registered ${apiRegistry.length} dynamic IPC handlers.`)
}
