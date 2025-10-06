// puppeteer-service.ts

import { puppeteerService } from './puppeteer'
import { BrowserWindow } from 'electron' // 引入 session
import { Page } from 'puppeteer-core'
import { ScrapingTaskOptions } from '@sharedType/Puppeteer'
import crypto from 'crypto' // 使用内置的 crypto 模块生成唯一 ID
import dayjs from 'dayjs'
import path from 'path'
import { writeResultFile } from '@nodeUtils/index'
// 这是一个通用的爬取任务执行函数
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
    captureError,
    debuggerMode = false
  } = ScrapingTaskOptions

  // 为本次爬虫任务创建一个完全隔离的会话
  const uniquePartition = `scraper_${crypto.randomBytes(8).toString('hex')}`
  const scrapeWindow = new BrowserWindow({
    show: debuggerMode,
    width: debuggerMode ? 2000 : 0,
    height: debuggerMode ? 900 : 0,
    webPreferences: {
      partition: uniquePartition, // !! 使用隔离的会话 !!
      backgroundThrottling: false // !! 禁用后台节流，确保JS全速运行 !!
      // 根据需要可以添加其他 webPreferences
    },
    ...windowOptions // 合并传入的配置
  })

  if (debuggerMode) {
    scrapeWindow.webContents.once('did-finish-load', () => {
      scrapeWindow.webContents.openDevTools({ mode: 'right' }) // 不挤压主界面
    })
  }

  let page: Page | null = null
  let resultData: any = {}
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
      try {
        let result = await beforeExecution(page, beforeExecutionData, scrapeWindow)
        result && (resultData = result)
      } catch (error) {
        console.error('[PuppeteerService] Error occurred during beforeExecution:', error)
        throw error
      }
    }

    // 执行核心的抓取逻辑
    if (url) {
      console.log(`[Generic Service] Navigating to target URL: ${url}`)
      // 使用更长的超时和更合适的等待条件
      await page.goto(url, { waitUntil: 'networkidle0' })
    }
    if (scrapingLogic) {
      // 传递参数给 scrapingLogic 并执行
      const data = await page.evaluate(scrapingLogic, ...logicArgs)
      resultData = Object.assign(resultData, data)
      // 返回结果
    }

    if (debuggerMode) {
      writeResultFile('puppeteer/result', resultData)
      await new Promise((r) => setTimeout(r, 500000000)) // ✅ 稳定性等待
    }

    return resultData
  } catch (error) {
    console.error('[PuppeteerService] Error occurred while executing scraping task:', error)
    if (page && captureError) {
      const errorLogDir = path.join(process.cwd(), 'puppeteerError')

      const now = dayjs()
      const errorTimestamp = now.format('YYYYMMDD-HHmmss')
      const specificErrorDir = path.join(errorLogDir, errorTimestamp)

      console.log(`[PuppeteerService] Saving debug info to: ${specificErrorDir}`)

      // 日志内容初始化
      let logContent = `[${now.format('YYYY-MM-DD HH:mm:ss')}] - Primary Scraping Error\n`
      logContent += '======================================================\n'
      logContent +=
        error instanceof Error
          ? `Message: ${error.message}\n\nStack Trace:\n${error.stack}\n`
          : `Details: ${JSON.stringify(error, null, 2)}\n`

      // 1️⃣ 保存 HTML
      try {
        const htmlContent = await page.content()
        writeResultFile(specificErrorDir, htmlContent, 'page', 'html')
        console.log(`[PuppeteerService] Successfully saved HTML.`)
      } catch (htmlError) {
        const errMsg =
          `\n[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] - FAILED TO SAVE HTML\n` +
          '======================================================\n' +
          (htmlError instanceof Error ? htmlError.stack : JSON.stringify(htmlError)) +
          '\n'
        console.error(errMsg)
        logContent += errMsg
      }

      // 2️⃣ 保存截图
      try {
        const screenshotBuffer = await page.screenshot({ fullPage: true })
        writeResultFile(specificErrorDir, screenshotBuffer, 'screenshot', 'png')
        console.log(`[PuppeteerService] Successfully saved screenshot.`)
      } catch (screenshotError) {
        const errMsg =
          `\n[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] - FAILED TO SAVE SCREENSHOT\n` +
          '======================================================\n' +
          (screenshotError instanceof Error
            ? screenshotError.stack
            : JSON.stringify(screenshotError)) +
          '\n'
        console.error(errMsg)
        logContent += errMsg
      }

      // 3️⃣ 写入日志
      try {
        writeResultFile(specificErrorDir, logContent, 'error', 'log')
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
