export const stockApi = {
  searchStokes: (query: string): Promise<any[]> => window.api.searchStokes(query)
}
