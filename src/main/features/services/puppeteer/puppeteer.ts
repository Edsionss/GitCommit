// puppeteer.ts
import puppeteer, { Browser, Page, Target } from 'puppeteer-core'

export interface PuppeteerServiceOptions {
  browserURL: string
}

class PuppeteerService {
  private browser: Browser | null = null
  private options: PuppeteerServiceOptions

  constructor(options: PuppeteerServiceOptions = { browserURL: 'http://localhost:9222' }) {
    this.options = options
  }

  /**
   * 连接到浏览器实例。如果已连接，则不执行任何操作。
   */
  public async connect(): Promise<void> {
    if (this.isConnected()) {
      console.log('[PuppeteerService] Already connected.')
      return
    }
    try {
      this.browser = await puppeteer.connect({ browserURL: this.options.browserURL })
      this.browser.on('disconnected', () => {
        console.log('[PuppeteerService] Browser disconnected.')
        this.browser = null
      })
      console.log('[PuppeteerService] Successfully connected to browser.')
    } catch (error) {
      console.error('[PuppeteerService] Failed to connect to browser:', error)
      this.browser = null // 确保状态正确
      throw error
    }
  }

  /**
   * 断开与浏览器的连接。
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected()) {
      return
    }
    await this.browser?.disconnect()
    this.browser = null
    console.log('[PuppeteerService] Disconnected from browser.')
  }

  /**
   * 检查是否已连接。
   */
  public isConnected(): boolean {
    return this.browser?.isConnected() ?? false
  }

  /**
   * 根据 URL 查找一个 Page 对象，带有重试和超时。
   * @param url 要查找的页面的 URL
   * @param timeout 超时时间（毫秒）
   * @returns Promise<Page>
   */
  public async findPageByUrl(url: string, timeout: number = 5000): Promise<Page> {
    if (!this.isConnected()) {
      throw new Error('Browser not connected. Call connect() first.')
    }

    const interval = 100
    let elapsedTime = 0

    while (elapsedTime < timeout) {
      const targets = await this.browser!.targets()

      const foundTarget = targets.find((t) => t.type() === 'page' && t.url() === url)

      if (foundTarget) {
        const page = await foundTarget.page()
        if (page) {
          console.log(`[PuppeteerService] Found page: ${url}`)
          return page
        }
      }

      await new Promise((resolve) => setTimeout(resolve, interval))
      elapsedTime += interval
    }

    throw new Error(`Timeout: Could not find page with URL "${url}" within ${timeout}ms.`)
  }
}

// 导出一个单例，方便在整个应用中使用
export const puppeteerService = new PuppeteerService()
