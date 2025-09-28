import { BrowserWindow, ipcMain } from 'electron'
import { windowService } from '@services/windows'
import { getMainWindow } from '@main/index'
export function registerWindowHandlers(): void {
  let browserWindow: BrowserWindow | null = getMainWindow()
  if (!browserWindow) {
    return
  }

  ipcMain.on('window:minimize', () => {
    windowService.minimize(browserWindow)
  })

  ipcMain.on('window:maximize', () => {
    windowService.maximize(browserWindow)
  })

  ipcMain.on('window:close', () => {
    windowService.close(browserWindow)
  })

  windowService.onMaximized(browserWindow, () => {
    browserWindow.webContents.send('window:maximized')
  })

  windowService.onUnmaximized(browserWindow, () => {
    browserWindow.webContents.send('window:unmaximized')
  })
}
