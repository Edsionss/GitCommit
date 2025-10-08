import { executeScrapingTask } from '@services/puppeteer'
import dayjs from 'dayjs'
export const getLastTradingDay = async (type?: string) => {
  let { tradeData } = await executeScrapingTask({
    url: 'https://stock.10jqka.com.cn/fupan/',
    scrapingLogic: () => {
      return { tradeData: document.querySelector('#date_pick')?.textContent.trim() || 'error' }
    }
  })
  if (tradeData == 'error') return '获取失败'
  if (type == 'week') {
    tradeData = dayjs(tradeData).format('YYYY-MM-DD dddd')
  }
  return tradeData
}
