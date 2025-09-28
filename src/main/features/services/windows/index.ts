import { BrowserWindow } from 'electron'

class WindowService {
  public minimize(browserWindow: BrowserWindow): void {
    if (browserWindow) {
      browserWindow.minimize()
    }
  }

  public maximize(browserWindow: BrowserWindow): void {
    if (browserWindow) {
      if (browserWindow.isMaximized()) {
        browserWindow.unmaximize()
      } else {
        browserWindow.maximize()
      }
    }
  }

  public close(browserWindow: BrowserWindow): void {
    if (browserWindow) {
      browserWindow.close()
    }
  }

  public onMaximized(browserWindow: BrowserWindow, callback: () => void): void {
    if (browserWindow) {
      browserWindow.on('maximize', callback)
    }
  }

  public onUnmaximized(browserWindow: BrowserWindow, callback: () => void): void {
    if (browserWindow) {
      browserWindow.on('unmaximize', callback)
    }
  }
}

export const windowService = new WindowService()
