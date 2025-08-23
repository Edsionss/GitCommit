import * as ExcelJS from 'exceljs'

// This interface is shared and might be moved to a dedicated types file later.
export interface GitCommit {
  repository: string
  repoPath: string
  commitId: string
  shortHash: string
  author: string
  email: string
  date: string
  message: string
  body?: string
  filesChanged: number
  insertions: number
  deletions: number
}

export async function createExcelFile(filePath: string, commits: GitCommit[]): Promise<void> {
  try {
    const workbook = new ExcelJS.Workbook()

    // 添加提交记录工作表
    const commitSheet = workbook.addWorksheet('提交记录')

    // 添加表头
    if (commits.length > 0) {
      const headers = Object.keys(commits[0])
      commitSheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: 20
      }))

      // 格式化表头
      const headerRow = commitSheet.getRow(1)
      headerRow.font = { bold: true }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      }

      // 添加数据
      commits.forEach((commit) => {
        const row: any = {}
        headers.forEach((header) => {
          row[header] = commit[header as keyof GitCommit]
        })
        commitSheet.addRow(row)
      })

      // 表格样式
      commitSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
          })
        }
      })
    }

    // 添加统计摘要工作表
    const statsSheet = workbook.addWorksheet('统计摘要')

    // 作者统计
    statsSheet.addRow(['作者统计'])
    statsSheet.addRow(['作者', '提交数', '文件更改', '新增行数', '删除行数'])

    const authorStats: {
      [author: string]: {
        commits: number
        files: number
        insertions: number
        deletions: number
      }
    } = {}

    commits.forEach((commit) => {
      if (!authorStats[commit.author]) {
        authorStats[commit.author] = {
          commits: 0,
          files: 0,
          insertions: 0,
          deletions: 0
        }
      }

      authorStats[commit.author].commits++
      authorStats[commit.author].files += commit.filesChanged
      authorStats[commit.author].insertions += commit.insertions
      authorStats[commit.author].deletions += commit.deletions
    })

    Object.entries(authorStats).forEach(([author, stats]) => {
      statsSheet.addRow([author, stats.commits, stats.files, stats.insertions, stats.deletions])
    })

    // 保存文件
    await workbook.xlsx.writeFile(filePath)
  } catch (error) {
    console.error('创建Excel文件失败:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(errorMessage)
  }
}
