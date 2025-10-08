export const stockApi = {
  //NewsAPI
  scrapeStockNews: (dateStr?: string, timeStr?: string) =>
    window.api.scrapeStockNews(dateStr, timeStr),
  getStockNews: (tradeDate: string) => window.api.getStockNews(tradeDate),
  cleanStockNews: () => window.api.cleanStockNews(),

  //hotRankAPI
  scrapeAllHotRank: () => window.api.scrapeAllHotRank(),
  getStockAllHotRank: (tradeDate?: string) => window.api.getStockAllHotRank(tradeDate),
  cleanStockAllHotRank: () => window.api.cleanStockAllHotRank(),

  //stockInfo API
  searchStokes: (query: string): Promise<any[]> => window.api.searchStokes(query),
  getStockInfoByCode: (code: string, name?: string): Promise<any[]> =>
    window.api.getStockInfoByCode(code, name)
}
