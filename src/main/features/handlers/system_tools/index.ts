
import { ipcMain } from 'electron'
import { getMainWindow } from '@main/index'
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

  // 移除系统启动项（单向）
  ipcMain.on('system-tools:remove-startup-app', async (_event, { name, path }) => {
    try {
      await systemToolsService.removeSystemStartupApp(name, path)
      // 成功后，重新获取列表并通知前端更新
      const apps = await systemToolsService.getSystemStartupApps()
      getMainWindow()?.webContents.send('startup-apps-updated', apps)
    } catch (error) {
      // 可以在这里向前端发送一个错误通知
      console.error(`Failed to remove startup app ${name}:`, error)
      getMainWindow()?.webContents.send('error-notification', {
        title: '删除失败',
        body: `删除启动项 ${name} 时出错。`
      })
    }
  })
}
