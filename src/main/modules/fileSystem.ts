import { ipcMain, dialog } from 'electron'
import { promises as fs } from 'fs'
import * as path from 'path'
import { createExcelFile, GitCommit } from './excel'

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

  // 保存文件
  ipcMain.handle(
    'save-file',
    async (
      _,
      options: {
        path: string
        content: string
        format: string
        fileName?: string
        commits?: GitCommit[]
      }
    ) => {
      try {
        // 构建默认文件名
        const defaultFileName = options.fileName || `Git提交记录_${Date.now()}.${options.format}`

        // 获取文件保存位置
        const result = await dialog.showSaveDialog({
          defaultPath: path.join(options.path, defaultFileName),
          filters: [{ name: options.format.toUpperCase(), extensions: [options.format] }]
        })

        if (result.canceled || !result.filePath) {
          return null
        }

        // 对Excel格式特殊处理
        if (options.format === 'xlsx' && options.commits) {
          await createExcelFile(result.filePath, options.commits)
          return result.filePath
        }

        // 对大文件处理
        const contentBuffer = Buffer.from(options.content, 'utf8')
        const MAX_SIZE = 100 * 1024 * 1024 // 100MB

        if (contentBuffer.length > MAX_SIZE) {
          // 分卷保存
          const chunks = Math.ceil(contentBuffer.length / MAX_SIZE)
          for (let i = 0; i < chunks; i++) {
            const start = i * MAX_SIZE
            const end = Math.min((i + 1) * MAX_SIZE, contentBuffer.length)
            const chunkContent = contentBuffer.slice(start, end)

            const chunkFileName = result.filePath.replace(
              `.${options.format}`,
              `_part${i + 1}.${options.format}`
            )

            await fs.writeFile(chunkFileName, chunkContent)
          }

          return result.filePath.replace(`.${options.format}`, `_part1-${chunks}.${options.format}`)
        } else {
          // 正常保存
          await fs.writeFile(result.filePath, options.content, 'utf8')
          return result.filePath
        }
      } catch (error) {
        console.error('保存文件错误:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(errorMessage)
      }
    }
  )
}
