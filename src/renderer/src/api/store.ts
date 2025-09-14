export const storeApi = {
  get: async (key: string): Promise<any> => window.api.storeGet(key),
  set: async (key: string, value: any): Promise<void> => window.api.storeSet(key, value),
  del: async (key: string): Promise<void> => window.api.storeDelete(key)
}
