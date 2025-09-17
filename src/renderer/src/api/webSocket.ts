import type { DirectBroadcastPayload } from '@preload/index.d'

export const webSocketApi = {
  getWsAddress: async (): Promise<string> => window.api.getWsAddress(),
  startWsServer: async (): Promise<void> => window.api.startWsServer(),
  sendRoomBroadcast: (message: { text: string; nickname: string; token: string }): void =>
    window.api.sendRoomBroadcast(message),
  sendDirectBroadcast: (payload: DirectBroadcastPayload): void =>
    window.api.sendDirectBroadcast(payload),
  onDirectBroadcastReceived: (callback: (data: any) => void): (() => void) =>
    window.api.onDirectBroadcastReceived(callback)
}
