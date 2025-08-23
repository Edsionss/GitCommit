import { ipcMain } from 'electron';
import { getHistory, addToHistory, removeFromHistory, clearHistory } from '../history';

export function registerHistoryHandlers() {
  ipcMain.handle('history:get', getHistory);
  ipcMain.handle('history:add', (_, repoPath: string) => addToHistory(repoPath));
  ipcMain.handle('history:remove', (_, repoPath: string) => removeFromHistory(repoPath));
  ipcMain.handle('history:clear', clearHistory);
}
