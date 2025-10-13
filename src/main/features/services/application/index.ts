import { sysLogger } from '@nodeUtils/sysLogger'
import { BrowserWindow, app } from 'electron'
import fs from 'fs'
import { db, dbPath } from '@features/database'

class ApplicationService {
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

  public startPerformanceMonitoring(browserWindow: BrowserWindow): void {
    if (!browserWindow) return

    let lastUsage = process.cpuUsage()
    let lastTimestamp = Date.now()

    setInterval(() => {
      const currentTimestamp = Date.now()
      const currentUsage = process.cpuUsage()

      const elapsedMs = currentTimestamp - lastTimestamp
      // Ensure we don't divide by zero if the interval is too fast
      if (elapsedMs === 0) return

      const elapsedUs = elapsedMs * 1000 // microseconds

      const userUs = currentUsage.user - lastUsage.user
      const systemUs = currentUsage.system - lastUsage.system

      lastTimestamp = currentTimestamp
      lastUsage = currentUsage

      const cpuPercent = ((userUs + systemUs) / elapsedUs) * 100
      const memoryUsage = process.memoryUsage().heapUsed

      // Log the metrics before sending
      // sysLogger.log(`Sending metrics: CPU: ${cpuPercent.toFixed(1)}%, Memory: ${(memoryUsage / 1024 / 1024).toFixed(0)}MB`)

      // Send metrics to renderer process
      if (browserWindow && !browserWindow.isDestroyed()) {
        browserWindow.webContents.send('app-metrics-update', {
          cpu: cpuPercent,
          memory: memoryUsage
        })
      }
    }, 1500)
  }

  /**
   * Resets the application database.
   * This function closes the database connection, deletes the database file,
   * and then restarts the application to ensure a clean state.
   */
  public resetDatabase(): void {
    try {
      sysLogger.log('Closing database connection...')
      db.close()
      sysLogger.log(`Database connection closed. Deleting database file at: ${dbPath}`)
      fs.unlinkSync(dbPath)
      sysLogger.log('Database file deleted successfully.')

      // Relaunch the application
      sysLogger.log('Relaunching the application...')
      app.relaunch()
      app.exit()
    } catch (error) {
      sysLogger.error('Failed to reset database:', error)
      throw new Error('Failed to reset database.')
    }
  }
}

export const applicationService = new ApplicationService()
