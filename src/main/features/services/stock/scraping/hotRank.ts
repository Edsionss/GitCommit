//爬取同花顺热榜

import { executeScrapingTask } from '@services/puppeteer'
import { addIdsFast } from '@nodeUtils/index'
import { getLastTradingDay } from '@shared/utils/'
//爬取热榜基础方法
export const scrapingHotRank = async (typeText: string, scraping: (page) => {}) => {
  return await executeScrapingTask({
    beforeExecutionData: { typeText, scraping },
    isWriter: true,
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
          const tags: any[] = []
          let stockCode = ''
          if (tagBox && tagBox.length) {
            tagBox.forEach((child, index) => {
              if (index == 0) {
                stockCode = child.parentElement?.previousElementSibling?.textContent?.trim() || ''
              }
              tags.push(child?.nextSibling?.textContent?.trim())
            })
          }
          const hotspot = El?.querySelector('.hot_news_content')?.textContent.trim() || ''
          const summary = El?.querySelector('.analyse')?.textContent.trim() || ''
          result.push({
            ...rouw1Data,
            tags: JSON.stringify(tags),
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
          const tags: any[] = []
          let stockCode = ''
          if (tagBox && tagBox.length) {
            tagBox.forEach((child, index) => {
              if (index == 0) {
                stockCode = child.parentElement?.previousElementSibling?.textContent?.trim() || ''
              }
              tags.push(child?.nextSibling?.textContent?.trim())
            })
          }
          const hotspot = El?.querySelector('.hot_news_content')?.textContent.trim() || ''
          const summary = El?.querySelector('.analyse')?.textContent.trim() || ''
          result.push({
            ...rouw1Data,
            tags: JSON.stringify(tags),
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
          const tags: any[] = []
          let stockCode = ''
          if (tagBox && tagBox.length) {
            tagBox.forEach((child, index) => {
              tags.push(child?.textContent?.trim())
            })
          }
          const hotspot = El?.querySelector('.hot_news_content')?.textContent.trim() || ''
          const summary = El?.querySelector('.analyse')?.textContent.trim() || ''
          result.push({
            ...rouw1Data,
            tags: JSON.stringify(tags),
            hotspot,
            stockCode,
            priceChangePercentage: '',
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
  childSelector?: string,
  typeName?: string
) => {
  return await scrapingHotRank('板块', async (page) => {
    if (typeText) {
      await page.evaluate(() => {
        const btn = document.querySelector('[name="industry"]') as HTMLElement
        btn?.click()
      })
    }
    return await page.evaluate(
      (selector, childSelector, typeName) => {
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
            const tags: any[] = []
            let stockCode = ''
            if (tagBox && tagBox.length) {
              tagBox.forEach((child, index) => {
                tags.push(child?.textContent?.trim())
              })
            }
            const hotspot = El?.querySelector('.hot_news_content')?.textContent.trim() || ''
            const summary = El?.querySelector('.analyse')?.textContent.trim() || ''
            const tagListMap = [...new Set(tags)]
            result.push({
              ...rouw1Data,
              tags: JSON.stringify(tagListMap),
              hotspot,
              stockCode,
              summary,
              rankType: typeName || 'concept'
            })
          }
        }
        return result
      },
      selector,
      childSelector,
      typeName
    )
  })
}

//爬取热点行业
export const scrapingHotIndustry = async () => {
  return await scrapingHotConcept('行业板块', '#plate-container-industry', '.border', 'industry')
}

export const scrapingAllHotRank = async () => {
  try {
    // 使用 Promise.allSettled 并行执行所有任务
    const results = await Promise.allSettled([
      scrapingHotStock(),
      scrapingHotETF(),
      scrapingHotTopic(),
      scrapingHotConcept(),
      scrapingHotIndustry()
    ])

    // 处理结果：筛选成功的数据并记录失败的
    const successfulResults: any[] = []
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        // 如果成功，将结果添加到数组中
        // result.value 就是爬取到的数据数组，例如 hotStock
        successfulResults.push(...result.value)
      } else {
        // 如果失败，记录错误
        console.error(`爬取任务 ${index} 失败:`, result.reason)
      }
    })

    // 如果所有任务都失败了，可以提前返回或抛出错误
    if (successfulResults.length === 0) {
      throw new Error('所有热榜数据爬取失败')
    }

    const tradeDate = await getLastTradingDay()
    // 为每个成功的结果添加 ID
    const resultsWithIds = addIdsFast(successfulResults, 'hotRank', { tradeDate })

    return resultsWithIds
  } catch (error) {
    // 这里的 catch 现在主要捕获 allSettled 本身的错误（很少见）
    // 或者我们自己抛出的 '所有任务失败' 的错误
    console.error('处理热榜数据时发生严重错误:', error)
    throw error
  }
}
