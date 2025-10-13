import { dbHelper } from '@features/database'
import type { CreateScriptDto, Script, UpdateScriptDto } from '@shared/types/dtos/ScriptManagement'
import { nanoid } from 'nanoid'
import * as vm from 'vm'
import { sysLogger } from '@nodeUtils/sysLogger'
class ScriptManagementService {
  private readonly tableName = 'scripts'

  /**
   * Creates a new script in the database.
   * @param data - The data for the new script.
   * @returns The newly created script.
   */
  public createScript(data: CreateScriptDto): Script {
    const newId = nanoid()
    const scriptToInsert = { id: newId, ...data }
    dbHelper.insert(this.tableName, scriptToInsert)
    return this.getScriptById(newId)!
  }

  /**
   * Retrieves all scripts from the database.
   * @returns An array of all scripts.
   */
  public getAllScripts(): Script[] {
    return dbHelper.query<Script>('SELECT * FROM scripts ORDER BY updated_at DESC')
  }

  /**
   * Retrieves a single script by its ID.
   * @param id - The ID of the script to retrieve.
   * @returns The script object, or null if not found.
   */
  public getScriptById(id: string): Script | null {
    return dbHelper.findOne<Script>(this.tableName, { id })
  }

  /**
   * Updates an existing script.
   * @param id - The ID of the script to update.
   * @param data - The data to update.
   * @returns The updated script.
   */
  public updateScript(id: string, data: UpdateScriptDto): Script | null {
    dbHelper.update(this.tableName, data, { id })
    return this.getScriptById(id)
  }

  /**
   * Deletes a script from the database.
   * @param id - The ID of the script to delete.
   */
  public deleteScript(id: string): void {
    dbHelper.delete(this.tableName, { id })
  }

  /**
   * Executes a script in a sandboxed environment.
   * @param id - The ID of the script to execute.
   * @returns A promise that resolves with the script's stdout and stderr.
   */
  public async executeScript(id: string): Promise<{ stdout: string; stderr: string }> {
    sysLogger.log(`[ScriptExecution] Starting execution for script ID: ${id}`)
    const script = this.getScriptById(id)
    if (!script) {
      throw new Error(`Script with ID ${id} not found.`)
    }

    // Note: This is a basic sandbox. For true security, this would need
    // to be a separate process with restricted permissions.
    // The context provides access to require, allowing it to use node modules.
    const sandbox = {
      require,
      console: {
        log: (...args) => {
          // capture stdout
          stdout += args.map((arg) => String(arg)).join(' ') + '\n'
        },
        error: (...args) => {
          // capture stderr
          stderr += args.map((arg) => String(arg)).join(' ') + '\n'
        }
      },
      __dirname: __dirname, // Provide a realistic __dirname
      __filename: __filename, // Provide a realistic __filename
      process: process // Provide process object
    }

    let stdout = ''
    let stderr = ''

    try {
      const vmScript = new vm.Script(script.content)
      vm.createContext(sandbox)
      vmScript.runInContext(sandbox, { timeout: 5000 }) // 5-second timeout
    } catch (e) {
      stderr += e.stack
    }

    return { stdout, stderr }
  }
}

export const scriptManagementService = new ScriptManagementService()
