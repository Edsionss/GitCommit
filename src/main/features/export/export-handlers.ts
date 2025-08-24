import { ipcMain } from 'electron'
import { exportCommits } from './export-service'

export function registerExportHandlers() {
  ipcMain.handle('export:commits', (_, commits, format) => exportCommits(commits, format))
}
