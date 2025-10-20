import type { AiConfig, ChatMessage } from '@sharedType/ai'

export const aiApi = {
  aiChat: (
    params: { prompt: string, aiConfig: AiConfig, history?: ChatMessage[], isStream?: boolean }
  ): Promise<any> => window.api.aiChat(params),
  onChatStreamChunk: (callback: (chunk: string) => void) => {
    window.api.onChatStreamChunk(callback)
  },
  aiChatWithTools: (
    params: { prompt: string, aiConfig: AiConfig, history?: ChatMessage[], isStream?: boolean, tools?: any[] }
  ): Promise<any> => window.api.aiChatWithTools(params)
}
