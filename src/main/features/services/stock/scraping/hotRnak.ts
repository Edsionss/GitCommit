import { executeScrapingTask } from '@services/puppeteer'
import { extractTableDataByColumn } from '@nodeUtils/index'

export const scrapingHotRank = () => {
  return executeScrapingTask({
    debuggerMode: true,
    beforeExecution: async (page) => {
      let result: any
      await page.goto(
        `https://eq.10jqka.com.cn/frontend/thsTopRank/index.html?client_userid=JnStB&back_source=hyperlink&share_hxapp=isc&fontzoom=no#/`,
        {
          waitUntil: 'networkidle2'
        }
      )
      await page.evaluate(() => {
        const spans = document.querySelectorAll('#hot-stock .time-type span')
        const lastSpan = spans[spans.length - 1] as HTMLElement
        if (lastSpan) lastSpan?.click()
      })
      await page.waitForResponse(
        (response) => response.url().includes('stat.10jqka.com') && response.status() === 200
      )
      // 慢慢滚动页面
      await page.evaluate(async () => {
        let totalHeight = 0
        const distance = 400
        while (totalHeight < document.body.scrollHeight) {
          window.scrollBy(0, distance)
          totalHeight += distance
          await new Promise((r) => setTimeout(r, 500))
        }
      })
      return page.evaluate(() => {
        const result: any[] = []
        const stock24HourHOtBox = document
          .querySelector('.swiper-wrapper')
          ?.querySelector('#stock-container-a')
          ?.querySelectorAll('.pt-22')
        if (stock24HourHOtBox && stock24HourHOtBox.length) {
          for (const [index, El] of stock24HourHOtBox.entries()) {
            const row1 = El?.firstChild?.childNodes
            const row1Dict = {
              0: 'rank',
              1: 'stockName',
              2: 'priceChangePercentage',
              3: 'hotnessScore'
            }
            const rouw1Data = {}
            row1?.forEach((child, index) => {
              rouw1Data[row1Dict[index]] = child.textContent?.trim()
            })
            const tagBox = El?.querySelectorAll('.tabBorder')
            const tagList: any[] = []
            if (tagBox && tagBox.length) {
              tagBox.forEach((child, index) => {
                tagList.push(child?.nextSibling?.textContent?.trim())
              })
            }
            const hotspot = El?.querySelector('.hot_news_content')?.textContent.trim()
            const summary = El?.querySelector('.analyse')?.textContent.trim()
            result.push({
              ...rouw1Data,
              tagList,
              hotspot,
              summary,
              rankType: 'stock'
            })
          }
        }
        return result
      })
    }
  })
}
