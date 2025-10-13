
import { ipcMain } from 'electron';
import { scriptManagementService } from '@services/ScriptManagement';
import type { CreateScriptDto, UpdateScriptDto } from '@shared/types/dtos/ScriptManagement';

export function registerScriptManagementHandlers() {
  ipcMain.handle('script:create', (_, data: CreateScriptDto) => {
    return scriptManagementService.createScript(data);
  });

  ipcMain.handle('script:getAll', () => {
    return scriptManagementService.getAllScripts();
  });

  ipcMain.handle('script:getById', (_, id: string) => {
    return scriptManagementService.getScriptById(id);
  });

  ipcMain.handle('script:update', (_, id: string, data: UpdateScriptDto) => {
    return scriptManagementService.updateScript(id, data);
  });

  ipcMain.handle('script:delete', (_, id: string) => {
    return scriptManagementService.deleteScript(id);
  });

  ipcMain.handle('script:execute', async (_, id: string) => {
    return await scriptManagementService.executeScript(id);
  });
}
