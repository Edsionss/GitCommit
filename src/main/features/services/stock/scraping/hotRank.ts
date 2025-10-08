//爬取同花顺热榜

import { executeScrapingTask } from '@services/puppeteer'

//爬取热榜基础方法
export const scrapingHotRank = async (typeText: string, scraping: (page) => {}) => {
  return await executeScrapingTask({
    beforeExecutionData: { typeText, scraping },
    beforeExecution: async (page, { typeText, scraping }) => {
      await page.goto(
        `https://eq.10jqka.com.cn/frontend/thsTopRank/index.html?client_userid=JnStB&back_source=hyperlink&share_hxapp=isc&fontzoom=no#/`,
        {
          waitUntil: 'networkidle2'
        }
      )
      page.click(`text/${typeText}`)
      await page.waitForResponse(
        (response) => response.url().includes('stat.10jqka.com') && response.status() === 200
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
      return await scraping(page)
    }
  })
}

//爬取热股
export const scrapingHotStock = async () => {
  return await scrapingHotRank('热股', (page) => {
    return page.evaluate(() => {
      const result: any[] = []
      const stock24HourHOtBox = document
        .querySelector('#stock-container-a')
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
          let stockCode = ''
          if (tagBox && tagBox.length) {
            tagBox.forEach((child, index) => {
              if (index == 0) {
                stockCode = child.parentElement?.previousElementSibling?.textContent?.trim() || ''
              }
              tagList.push(child?.nextSibling?.textContent?.trim())
            })
          }
          const hotspot = El?.querySelector('.hot_news_content')?.textContent.trim()
          const summary = El?.querySelector('.analyse')?.textContent.trim()
          result.push({
            ...rouw1Data,
            tagList,
            hotspot,
            stockCode,
            summary,
            rankType: 'stock'
          })
        }
      }
      return result
    })
  })
}
//爬取热点ETF
export const scrapingHotETF = async () => {
  return await scrapingHotRank('ETF', (page) => {
    return page.evaluate(() => {
      const result: any[] = []
      const stock24HourHOtBox = document.querySelector('#hot-etf')?.querySelectorAll('.pb-20')
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
          let stockCode = ''
          if (tagBox && tagBox.length) {
            tagBox.forEach((child, index) => {
              if (index == 0) {
                stockCode = child.parentElement?.previousElementSibling?.textContent?.trim() || ''
              }
              tagList.push(child?.nextSibling?.textContent?.trim())
            })
          }
          const hotspot = El?.querySelector('.hot_news_content')?.textContent.trim()
          const summary = El?.querySelector('.analyse')?.textContent.trim()
          result.push({
            ...rouw1Data,
            tagList,
            hotspot,
            stockCode,
            summary,
            rankType: 'ETF'
          })
        }
      }
      return result
    })
  })
}

//爬取热点话题
export const scrapingHotTopic = async () => {
  return await scrapingHotRank('热门', (page) => {
    return page.evaluate(() => {
      const result: any[] = []
      const stock24HourHOtBox = document.querySelector('#hot-topic')?.querySelectorAll('.pt-24')
      if (stock24HourHOtBox && stock24HourHOtBox.length) {
        for (const [index, El] of stock24HourHOtBox.entries()) {
          const row1 = El?.firstChild?.childNodes
          const row1Dict = {
            0: 'rank',
            1: 'stockName',
            2: 'hotnessScore'
          }
          const rouw1Data = {}
          row1?.forEach((child, index) => {
            rouw1Data[row1Dict[index]] = child.textContent?.trim()
          })
          const tagBox = El?.querySelectorAll('.tag')
          const tagList: any[] = []
          let stockCode = ''
          if (tagBox && tagBox.length) {
            tagBox.forEach((child, index) => {
              tagList.push(child?.textContent?.trim())
            })
          }
          const hotspot = El?.querySelector('.hot_news_content')?.textContent.trim()
          const summary = El?.querySelector('.analyse')?.textContent.trim()
          result.push({
            ...rouw1Data,
            tagList,
            hotspot,
            stockCode,
            summary,
            rankType: 'topic'
          })
        }
      }
      return result
    })
  })
}

//爬取热点概念板块
export const scrapingHotConcept = async (
  typeText?: string,
  selector?: string,
  childSelector?: string
) => {
  return await scrapingHotRank('板块', async (page) => {
    if (typeText) {
      console.log('cnm')
      await page.evaluate(() => {
        const btn = document.querySelector('[name="industry"]') as HTMLElement
        btn?.click()
      })
    }
    console.log('csnm')
    return await page.evaluate(
      (selector, childSelector) => {
        const result: any[] = []
        const stock24HourHOtBox = document
          .querySelector(selector || '#plate-container-concept')
          ?.firstElementChild?.querySelectorAll(childSelector || '.pb-24')
        if (stock24HourHOtBox && stock24HourHOtBox.length) {
          for (const [index, El] of stock24HourHOtBox.entries()) {
            const row1 = El?.firstChild?.childNodes
            const row1Dict = {
              0: 'rank',
              3: 'priceChangePercentage',
              4: 'hotnessScore'
            }
            const rouw1Data = {}
            row1?.forEach((child, index) => {
              if (index == 1) {
                rouw1Data['stockName'] = child?.firstChild?.textContent?.trim()
              } else if (index !== 2) {
                rouw1Data[row1Dict[index]] = child.textContent?.trim()
              }
            })
            const tagBox = El?.querySelectorAll('.tag')
            const tagList: any[] = []
            let stockCode = ''
            if (tagBox && tagBox.length) {
              tagBox.forEach((child, index) => {
                tagList.push(child?.textContent?.trim())
              })
            }
            const hotspot = El?.querySelector('.hot_news_content')?.textContent.trim()
            const summary = El?.querySelector('.analyse')?.textContent.trim()
            const tagListMap = [...new Set(tagList)]
            result.push({
              ...rouw1Data,
              tagList: tagListMap,
              hotspot,
              stockCode,
              summary,
              rankType: 'concept'
            })
          }
        }
        return result
      },
      selector,
      childSelector
    )
  })
}

//爬取热点行业
export const scrapingHotIndustry = async () => {
  return await scrapingHotConcept('行业板块', '#plate-container-industry', '.border')
}

export const scrapingAllHotRank = () => {}
