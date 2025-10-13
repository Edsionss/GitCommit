import { sysLogger } from '@nodeUtils/sysLogger'
import { ipcMain } from 'electron'
import { stockSectorService } from '@features/services/stock/sectors'
export function initializeSectorHandlers() {
  ipcMain.handle('stock:scrape_sectors', async (_) => {
    try {
      return await stockSectorService.scrapeAndInsertSectors()
    } catch (error) {
      sysLogger.error('Error scraping sectors:', error)
      return [] // Return empty array on error
    }
  })
  ipcMain.handle('stock:get_sectors', async (_, tradeDate?: string) => {
    try {
      return await stockSectorService.findByTradeDateOrDefault(tradeDate)
    } catch (error) {
      sysLogger.error('Error get sectors:', error)
      return [] // Return empty array on error
    }
  })
  ipcMain.handle('stock:clean_sectors', async (_) => {
    try {
      return await stockSectorService.clearAllSectors()
    } catch (error) {
      sysLogger.error('Error clean sectors:', error)
      return [] // Return empty array on error
    }
  })
}
