import { puppeteerService } from './puppeteer'
import { BrowserWindow, session } from 'electron' // 引入 session
import { Page } from 'puppeteer-core'
import { ScrapingTaskOptions } from '@sharedType/Puppeteer'
import crypto from 'crypto' // 使用内置的 crypto 模块生成唯一 ID

// 这是一个通用的爬取任务执行函数 (方案二优化版)
export async function executeScrapingTask<T>(
  ScrapingTaskOptions: ScrapingTaskOptions<T>
): Promise<T> {
  // 从 ScrapingTaskOptions 解构出参数
  const { beforeExecution, scrapingLogic, logicArgs = [], url, windowOptions } = ScrapingTaskOptions

  // 为本次爬虫任务创建一个完全隔离的会话
  const uniquePartition = `persist:scraper_${crypto.randomBytes(8).toString('hex')}`
  const scraperSession = session.fromPartition(uniquePartition)

  // 提前为这个会话设置一个通用的 User-Agent
  // 目标网站会从会话中读取到这个 UA
  const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
  scraperSession.setUserAgent(userAgent)

  // 将窗口创建在屏幕外，使其“可见”但用户看不到
  const offscreenPosition = { x: -3000, y: -3000 }

  const scrapeWindow = new BrowserWindow({
    ...windowOptions, // 合并传入的配置
    x: offscreenPosition.x,
    y: offscreenPosition.y,
    show: true, // 关键：必须为 true，让窗口在操作系统层面被渲染
    frame: false, // 无边框，使其更不显眼
    webPreferences: {
      partition: uniquePartition, // !! 使用隔离的会话 !!
      backgroundThrottling: false // !! 禁用后台节流，确保JS全速运行 !!
      // 根据需要可以添加其他 webPreferences
    }
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

    // --- 关键伪装步骤 ---
    // 再次设置UA和视口，确保Puppeteer层面也生效
    await page.setUserAgent(userAgent)
    await page.setViewport({ width: 1920, height: 1080 })

    // 🎉 在这里执行你所有的准备工作！
    if (beforeExecution) {
      await beforeExecution(page)
    }

    // 执行核心的抓取逻辑
    if (url) {
      console.log(`[Generic Service] Navigating to target URL: ${url}`)
      // 使用更长的超时和更合适的等待条件
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

      // --- 针对问财这类SPA网站，必须等待关键内容加载完成 ---
      // 这是成功的关键一步。你需要根据实际页面内容，找到一个数据加载完成后才会出现的元素。
      // 对于你给的链接，数据表格的 tbody class 是 'tbody_right'
      console.log(`[Generic Service] Waiting for crucial selector '.jgy_tb_box_main'...`)
      await page.waitForSelector('.jgy_tb_box_main', { timeout: 30000 })
      console.log(`[Generic Service] Crucial selector found. Proceeding to evaluate logic.`)
    }

    // 传递参数给 scrapingLogic 并执行
    const data = await page.evaluate(scrapingLogic, ...logicArgs)

    // 返回结果
    return data
  } catch (error) {
    console.error('[PuppeteerService] Error occurred while executing scraping task:', error)

    // --- 调试辅助：在出错时截图和保存页面HTML ---
    if (page) {
      const errorTimestamp = Date.now()
      const screenshotPath = `error-screenshot-${errorTimestamp}.png`
      const htmlPath = `error-page-${errorTimestamp}.html`
      try {
        await page.screenshot({ path: screenshotPath, fullPage: true })
        const htmlContent = await page.content()
        require('fs').writeFileSync(htmlPath, htmlContent)
        console.log(`[PuppeteerService] Saved debug info: ${screenshotPath}, ${htmlPath}`)
      } catch (debugError) {
        console.error(`[PuppeteerService] Failed to save debug info:`, debugError)
      }
    }

    throw error
  } finally {
    if (scrapeWindow && !scrapeWindow.isDestroyed()) {
      scrapeWindow.close()
    }
    // 清理会话数据，释放资源
    await scraperSession.clearStorageData()
    console.log(
      `[Generic Service] Scraper window closed and session data cleared for partition: ${uniquePartition}`
    )
  }
}
