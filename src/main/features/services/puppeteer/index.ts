// src/scraping-service.ts

import { BrowserWindow } from 'electron'
import { scrapeData } from './puppeteer'

import crypto from 'crypto' // 使用内置的 crypto 模块生成唯一 ID

export async function executeScrapingTask<T>(url: string, scrapingLogic: () => T): Promise<T> {
  const scrapeWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      /* ... */
    }
  })

  // 1. 生成一个绝对唯一的 URL 作为这个窗口的“身份证”
  const uniqueId = crypto.randomBytes(16).toString('hex')
  const targetUrl = `about:blank?target_id=${uniqueId}`

  try {
    // 2. 让窗口加载这个唯一的 URL
    // await scrapeWindow.loadURL('about:blank'); // 旧方法
    await scrapeWindow.loadURL(targetUrl) // 新的、可靠的方法

    console.log(`[Generic Service] cerate  window ，only URL: ${targetUrl}`)

    // 3. 将要爬取的 URL 和用于识别窗口的唯一 URL 都传给底层工具
    const data = await scrapeData<T>(url, scrapingLogic, {
      targetUrl: targetUrl // 把“身份证”传下去
    })

    return data
  } catch (error) {
    // ... 错误处理 ...
    throw error
  } finally {
    if (scrapeWindow && !scrapeWindow.isDestroyed()) {
      scrapeWindow.close()
    }
  }
}
