import { executeScrapingTask } from '@services/puppeteer'
import { extractTableDataByColumn } from '@nodeUtils/index'
// 爬取东方财富 和同花顺  综合股票信息
export const scrapingStockInfo = async (stockName: string) => {
  return await executeScrapingTask({
    beforeExecutionData: { stockName: stockName, extractTableDataByColumn },
    beforeExecution: async (page, { stockName, extractTableDataByColumn }) => {
      let result: any
      await page.goto(`https://so.eastmoney.com/web/s?keyword=${stockName}`, {
        waitUntil: 'networkidle2'
      })
      const companyName = await page.evaluate(() => {
        return document.querySelector('.amodule .ib_title a span')?.textContent.trim()
      })

      await page.goto(`https://baike.eastmoney.com/item/${companyName}`, {
        waitUntil: 'networkidle2'
      })
      const dfcfData = await page.evaluate((stockName) => {
        let result: any
        try {
          const companyProfile = document.querySelector('.company_intro')?.textContent.trim()
          const infoListEl = document.querySelector('.basic_info_items')?.querySelectorAll('li')
          const infoList: any[] = []
          infoListEl?.forEach((el) => {
            const title = el.querySelector('.info')?.textContent.trim()
            const value = el.querySelector('.name')?.textContent.trim()
            infoList.push({
              title,
              value
            })
          })
          const coreTheme: any[] = []
          const coreThemeList = document
            .querySelector('#coretheme')
            ?.nextElementSibling?.querySelectorAll('.p_div ')
          coreThemeList?.forEach((El, index) => {
            const title = El.querySelector('font')?.textContent.trim()
            const value = El.querySelector('font')?.nextSibling?.textContent?.trim()
            coreTheme.push({ index: '要点' + (index + 1), title, value })
          })
          result = { companyProfile, infoList, coreTheme }
          return result
        } catch (error) {
          throw error
        }
      }, stockName)

      await page.goto(
        `https://www.iwencai.com/stockpick/search?tid=stockpick&qs=box_main_ths&w=${stockName}`,
        {
          waitUntil: 'networkidle0'
        }
      )
      const text = await page.$eval('.back-old-btn span', (el) => el.textContent?.trim() || '')
      if (text == '返回旧版') {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2' }), // 等待跳转
          page.click('.back-old-btn')
        ])
      }
      const folds = await page.$$('text/展开')
      for (const fold of folds) {
        await fold.click()
        await new Promise((r) => setTimeout(r, 500)) // 给点时间让页面展开
      }
      const thsData = await page.evaluate(
        (stockName, extractTableDataByColumn) => {
          try {
            const tableFn = new Function(
              'tableEl',
              `return (${extractTableDataByColumn})(tableEl);`
            )
            const productBox = document.querySelector('.sortCol')
            const productElList = productBox?.querySelectorAll('.fl')
            const productList: any = []
            const conceptBox = productBox?.nextElementSibling
            const conceptElList = conceptBox?.querySelectorAll('.fl')
            const conceptList: any = []
            productElList?.forEach((El) => {
              productList.push(El.querySelector('a')?.textContent.trim())
            })
            conceptElList?.forEach((El) => {
              conceptList.push(El.querySelector('a')?.textContent.trim())
            })
            const city = conceptBox?.nextElementSibling?.querySelector('a')?.textContent.trim()
            const industry = conceptBox?.nextElementSibling?.nextElementSibling
              ?.querySelector('a')
              ?.textContent.trim()
            let RecentImportantEvents: any[] = []
            const allCards = document.querySelectorAll('.zhuanti_block .block_con')
            allCards.forEach((card) => {
              const title = card
                .querySelector('.blockTitle .title_icon')
                ?.nextElementSibling?.textContent.trim()
              if (title === '近期重要事件') {
                RecentImportantEvents = tableFn(card?.querySelector('table') as HTMLTableElement)
              }
            })
            return {
              productList, // 产品
              conceptList, // 概念
              city, // 地域
              industry, // 行业
              RecentImportantEvents // 近期重要事件
            }
          } catch (error) {
            throw error
          }
        },
        stockName,
        extractTableDataByColumn.toString()
      )
      result = { ...dfcfData, ...thsData, companyName }
      return result
    },
    url: `https://www.iwencai.com/unifiedwap/result?tid=stockpick&qs=box_main_ths&w=${stockName}`,
    scrapingLogic: () => {
      const result: any[] = []
      const elementsBox: HTMLElement | null = document.querySelector('.jgy_sdk')
      if (!elementsBox) return
      const elements: HTMLElement[] = Array.from(elementsBox.querySelectorAll('.jgy_item_box'))
      elements.forEach((el) => {
        const titleEl: HTMLElement | null = el.querySelector('.title-content .title-text')
        const textContent: HTMLElement | null = el.querySelector('.jgy_txt ')
        if (!titleEl || !textContent) return
        const title = titleEl?.textContent.trim() || ''
        const content = textContent?.textContent.trim() || ''
        if (title == '牛叉诊股' || title == '简介和看点' || title == '龙虎榜分析') return
        result.push({
          title,
          content
        })
      })
      // 提取标签
      const tagContainer: HTMLElement | null = document.querySelector('.impression_list')
      if (tagContainer) {
        const tags: any[] = []
        const tagElements: NodeListOf<HTMLElement> = tagContainer.querySelectorAll('.list_item')
        tagElements.forEach((tagEl) => {
          const isGood = tagEl.classList.contains('good')
          tags.push({ value: tagEl.textContent.trim(), good: isGood })
        })
        result.push({ title: '标签', content: JSON.stringify(tags) })
      }
      //提取支撑和压力
      const supportResistanceContainer: HTMLElement | null =
        document.querySelector('.kline_markline')
      if (supportResistanceContainer) {
        result.push({ title: '支撑和压力', content: supportResistanceContainer.innerText.trim() })
      }

      return result
    }
  })
}
