import { ipcMain } from 'electron'
// import { StockAnalysisService } from '@services/stock/stock'
import { StockFetchConfig } from '@shared/types/dtos/stock'
import { searchStock } from '@services/stock/index'
export function initializeStockHandlers() {
  // const stockService = new StockAnalysisService()

  ipcMain.handle('stock:search', async (_, query: string) => {
    try {
      return await searchStock(query)
    } catch (error) {
      console.error('Error searching stocks:', error)
      return [] // Return empty array on error
    }
  })

  // ipcMain.handle('stock:fetch-advanced', async (_, code: string, config: StockFetchConfig) => {
  //   try {
  //     return await stockService.fetchStockDataWithOptions(code, config)
  //   } catch (error) {
  //     console.error(`Error fetching advanced stock data for ${code}:`, error)
  //     return null // Return null on error
  //   }
  // })

  // ipcMain.handle('stock:analyze', async (_, stockName: string) => {
  //   try {
  //     return await stockService.analyzeStock(stockName)
  //   } catch (error) {
  //     console.error(`Error analyzing stock ${stockName}:`, error)
  //     return null
  //   }
  // })
}
