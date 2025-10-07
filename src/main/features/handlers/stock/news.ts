import { ipcMain } from 'electron'
import { stockNewsService } from '@services/stock/news'
import { telegraphTest } from '@services/stock/scraping/news'
export function initializeNewsHandlers() {
  ipcMain.handle('stock:scrape_news', async (_, dateStr?: string, timeStr?: string) => {
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
