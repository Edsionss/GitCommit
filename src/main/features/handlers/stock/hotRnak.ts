import { sysLogger } from '@nodeUtils/sysLogger'
import { ipcMain } from 'electron'
import { stockHotRankService } from '@features/services/stock/hotRank'
export function initializeHotRankHandlers() {
  ipcMain.handle('stock:scrape_all_hotRank', async (_) => {
    try {
      return await stockHotRankService.scrapeAndInsertAllHotRank()
    } catch (error) {
      sysLogger.error('Error scraping hotRank:', error)
      return [] // Return empty array on error
    }
  })
  ipcMain.handle('stock:get_all_hotRank', async (_, tradeDate?: string) => {
    try {
      return await stockHotRankService.findByTradeDateOrDefault(tradeDate)
    } catch (error) {
      sysLogger.error('Error get hotRank:', error)
      return [] // Return empty array on error
    }
  })
  ipcMain.handle('stock:clean_all_hotRank', async (_) => {
    try {
      return await stockHotRankService.clearAll()
    } catch (error) {
      sysLogger.error('Errorclean news:', error)
      return [] // Return empty array on error
    }
  })
}
