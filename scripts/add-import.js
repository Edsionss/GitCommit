// scripts/add-import.js

const fs = require('fs')
const path = require('path')

// =================== 配置区 (请根据你的需求修改这里) ===================

// 1. 你想要添加的 import 语句
const IMPORT_STATEMENT_TO_ADD = `import { sysLogger } from '@nodeUtils/sysLogger';`

// 2. 你想要扫描的目标文件夹
const TARGET_SUBFOLDER = 'src/main/'

// 3. 文件的扩展名
const FILE_EXTENSION = '.ts'

// 4. 【新增】触发条件：只有当文件中包含此关键词时，才添加 import
//    使用 \b 可以确保匹配的是整个单词，例如匹配 'console' 而不是 'remoteconsole'
const KEYWORD_TO_MATCH = 'console'
const keywordRegex = new RegExp(`\\b${KEYWORD_TO_MATCH}\\b`)

// =======================================================================

/**
 * 递归查找指定目录下的所有文件 (此函数无需修改)
 * @param {string} dirPath - 要搜索的目录
 * @param {string} extension - 文件扩展名 (例如 '.ts')
 * @param {string[]} arrayOfFiles - (内部使用) 累积文件列表
 * @returns {Promise<string[]>} - 返回包含所有文件绝对路径的数组
 */
async function getAllFiles(dirPath, extension, arrayOfFiles = []) {
  try {
    const files = await fs.promises.readdir(dirPath)

    for (const file of files) {
      const fullPath = path.join(dirPath, file)
      try {
        const stat = await fs.promises.stat(fullPath)
        if (stat.isDirectory()) {
          await getAllFiles(fullPath, extension, arrayOfFiles)
        } else if (path.extname(fullPath) === extension) {
          arrayOfFiles.push(fullPath)
        }
      } catch (err) {
        console.warn(`[警告] 无法访问路径: ${fullPath}，已跳过。错误: ${err.message}`)
      }
    }
  } catch (err) {
    console.error(`[错误] 读取目录失败: ${dirPath}`, err)
  }
  return arrayOfFiles
}

/**
 * 健壮的、与运行位置无关的主函数
 */
async function main() {
  console.log('--- 开始执行脚本 (V3 - 条件性添加) ---')

  try {
    const projectRoot = path.resolve(__dirname, '..')
    const targetDir = path.join(projectRoot, TARGET_SUBFOLDER)

    console.log(`[调试] 项目根目录: ${projectRoot}`)
    console.log(`[调试] 目标文件夹: ${targetDir}`)
    console.log(`[INFO] 将为包含关键词 "${KEYWORD_TO_MATCH}" 的文件添加 import...`)

    if (!fs.existsSync(targetDir)) {
      console.error(`\n[致命错误] 目标文件夹不存在: "${targetDir}"`)
      return
    }

    console.log(`[INFO] 正在递归扫描文件夹: ${targetDir}`)
    const files = await getAllFiles(targetDir, FILE_EXTENSION)

    if (files.length === 0) {
      console.warn(
        `\n[警告] 操作完成，但在 "${targetDir}" 目录下没有找到任何匹配的 "${FILE_EXTENSION}" 文件。`
      )
      return
    }

    console.log(`\n[INFO] 扫描到 ${files.length} 个文件，开始检查并处理...`)

    // 【修改】增加更多计数器，以提供更详细的报告
    let modifiedCount = 0
    let skippedKeywordCount = 0
    let skippedImportExistsCount = 0

    files.forEach((absoluteFilePath) => {
      try {
        const relativePath = path.relative(projectRoot, absoluteFilePath)
        const content = fs.readFileSync(absoluteFilePath, 'utf8')

        // 【核心修改】第一步：检查文件内容是否包含关键词
        if (!keywordRegex.test(content)) {
          // 如果不包含，则记录并跳过此文件
          console.log(`  [忽略] ${relativePath} (未找到关键词 '${KEYWORD_TO_MATCH}')`)
          skippedKeywordCount++
          return // 跳到下一个文件
        }

        // 如果包含关键词，则执行之前的逻辑
        // 第二步：检查 import 语句是否已存在
        if (content.includes(IMPORT_STATEMENT_TO_ADD.trim())) {
          console.log(`- [跳过] ${relativePath} (关键词存在，但 import 已存在)`)
          skippedImportExistsCount++
          return
        }

        // 第三步：执行添加操作
        const newContent = `${IMPORT_STATEMENT_TO_ADD}\n${content}`
        fs.writeFileSync(absoluteFilePath, newContent, 'utf8')
        console.log(`+ [成功] ${relativePath} (已添加 import)`)
        modifiedCount++
      } catch (error) {
        console.error(`x [失败] 处理文件 ${absoluteFilePath} 时出错:`, error)
      }
    })

    // 【修改】更新最终的总结报告
    console.log(`\n--- 操作完成 ---`)
    console.log(`总共扫描到 ${files.length} 个 ${FILE_EXTENSION} 文件。`)
    console.log(`- 成功修改: ${modifiedCount} 个`)
    console.log(`- 因 import 已存在而跳过: ${skippedImportExistsCount} 个`)
    console.log(`- 因未找到关键词 "${KEYWORD_TO_MATCH}" 而忽略: ${skippedKeywordCount} 个`)
  } catch (err) {
    console.error('[错误] 脚本执行过程中发生严重错误:', err)
  }
}

// 运行主函数
main()
