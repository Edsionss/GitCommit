/**
 * =============================================================================
 *  项目精简脚本 (make-lite.ts)
 * =============================================================================
 *  功能:
 *  1. 删除指定的文件和文件夹。
 *  2. 移除特定文件中的代码块或配置项。
 *  3. 用“精简版”文件完全替换现有文件。
 *
 *  使用方法:
 *  - 演练 (只看不做): npm run make-lite:dry-run
 *  - 执行 (实际操作): npm run make-lite
 *
 *  ⚠️ 警告: 这是一个破坏性操作！在执行前请务必确认配置无误，
 *           并建议通过版本控制 (如 Git) 备份你的代码。
 * =============================================================================
 */
import * as path from 'path'
import * as fs from 'fs'
import { rimraf } from 'rimraf'
import { spawnSync } from 'child_process'
// =============================================================================
//  配置区域 - 请根据你的项目需求修改以下三个配置数组
// =============================================================================

/**
 *  配置 1: 要删除的文件或文件夹
 *  列出所有需要被彻底删除的路径 (相对于项目根目录)。
 */
const filesToDelete: string[] = [
  'MD_FILE',
  'node_modules',
  'out',
  'release',
  'pnpm-lock.yaml',
  'src/main/features/database',
  'src/main/features/handlers/puppeteer',
  'src/main/features/handlers/stock',
  'src/main/features/services/export',
  'src/main/features/services/stock',
  'src/main/features/services/process',
  'src/main/features/services/routes_menu',
  'src/main/features/services/windows',
  'src/renderer/src/api/export.ts',
  'src/renderer/src/api/stock.ts',
  'src/renderer/src/components/charts',
  'src/renderer/src/components/CodeAnalysisView',
  'src/renderer/src/components/Common',
  'src/renderer/src/components/Dashboard',
  'src/renderer/src/components/MenuManagement',
  'src/renderer/src/components/ReportsView',
  'src/renderer/src/components/stock',
  'src/renderer/src/stores/stock.ts',
  'src/renderer/src/views/CodeAnalysis.vue',
  'src/renderer/src/views/Dashboard.vue',
  'src/renderer/src/views/MenuManagement.vue',
  'src/renderer/src/views/Reports.vue',
  'src/renderer/src/views/Stock.vue',
  'src/renderer/src/views/Stock.vue',
  'stock_demo',
  'MakeLite'
]

/**
 *  配置 2: 需要修改内容的文件
 *  定义一个规则数组，每个规则包含文件路径和用于移除内容的正则表达式。
 */
const contentToModify: { filePath: string; patternsToRemove: RegExp[] }[] = [
  // {
  //   // 示例 1: 从一个主进程文件中移除被特殊注释包裹的开发代码
  //   filePath: 'electron/main/index.ts', // 假设这是你的主进程文件路径
  //   patternsToRemove: [
  //     // 这个正则表达式匹配从 '// DEV_ONLY_CODE_START' 到 '// DEV_ONLY_CODE_END' 之间的所有内容，包括这两行注释本身
  //     /\/\/ DEV_ONLY_CODE_START[\s\S]*?\/\/ DEV_ONLY_CODE_END\r?\n?/g
  //   ]
  // },
  // {
  //   // 示例 2: 从 package.json 中移除一个特定的开发脚本和开发依赖
  //   filePath: 'package.json',
  //   patternsToRemove: [
  //     // 移除 "dev-script" 脚本行，并处理可能存在的行尾逗号
  //     /"dev-script": ".*?",?\s*/g,
  //     // 移除整个 "devDependencies" 块
  //     /"devDependencies":\s*{[\s\S]*?},?\s*/g
  //   ]
  // }
]

/**
 *  配置 3: 需要被完整替换的文件
 *  每个规则包含一个源文件(source)和一个目标文件(destination)。
 */
const filesToReplace: { source: string; destination: string; deleteSource?: boolean }[] = [
  {
    //  用精简版的 ipcHandlers.ts 替换现有的 ipcHandlers.ts
    destination: 'src/main/features/handlers/ipcHandlers.ts',
    source: 'MakeLite/ipcHandlers.ts'
  },
  {
    // 用精简版的 主进程 index.ts 替换现有的 index.ts
    destination: 'src/main/index.ts',
    source: 'MakeLite/index.ts'
  },
  {
    destination: 'src/preload/index.ts',
    source: 'MakeLite/preload/index.ts'
  },
  {
    destination: 'src/preload/index.d.ts',
    source: 'MakeLite/preload/index.d.ts'
  },
  {
    destination: 'src/renderer/src/views/Settings.vue',
    source: 'MakeLite/Settings.vue'
  },
  {
    destination: 'package.json',
    source: 'MakeLite/package.json'
  }
]

// =============================================================================
//  执行逻辑 - 通常无需修改以下代码
// =============================================================================

const projectRoot = path.resolve(__dirname, '..')
const isDryRun = process.argv.includes('--dry-run')

function main() {
  if (isDryRun) {
    console.log('🔥 当前为演练模式 (Dry Run)，将只显示变更，不实际写入或删除文件。\n')
  }

  console.log('🚀 开始执行精简版创建脚本...')
  console.log('项目根目录:', projectRoot)

  runPhase2_ModifyContent()
  runPhase3_ReplaceFiles()
  runPhase1_DeleteFiles()
  runPhase4_ReinstallDependencies()

  console.log('\n🎉 精简版创建脚本执行完毕！项目已准备就绪。')
}

function runPhase1_DeleteFiles() {
  console.log('\n--- 阶段 1: 删除文件和文件夹 ---')
  let processedCount = 0
  filesToDelete.forEach((fileOrDir) => {
    const targetPath = path.join(projectRoot, fileOrDir)
    try {
      if (fs.existsSync(targetPath)) {
        if (isDryRun) {
          console.log(`[演练] 准备删除: ${fileOrDir}`)
        } else {
          console.log(`🗑️  正在删除: ${fileOrDir}`)
          rimraf.sync(targetPath)
        }
        processedCount++
      } else {
        console.log(`🟡  跳过，不存在: ${fileOrDir}`)
      }
    } catch (error) {
      console.error(`❌  删除失败: ${fileOrDir}`, error)
    }
  })
  console.log(`✅ 阶段 1 完成。共处理 ${processedCount} 个目标。`)
}

function runPhase2_ModifyContent() {
  console.log('\n--- 阶段 2: 修改文件内容 ---')
  let modifiedFileCount = 0
  contentToModify.forEach((rule) => {
    const targetPath = path.join(projectRoot, rule.filePath)

    if (!fs.existsSync(targetPath)) {
      console.log(`🟡  跳过，文件不存在: ${rule.filePath}`)
      return
    }

    try {
      const originalContent = fs.readFileSync(targetPath, 'utf8')
      let newContent = originalContent

      console.log(`📝  正在处理文件: ${rule.filePath}`)

      rule.patternsToRemove.forEach((pattern) => {
        newContent = newContent.replace(pattern, '')
      })

      if (newContent !== originalContent) {
        if (isDryRun) {
          console.log(`[演练] 文件 ${rule.filePath} 的内容将会被修改。`)
        } else {
          console.log(`💾  正在保存修改: ${rule.filePath}`)
          fs.writeFileSync(targetPath, newContent, 'utf8')
        }
        modifiedFileCount++
      } else {
        console.log(`🟢  内容无变化: ${rule.filePath}`)
      }
    } catch (error) {
      console.error(`❌  修改文件失败: ${rule.filePath}`, error)
    }
  })
  console.log(`✅ 阶段 2 完成。共修改了 ${modifiedFileCount} 个文件。`)
}

function runPhase3_ReplaceFiles() {
  console.log('\n--- 阶段 3: 替换并清理源文件 ---') // 更新标题
  let replacedFileCount = 0
  filesToReplace.forEach((rule) => {
    rule.deleteSource = rule.deleteSource == undefined ? true : rule.deleteSource
    const sourcePath = path.join(projectRoot, rule.source)
    const destinationPath = path.join(projectRoot, rule.destination)

    if (!fs.existsSync(sourcePath)) {
      console.error(`❌  替换失败：源文件不存在: ${rule.source}`)
      return
    }

    try {
      if (isDryRun) {
        console.log(`[演练] 文件 '${rule.destination}' 将被 '${rule.source}' 的内容覆盖。`)
        // 在演练模式下也显示将要删除的源文件
        if (rule.deleteSource) {
          console.log(`[演练]   └─ 源文件 '${rule.source}' 将在之后被删除。`)
        }
      } else {
        // 1. 执行替换
        const content = fs.readFileSync(sourcePath, 'utf8')
        console.log(`🔄  正在用 '${rule.source}' 替换 '${rule.destination}'...`)
        fs.writeFileSync(destinationPath, content, 'utf8')

        // 2. 如果设置了 deleteSource: true，则删除源文件
        if (rule.deleteSource) {
          console.log(`🗑️  正在删除源文件: ${rule.source}`)
          rimraf.sync(sourcePath)
        }
      }
      replacedFileCount++
    } catch (error) {
      console.error(`❌  替换/删除文件时出错: ${rule.source} -> ${rule.destination}`, error)
    }
  })
  console.log(`✅ 阶段 3 完成。共处理了 ${replacedFileCount} 个替换规则。`)
}

/**
 *  阶段 4: 重新安装项目依赖
 */
function runPhase4_ReinstallDependencies() {
  console.log('\n--- 阶段 4: 重新安装依赖 ---')

  if (isDryRun) {
    console.log('[演练] 将会执行 `pnpm install` 命令来同步依赖。')
    console.log('✅ 阶段 4 完成。')
    return
  }

  try {
    console.log('📦  正在执行 `pnpm install`，请稍候...')

    // 使用 spawnSync 来执行 pnpm install 命令
    const result = spawnSync('pnpm', ['install'], {
      cwd: projectRoot,
      // 使用 'pipe' 来捕获输出，而不是直接显示
      // encoding: 'utf-8' 让输出直接是字符串
      stdio: 'pipe',
      encoding: 'utf-8',
      shell: true
    })

    // 同时检查退出码和错误输出
    // pnpm 的 "No projects found" 是在 stderr 中输出的
    if (result.status !== 0 || (result.stderr && result.stderr.includes('ERR_PNPM'))) {
      console.error('\n❌  `pnpm install` 执行失败！')
      // 打印完整的输出方便调试
      console.error('--- STDOUT ---')
      console.log(result.stdout)
      console.error('--- STDERR ---')
      console.error(result.stderr)
      // 强制以失败状态退出整个脚本
      process.exit(1)
    } else {
      // 如果成功，我们仍然可以打印输出
      console.log(result.stdout)
      // 如果 stderr 有内容但不是错误（比如只是警告），也打印出来
      if (result.stderr) {
        console.warn(result.stderr)
      }
      console.log('\n✅ `pnpm install` 执行成功！')
    }
  } catch (error) {
    console.error('❌  执行 `pnpm install` 时发生未知错误:', error)
    process.exit(1)
  }
  console.log('✅ 阶段 4 完成。')
}

// 脚本入口
main()
