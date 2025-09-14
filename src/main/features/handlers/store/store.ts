// src/main/ipcHandlers.ts

import { ipcMain } from 'electron'
import storeService from '@services/store/store' // 导入我们的单例

export function registerStoreHandlers() {
  ipcMain.handle('store:get', (event, key) => {
    return storeService.get(key)
  })

  ipcMain.handle('store:set', (event, key, value) => {
    storeService.set(key, value)
  })

  ipcMain.handle('store:delete', (event, key) => {
    storeService.delete(key)
  })
}

// 别忘了在你的主文件 (main/index.ts) 中调用这个函数来注册处理器
// app.whenReady().then(() => { ...; registerStoreHandlers(); });
