import { ipcMain, dialog } from 'electron'
import { promises as fs } from 'fs'
import * as path from 'path'
import { createExcelFile, GitCommit } from '@main/features/excel'


// This function needs to be passed from the git module or defined globally
// For now, we'll assume it's passed in or imported if it were in a shared utility file.
// To avoid circular dependencies, we will pass it as an argument during registration.

export function registerFileSystemHandlers(isValidGitRepo: (repoPath: string) => Promise<boolean>) {
  // 选择目录
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (!result.canceled && result.filePaths.length > 0) {
      const repoPath = result.filePaths[0]
      const isValid = await isValidGitRepo(repoPath)
      return { path: repoPath, isValid }
    }
    return null
  })

  
}
