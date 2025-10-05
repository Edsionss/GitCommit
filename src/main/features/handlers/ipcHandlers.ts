import { registerStoreHandlers } from '@handlers/store_conf'
import { registerGitInfoHandlers } from './git/git-info'
import { registerGitScanHandlers } from './git/git-scan'
import { registerGitUtilsHandlers } from './git/git-utils'
import { registerFileSystemHandlers } from './fileSystem/file-system'
import { registerHistoryHandlers } from './history/history'
import { registerAiHandlers } from '@handlers/ai/ai'
import { initializeStockHandlers } from '@handlers/stock/stock'
import { initializePuppeteerHandlers } from '@handlers/puppeteer'
import { initializeDatabase } from '@features/database'
import { initializeWebSocket } from '@handlers/websocket'
import { registerRoutesMenuHandlers } from '@handlers/routes_menu'
import { registerSettingsHandlers } from '@handlers/settings'
import { registerSystemToolsHandlers } from '@handlers/system_tools'
import { registerAutoWriteWorkRepoHandlers } from '@handlers/autoWriteWorkRepo'
import { registerApplicationHandlers } from '@handlers/application'
import { registerAuditLogHandlers } from '@handlers/auditLog'
import { routesMenuService } from '@services/routes_menu'

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
  // 注册 IPC 处理器

  // 在这里添加一次性设置代码, 用于初始化菜单项
  ;(async () => {
    try {
      const menus = await routesMenuService.getAllMenus()
      const auditLogMenuExists = menus.some((menu) => menu.name === 'AuditLog')

      if (!auditLogMenuExists) {
        console.log('AuditLog menu not found, creating it...')
        await routesMenuService.addMenu({
          path: '/system/audit-log',
          name: 'AuditLog',
          component_path: 'views/System/AuditLog.vue',
          meta: {
            title: '审计日志',
            keepAlive: '1'
          },
          menu_order: 99, // 确保它出现在菜单的较下方
          menu_icon: 'FileTextOutlined',
          hide: '0'
        })
        console.log('AuditLog menu created successfully.')
      }
    } catch (error) {
      console.error('Failed to initialize AuditLog menu:', error)
    }
  })()
}
