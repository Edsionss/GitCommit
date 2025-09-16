export const webSocketApi = {
  getWsAddress: async (): Promise<string> => window.api.getWsAddress(),
  startWsServer: async (): Promise<void> => window.api.startWsServer()
}
