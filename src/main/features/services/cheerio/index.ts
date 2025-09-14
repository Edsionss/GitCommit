// src/main/scraping/cheerio.service.ts

import axios from 'axios'
import * as cheerio from 'cheerio'

/**
 * Cheerio 爬取核心服务
 * 负责获取页面HTML并加载到Cheerio实例中
 */
export class CheerioScrapingService {
  /**
   * 通过 URL 获取页面的 HTML 内容
   * @param url 目标页面的 URL
   * @returns 页面的 HTML 字符串
   */
  private async fetchHtml(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url, {
        headers: {
          // 模拟浏览器User-Agent，防止被一些网站拦截
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      return data
    } catch (error) {
      console.error(`[Service] Error fetching HTML from ${url}:`, error)
      throw new Error(`Failed to fetch HTML from ${url}`)
    }
  }

  /**
   * 通用的爬取方法
   * @param url 目标URL
   * @param selector 用于选取元素列表的CSS选择器
   * @param extractor 一个函数，定义了如何从单个元素中提取所需的数据
   * @returns 提取出的数据对象数组
   */
  public async scrape<T>(url: string, scrapingLogic: ($?: any) => T): Promise<any> {
    const html = await this.fetchHtml(url)
    const $ = cheerio.load(html)

    return scrapingLogic($)
  }
}
