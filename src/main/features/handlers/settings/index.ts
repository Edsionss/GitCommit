import { ipcMain } from 'electron'
import { settingsService } from '@services/settings'

export function registerSettingsHandlers() {
  // 获取开机自启状态
  ipcMain.handle('settings:get-auto-start', () => {
    try {
      return settingsService.getAutoStartStatus()
    } catch (error) {
      console.error('IPC Error: Failed to get auto-start status', error)
      return false
    }
  })

  // 设置开机自启状态
  ipcMain.handle('settings:set-auto-start', (_event, isEnabled: boolean) => {
    try {
      settingsService.setAutoStart(isEnabled)
      return { success: true }
    } catch (error) {
      console.error('IPC Error: Failed to set auto-start status', error)
      return { success: false, error: (error as Error).message }
    }
  })
}
