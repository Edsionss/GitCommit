export const stockApi = {
  searchStokes: (query: string): Promise<any[]> => window.api.searchStokes(query),
  getStockInfoByCode: (code: string, name?: string): Promise<any[]> =>
    window.api.getStockInfoByCode(code, name)
}
