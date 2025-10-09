
import { ipcMain } from 'electron'
import { systemToolsService } from '@features/services/system_tools'

export function registerSystemToolsHandlers() {
  // 定时关机
  ipcMain.handle('system-tools:schedule-shutdown', async (_event, seconds: number) => {
    try {
      const result = await systemToolsService.scheduleShutdown(seconds)
      return { success: true, message: result }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // 取消关机
  ipcMain.handle('system-tools:cancel-shutdown', async () => {
    try {
      const result = await systemToolsService.cancelShutdown()
      return { success: true, message: result }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // 获取环境变量
  ipcMain.handle('system-tools:get-env-var', (_event, key: string) => {
    try {
      const value = systemToolsService.getEnvVar(key)
      return { success: true, value }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // 设置环境变量
  ipcMain.handle('system-tools:set-env-var', async (_event, key: string, value: string) => {
    try {
      await systemToolsService.setEnvVar(key, value)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // 获取系统启动项
  ipcMain.handle('system-tools:get-startup-apps', async () => {
    try {
      const apps = await systemToolsService.getSystemStartupApps()
      return { success: true, apps }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // 移除系统启动项
  ipcMain.handle('system-tools:remove-startup-app', async (_event, { name, path }) => {
    try {
      await systemToolsService.removeSystemStartupApp(name, path)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })
}
