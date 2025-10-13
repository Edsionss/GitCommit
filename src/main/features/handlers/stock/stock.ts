import { sysLogger } from '@nodeUtils/sysLogger'
import { ipcMain } from 'electron'
// import { StockAnalysisService } from '@services/stock/stock'
import { StockFetchConfig } from '@sharedType/stock'
import { searchStock, getStockInfoByCode } from '@services/stock/index'
export function initializeStockHandlers() {
  // const stockService = new StockAnalysisService()

  ipcMain.handle('stock:search', async (_, query: string) => {
    try {
      return await searchStock(query)
    } catch (error) {
      sysLogger.error('Error searching stocks:', error)
      return [] // Return empty array on error
    }
  })

  ipcMain.handle('stock:getStockInfoByCode', async (_, code: string, name?: string) => {
    try {
      return await getStockInfoByCode(code, name)
    } catch (error) {
      sysLogger.error(`Error fetching advanced stock data for ${code}:`, error)
      return null // Return null on error
    }
  })

  // ipcMain.handle('stock:analyze', async (_, stockName: string) => {
  //   try {
  //     return await stockService.analyzeStock(stockName)
  //   } catch (error) {
  //     sysLogger.error(`Error analyzing stock ${stockName}:`, error)
  //     return null
  //   }
  // })
}
