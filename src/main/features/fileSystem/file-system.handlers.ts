// src/main/features/fileSystem/file-system.handlers.ts
import { ipcMain, dialog } from 'electron';
import { validateRepositoryPath } from './file-system.service';

export function registerFileSystemHandlers() {
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    if (!result.canceled && result.filePaths.length > 0) {
      const repoPath = result.filePaths[0];
      return await validateRepositoryPath(repoPath);
    }
    return null;
  });
}
