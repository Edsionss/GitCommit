export const webSocketApi = {
  getWsAddress: async (): Promise<string> => window.api.getWsAddress(),
  startWsServer: async (): Promise<void> => window.api.startWsServer(),
  scan: (port: number): Promise<{ success: boolean; ips?: string[]; error?: string }> => {
    return window.api.networkScan(port)
  }
}
