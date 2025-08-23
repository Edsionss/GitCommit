import { ipcMain } from 'electron'
import { exportCommits } from '../export'

export function registerExportHandlers() {
  ipcMain.handle('export:commits', (_, commits, format) => exportCommits(commits, format))
}
