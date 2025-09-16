// src/main/ipcHandlers.ts

import { ipcMain } from 'electron'
import confService from '@features/services/store_conf' // 导入我们的单例

export function registerStoreHandlers() {
  ipcMain.handle('store:get', (event, key) => {
    return confService.get(key)
  })

  ipcMain.handle('store:set', (event, key, value) => {
    confService.set(key, value)
  })

  ipcMain.handle('store:delete', (event, key) => {
    confService.delete(key)
  })
}
