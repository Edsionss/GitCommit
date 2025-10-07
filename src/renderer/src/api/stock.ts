export const stockApi = {
  //NewsAPI
  scrapeStockNews: (dateStr?: string, timeStr?: string) =>
    window.api.scrapeStockNews(dateStr, timeStr),
  getStockNews: (tradeDate: string) => window.api.getStockNews(tradeDate),
  cleanStockNews: () => window.api.cleanStockNews(),
  searchStokes: (query: string): Promise<any[]> => window.api.searchStokes(query),
  getStockInfoByCode: (code: string, name?: string): Promise<any[]> =>
    window.api.getStockInfoByCode(code, name)
}
