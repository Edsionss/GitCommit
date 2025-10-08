import { ipcMain } from 'electron'
import { stockHotRankService } from '@features/services/stock/hotRank'
import * as scrapHotRank from '@services/stock/scraping/hotRank'

export function initializeHotRankHandlers() {
  ipcMain.handle('stock:scrape_all_hotRank', async (_, dateStr?: string, timeStr?: string) => {
    try {
      return await stockNewsService.insertMany(await telegraphTest(dateStr, timeStr))
    } catch (error) {
      console.error('Error scraping news:', error)
      return [] // Return empty array on error
    }
  })
  ipcMain.handle('stock:get_news', async (_, tradeDate: string) => {
    try {
      return await stockNewsService.findByTradeDate(tradeDate)
    } catch (error) {
      console.error('Error get news:', error)
      return [] // Return empty array on error
    }
  })
  ipcMain.handle('stock:clean_news', async (_) => {
    try {
      return await stockNewsService.clearAllNews()
    } catch (error) {
      console.error('Errorclean news:', error)
      return [] // Return empty array on error
    }
  })
}
