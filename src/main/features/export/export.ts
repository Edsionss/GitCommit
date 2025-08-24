import { ipcMain } from 'electron'
import { exportCommits } from '@services/export/export'

export function registerExportHandlers() {
  ipcMain.handle('export:commits', (_, commits, format) => exportCommits(commits, format))
}
