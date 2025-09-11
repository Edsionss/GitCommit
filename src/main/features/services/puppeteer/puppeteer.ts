// src/puppeteer-util.ts

import puppeteer, { Browser, Page } from 'puppeteer-core'

export interface ScrapeOptions {
  /**
   * 唯一的目标 URL，用于识别要附加到的后台窗口。
   * 必须是一个能唯一标识窗口的 URL。
   */
  targetUrl: string
}

export async function scrapeData<T>(
  urlToScrape: string, // 要爬取的目标网页
  scrapingLogic: () => T,
  options: ScrapeOptions
): Promise<any> {
  if (!options.targetUrl) {
    throw new Error('操，必须提供 targetUrl 来识别窗口！')
  }

  let browser: Browser | undefined

  try {
    browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222'
    })

    // ================== 核心修正 ==================
    // 轮询查找目标，直到找到或者超时
    const target = await findTarget(browser, options.targetUrl)
    // ============================================

    if (!target) {
      throw new Error(`操，死活找不到 URL 为 "${options.targetUrl}" 的目标窗口。`)
    }

    const page = await target.page()
    if (!page) {
      throw new Error(`操，找到了窗口但附加不到页面上。`)
    }

    // 后续逻辑不变...
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    )

    await page.goto(urlToScrape, { waitUntil: 'networkidle2' })
    const data = await page.evaluate(scrapingLogic)

    return data
  } catch (error) {
    console.error(`[Puppeteer Util] 爬取时发生错误:`, error)
    throw error
  } finally {
    if (browser) {
      browser.disconnect()
    }
  }
}

/**
 * 带有重试和超时的目标查找函数
 * 因为主进程创建窗口和 Puppeteer 发现它之间可能存在微小的延迟
 */
async function findTarget(browser: Browser, url: string) {
  const timeout = 5000 // 5秒超时
  const interval = 100 // 每100毫秒检查一次
  let elapsedTime = 0

  while (elapsedTime < timeout) {
    const targets = await browser.targets()
    const found = targets.find((t) => t.url() === url)
    if (found) {
      console.log(`[Puppeteer Util] 找到了目标! URL: ${url}`)
      return found
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
    elapsedTime += interval
  }
  return undefined
}
