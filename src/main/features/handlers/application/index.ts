import { BrowserWindow, ipcMain } from 'electron'
import { applicationService } from '@services/application'
import { getMainWindow } from '@main/index'

export function registerApplicationHandlers(): void {
  // Register database reset handler
  ipcMain.handle('application:reset-database', async () => {
    try {
      applicationService.resetDatabase()
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error in application:reset-database handler:', errorMessage)
      return { success: false, error: errorMessage }
    }
  })

  // Window management handlers
  const browserWindow: BrowserWindow | null = getMainWindow()
  if (!browserWindow) {
    console.warn('Main window not available for application handlers.')
    return
  }

  ipcMain.on('window:minimize', () => {
    applicationService.minimize(browserWindow)
  })

  ipcMain.on('window:maximize', () => {
    applicationService.maximize(browserWindow)
  })

  ipcMain.on('window:close', () => {
    applicationService.close(browserWindow)
  })

  applicationService.onMaximized(browserWindow, () => {
    browserWindow.webContents.send('window:maximized')
  })

  applicationService.onUnmaximized(browserWindow, () => {
    browserWindow.webContents.send('window:unmaximized')
  })
}
