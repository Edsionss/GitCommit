import { executeScrapingTask } from '@services/puppeteer'
import { mergeColumnArrayList, scrapePaginatedTable, addIdsFast } from '@nodeUtils/index'
import { getLastTradingDay } from '@shared/utils/'
import { transformDataForDB } from '@services/stock/sectors'
//爬取同花顺行业排行表
export const scrapingThsIndustry = async () => {
  return executeScrapingTask({
    // isWriter: true,
    beforeExecution: async (page) => {
      const homeUrl = 'https://q.10jqka.com.cn/thshy/'
      // 设置一个较长的超时时间，并等待网络空闲
      await page.goto(homeUrl, { waitUntil: 'networkidle2', timeout: 60000 })
      console.log(`📄 正在访问首页: ${homeUrl}`)
      const allData: any[] = await scrapePaginatedTable({
        page,
        processPageDataCallback: (pageData: any[]) => {
          return pageData.map((item, index) => {
            if (item.title.includes('涨跌幅') && index > 2) {
              item.title = '领涨股' + item.title
            }
            return item
          })
        }
      })

      console.log(`🎉 抓取完成！共获得 ${allData.length} 条数据。`)
      const tradeDate = await getLastTradingDay()
      console.log(`📅 最近交易日: ${tradeDate}`)
      // return transformDataForDB(
      //   addIdsFast(mergeColumnArrayList(allData), 'thsIndustryId', { tradeDate })
      // )
      return addIdsFast(transformDataForDB(mergeColumnArrayList(allData)), 'thsIndustryId', {
        tradeDate
      })
    }
  })
}
