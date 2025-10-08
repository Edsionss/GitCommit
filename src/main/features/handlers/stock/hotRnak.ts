import { ipcMain } from 'electron'
import { stockHotRankService } from '@features/services/stock/hotRank'
import * as scrapHotRank from '@services/stock/scraping/hotRank'
import { getLastTradingDay } from '@shared/utils'

export function initializeHotRankHandlers() {
  ipcMain.handle('stock:scrape_all_hotRank', async (_) => {
    try {
      return await stockHotRankService.insertMany(await scrapHotRank.scrapingAllHotRank())
    } catch (error) {
      console.error('Error scraping hotRank:', error)
      return [] // Return empty array on error
    }
  })
  ipcMain.handle('stock:get_all_hotRank', async (_, tradeDate?: string) => {
    try {
      if (!tradeDate) {
        tradeDate = await getLastTradingDay()
      }
      return await stockHotRankService.findByTradeDate(tradeDate)
    } catch (error) {
      console.error('Error get hotRank:', error)
      return [] // Return empty array on error
    }
  })
  ipcMain.handle('stock:clean_all_hotRank', async (_) => {
    try {
      return await stockHotRankService.clearAll()
    } catch (error) {
      console.error('Errorclean news:', error)
      return [] // Return empty array on error
    }
  })
}
