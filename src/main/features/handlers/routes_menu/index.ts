import { sysLogger } from '@nodeUtils/sysLogger'
import { ipcMain } from 'electron'
import { routesMenuService } from '@features/services/routes_menu'
import type { RouteRecord } from '@sharedType/MenuManagement'

export function registerRoutesMenuHandlers() {
  // 获取所有菜单
  ipcMain.handle('routes-menu:get-all', async () => {
    try {
      return await routesMenuService.getAllMenus()
    } catch (error) {
      sysLogger.error('IPC Error: Failed to get all menus', error)
      return []
    }
  })

  // 添加新菜单
  ipcMain.handle('routes-menu:add', async (_event, menu: RouteRecord) => {
    try {
      return await routesMenuService.addMenu(menu)
    } catch (error) {
      sysLogger.error('IPC Error: Failed to add menu', error)
      throw error // 将错误传递给渲染器进程
    }
  })

  // 批量添加新菜单
  ipcMain.handle('routes-menu:addMany', async (_event, menus: RouteRecord[]) => {
    try {
      return await routesMenuService.addMenus(menus)
    } catch (error) {
      sysLogger.error('IPC Error: Failed to add menus', error)
      throw error // 将错误传递给渲染器进程
    }
  })

  // 更新菜单
  ipcMain.handle('routes-menu:update', async (_event, menu: Partial<RouteRecord>) => {
    try {
      return await routesMenuService.updateMenu(menu)
    } catch (error) {
      sysLogger.error('IPC Error: Failed to update menu', error)
      throw error
    }
  })

  // 删除菜单
  ipcMain.handle('routes-menu:delete', async (_event, id: string) => {
    try {
      return await routesMenuService.deleteMenu(id)
    } catch (error) {
      sysLogger.error('IPC Error: Failed to delete menu', error)
      throw error
    }
  })

  // 清空菜单
  ipcMain.handle('routes-menu:clean', async (_event) => {
    try {
      return await routesMenuService.cleanMenu()
    } catch (error) {
      sysLogger.error('IPC Error: Failed to cleanMenu menu', error)
      throw error
    }
  })
}
