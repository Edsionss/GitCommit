import { sysLogger } from '@nodeUtils/sysLogger'
import { executeScrapingTask } from '@services/puppeteer'
import { mergeColumnArrayList, scrapePaginatedTable } from '@nodeUtils/index'

//爬取同花顺个股资金前两页数据
export const scrapingThsStockFunds = async () => {
  return executeScrapingTask({
    beforeExecutionData: {},
    beforeExecution: async (page, {}) => {
      const homeUrl = 'https://data.10jqka.com.cn/funds/ggzjl/#refCountId=data_55f13c2c_254'
      // 设置一个较长的超时时间，并等待网络空闲
      await page.goto(homeUrl, { waitUntil: 'networkidle2', timeout: 60000 })
      sysLogger.log(`📄 正在访问首页: ${homeUrl}`)
      const allData: any[] = await scrapePaginatedTable({
        dataTableSelector: '#J-ajax-main .m-table',
        maxPages: 2,
        nextPageSelector: 'text/下一页',
        page
      })
      sysLogger.log(`🎉 抓取完成！共获得 ${allData.length} 条数据。`)
      return mergeColumnArrayList(allData)
    }
  })
}
