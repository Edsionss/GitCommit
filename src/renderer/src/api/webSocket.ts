import type { DirectBroadcastPayload, ChatMessage } from '@sharedType/WebSocket'
export const webSocketApi = {
  getWsAddress: async (): Promise<string> => window.api.getWsAddress(),
  startWsServer: async (): Promise<void> => window.api.startWsServer(),
  scan: (port: number): Promise<{ success: boolean; ips?: string[]; error?: string }> => {
    return window.api.networkScan(port)
  },
  sendRoomBroadcast: (message: { text: string; nickname: string; token: string }): void =>
    window.api.sendRoomBroadcast(message),
  sendDirectBroadcast: (payload: DirectBroadcastPayload): void =>
    window.api.sendDirectBroadcast(payload),
  sendGlobalBroadcast: (payload: DirectBroadcastPayload): void =>
    window.api.sendGlobalBroadcast(payload),
  onDirectBroadcastReceived: (callback: (data: any) => void): (() => void) =>
    window.api.onDirectBroadcastReceived(callback)
}
