export const automaticallyFillApi = {
  writeWorkRepo: (data: any): Promise<string | any> => window.api.AutomaticallyFillWorkSheet(data)
}
