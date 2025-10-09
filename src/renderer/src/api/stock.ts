export const stockApi = {
  //NewsAPI
  scrapeStockNews: (dateStr?: string, timeStr?: string) =>
    window.api.scrapeStockNews(dateStr, timeStr),
  getStockNewsByTradeDate: (tradeDate: string) => window.api.getStockNewsByTradeDate(tradeDate),
  cleanStockNews: () => window.api.cleanStockNews(),

  //hotRankAPI
  scrapeAllHotRank: () => window.api.scrapeAllHotRank(),
  getStockAllHotRankByTradeDate: (tradeDate?: string) =>
    window.api.getStockAllHotRankByTradeDate(tradeDate),
  cleanStockAllHotRank: () => window.api.cleanStockAllHotRank(),

  //sector API
  scrapeStockSectors: () => window.api.scrapeStockSectors(),
  getStockSectorsByTradeDate: (tradeDate?: string) =>
    window.api.getStockSectorsByTradeDate(tradeDate),
  cleanStockSectors: () => window.api.cleanStockSectors(),

  //stockInfo API
  searchStokes: (query: string): Promise<any[]> => window.api.searchStokes(query),
  getStockInfoByCode: (code: string, name?: string): Promise<any[]> =>
    window.api.getStockInfoByCode(code, name)
}
