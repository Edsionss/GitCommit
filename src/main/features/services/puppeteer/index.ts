// puppeteer-service.ts

import { puppeteerService } from './puppeteer'
import { BrowserWindow, session } from 'electron' // 引入 session
import { Page } from 'puppeteer-core'
import { ScrapingTaskOptions } from '@sharedType/Puppeteer'
import crypto from 'crypto' // 使用内置的 crypto 模块生成唯一 ID
import dayjs from 'dayjs'
import path from 'path'
import fs from 'fs'
// 这是一个通用的爬取任务执行函数 (方案二优化版)
export async function executeScrapingTask<T>(
  ScrapingTaskOptions: ScrapingTaskOptions<T>
): Promise<T> {
  // 从 ScrapingTaskOptions 解构出参数
  const {
    beforeExecution,
    beforeExecutionData,
    scrapingLogic,
    logicArgs = [],
    url,
    windowOptions,
    captureError
  } = ScrapingTaskOptions

  // 为本次爬虫任务创建一个完全隔离的会话
  const uniquePartition = `persist:scraper_${crypto.randomBytes(8).toString('hex')}`

  const scrapeWindow = new BrowserWindow({
    show: false, // 关键：必须为 true，让窗口在操作系统层面被渲染
    webPreferences: {
      partition: uniquePartition, // !! 使用隔离的会话 !!
      backgroundThrottling: false // !! 禁用后台节流，确保JS全速运行 !!
      // 根据需要可以添加其他 webPreferences
    },
    ...windowOptions // 合并传入的配置
  })

  let page: Page | null = null

  try {
    // 确保服务已连接
    if (!puppeteerService.isConnected()) {
      await puppeteerService.connect()
    }

    // 生成一个绝对唯一的 URL 作为这个窗口的“身份证”
    const uniqueId = crypto.randomBytes(16).toString('hex')
    const targetUrl = `about:blank?target_id=${uniqueId}`

    // 让窗口加载这个唯一的 URL
    await scrapeWindow.loadURL(targetUrl)
    console.log(`[Generic Service] Created off-screen window, unique URL: ${targetUrl}`)

    // 获取你想要操作的 Page 对象
    page = await puppeteerService.findPageByUrl(targetUrl)
    if (!page) {
      throw new Error(`Could not find Puppeteer page for URL: ${targetUrl}`)
    }

    // 🎉 在这里执行你所有的准备工作！
    if (beforeExecution) {
      await beforeExecution(page, beforeExecutionData)
    }

    // 执行核心的抓取逻辑
    if (url) {
      console.log(`[Generic Service] Navigating to target URL: ${url}`)
      // 使用更长的超时和更合适的等待条件
      await page.goto(url, { waitUntil: 'networkidle0' })
    }
    let data
    if (scrapingLogic) {
      // 传递参数给 scrapingLogic 并执行
      data = await page.evaluate(scrapingLogic, ...logicArgs)

      // 返回结果
    }
    return data || 'success'
  } catch (error) {
    console.error('[PuppeteerService] Error occurred while executing scraping task:', error)
    if (page && captureError) {
      // --- 准备工作：创建目录和初始化日志内容 ---
      const errorLogDir = path.join(process.cwd(), 'puppeteerError')
      if (!fs.existsSync(errorLogDir)) {
        fs.mkdirSync(errorLogDir, { recursive: true })
      }
      const now = dayjs()
      const errorTimestamp = now.format('YYYYMMDD-HHmmss')
      const specificErrorDir = path.join(errorLogDir, errorTimestamp)
      fs.mkdirSync(specificErrorDir)
      const screenshotPath = path.join(specificErrorDir, 'screenshot.png')
      const htmlPath = path.join(specificErrorDir, 'page.html')
      const logPath = path.join(specificErrorDir, 'error.log')
      console.log(`[PuppeteerService] Saving debug info to: ${specificErrorDir}`)
      // 准备初始日志内容
      let logContent = `[${now.format('YYYY-MM-DD HH:mm:ss')}] - Primary Scraping Error\n`
      logContent += '======================================================\n'
      logContent +=
        error instanceof Error
          ? `Message: ${error.message}\n\nStack Trace:\n${error.stack}\n`
          : `Details: ${JSON.stringify(error, null, 2)}\n`
      // --- 顺序、独立地保存每个调试文件 ---
      // 1. 尝试保存 HTML
      try {
        const htmlContent = await page.content()
        fs.writeFileSync(htmlPath, htmlContent)
        console.log(`[PuppeteerService] Successfully saved HTML.`)
      } catch (htmlError) {
        const errorMessage =
          `\n[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] - FAILED TO SAVE HTML\n` +
          '======================================================\n' +
          (htmlError instanceof Error ? htmlError.stack : JSON.stringify(htmlError)) +
          '\n'
        console.error(errorMessage)
        logContent += errorMessage
      }
      // 2. 尝试保存截图
      try {
        await page.screenshot({ path: screenshotPath, fullPage: true })
        console.log(`[PuppeteerService] Successfully saved screenshot.`)
      } catch (screenshotError) {
        const errorMessage =
          `\n[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] - FAILED TO SAVE SCREENSHOT\n` +
          '======================================================\n' +
          (screenshotError instanceof Error
            ? screenshotError.stack
            : JSON.stringify(screenshotError)) +
          '\n'
        console.error(errorMessage)
        logContent += errorMessage
      }
      // 3. 最终，无论如何都尝试写入日志文件
      try {
        fs.writeFileSync(logPath, logContent)
        console.log(`[PuppeteerService] Successfully saved error log.`)
      } catch (logWriteError) {
        console.error(`[PuppeteerService] CRITICAL: Failed to write error log file:`, logWriteError)
      }
    }
    throw error
  } finally {
    if (scrapeWindow && !scrapeWindow.isDestroyed()) {
      scrapeWindow.close()
    }
  }
}
