
import type { CreateScriptDto, Script, UpdateScriptDto } from '@shared/types/dtos/ScriptManagement';

const { scriptManagement } = window.api;

export const scriptManagementApi = {
  createScript: (data: CreateScriptDto): Promise<Script> => scriptManagement.create(data),
  getAllScripts: (): Promise<Script[]> => scriptManagement.getAll(),
  getScriptById: (id: string): Promise<Script | null> => scriptManagement.getById(id),
  updateScript: (id: string, data: UpdateScriptDto): Promise<Script | null> => scriptManagement.update(id, data),
  deleteScript: (id: string): Promise<void> => scriptManagement.delete(id),
  executeScript: (id: string): Promise<{ stdout: string; stderr: string }> => scriptManagement.execute(id),
};
