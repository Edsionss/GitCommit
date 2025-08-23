import { dialog } from 'electron'
import { promises as fs } from 'fs'
import * as path from 'path'
import dayjs from 'dayjs'
import type { GitCommit } from '@shared/types/dtos/git.dto'
import { createExcelFile } from './excel' // 导入 createExcelFile

async function saveFile(defaultName: string, content: string | Buffer): Promise<string | null> {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: defaultName
  })

  if (canceled || !filePath) {
    return null
  }

  await fs.writeFile(filePath, content)
  return filePath
}

function convertToCSV(commits: GitCommit[]): string {
  const headers = Object.keys(commits[0] || {})
  let csv = headers.join(',') + '\n'

  for (const commit of commits) {
    const row = headers
      .map((header) => {
        const value = commit[header as keyof GitCommit]
        const strValue = String(value === undefined || value === null ? '' : value)
        // Escape commas and quotes
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`
        }
        return strValue
      })
      .join(',')
    csv += row + '\n'
  }
  return csv
}

export async function exportCommits(
  commits: GitCommit[],
  format: 'json' | 'csv' | 'xlsx'
): Promise<string | null> {
  if (!commits || commits.length === 0) {
    throw new Error('No commits to export.')
  }

  const defaultName = `git-commits-${dayjs().format('YYYYMMDDHHmmss')}`
  let content: string | null = null
  let finalFilePath: string | null = null

  if (format === 'csv') {
    content = convertToCSV(commits)
    finalFilePath = await saveFile(`${defaultName}.csv`, content)
  } else if (format === 'json') {
    content = JSON.stringify(commits, null, 2)
    finalFilePath = await saveFile(`${defaultName}.json`, content)
  } else if (format === 'xlsx') {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: `${defaultName}.xlsx`,
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    })

    if (canceled || !filePath) {
      return null
    }
    await createExcelFile(filePath, commits)
    finalFilePath = filePath
  }

  return finalFilePath
}
