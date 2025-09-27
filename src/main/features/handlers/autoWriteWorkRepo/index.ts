import { AutomaticallyFillWorkSheet } from '@services/autoWriteWorkRepo'
import { ipcMain } from 'electron'

export function registerAutoWriteWorkRepoHandlers() {
  ipcMain.handle('autoWrite-WorkRepo', async (_, data: any) => {
    return await AutomaticallyFillWorkSheet(data)
  })
}
