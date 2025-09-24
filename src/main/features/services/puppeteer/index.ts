import { puppeteerService } from './puppeteer'
import { BrowserWindow } from 'electron'
import { Page } from 'puppeteer-core'
import { ScrapingTaskOptions } from '@sharedType/Puppeteer'
import crypto from 'crypto' // 使用内置的 crypto 模块生成唯一 ID

// 这是一个通用的爬取任务执行函数
export async function executeScrapingTask<T>(
  ScrapingTaskOptions: ScrapingTaskOptions<T>
): Promise<T> {
  // 从 ScrapingTaskOptions 解构出参数
  const { beforeExecution, scrapingLogic, logicArgs = [], url, windowOptions } = ScrapingTaskOptions
  // 创建一个隐藏的 Electron 窗口
  const scrapeWindow = new BrowserWindow({
    show: false,
    ...windowOptions, // 合并传入的配置
    webPreferences: {
      /* ... */
    }
  })
  try {
    // 确保服务已连接 (可以在应用启动时全局连接一次)
    if (!puppeteerService.isConnected()) {
      await puppeteerService.connect()
    }
    // 生成一个绝对唯一的 URL 作为这个窗口的“身份证”
    const uniqueId = crypto.randomBytes(16).toString('hex')
    // 创建一个空的页面，并设置唯一的 URL
    const targetUrl = `about:blank?target_id=${uniqueId}`

    //  让窗口加载这个唯一的 URL
    await scrapeWindow.loadURL(targetUrl) // 新的、可靠的方法

    console.log(`[Generic Service] cerate  window ，only URL: ${targetUrl}`)

    //  获取你想要操作的 Page 对象
    const page: Page = await puppeteerService.findPageByUrl(targetUrl)
    // 🎉 在这里执行你所有的准备工作！你拥有完全的控制权！
    beforeExecution && (await beforeExecution(page))
    //  执行核心的抓取逻辑
    if (url) {
      await page.goto(url, { waitUntil: 'networkidle2' })
    }
    // 传递参数给 scrapingLogic
    const data = await page.evaluate(scrapingLogic, ...logicArgs)
    // 返回结果
    return data
  } catch (error) {
    console.error('[PuppeteerService] Error occurred while executing scraping task:', error)
    throw error
  } finally {
    if (scrapeWindow && !scrapeWindow.isDestroyed()) {
      scrapeWindow.close()
    }
  }
}
