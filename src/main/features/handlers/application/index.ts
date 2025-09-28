import { BrowserWindow, ipcMain } from 'electron'
import { applicationService } from '@services/application'
import { getMainWindow } from '@main/index'
export function registerApplicationHandlers(): void {
  let browserWindow: BrowserWindow | null = getMainWindow()
  if (!browserWindow) {
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
