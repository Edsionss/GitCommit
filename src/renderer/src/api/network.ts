export const networkApi = {
  scan: (port: number): Promise<{ success: boolean; ips?: string[]; error?: string }> => {
    return window.api.networkScan(port)
  }
}
