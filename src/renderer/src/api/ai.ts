import type { AiConfig, ChatMessage } from '@shared/types/dtos/ai'

export const aiApi = {
  aiChat: (
    prompt: string,
    config: AiConfig,
    history?: ChatMessage[],
    isStream?: boolean
  ): Promise<any> => window.api.aiChat(prompt, config, history, isStream),
  onChatStreamChunk: (callback: (chunk: string) => void) => {
    window.api.onChatStreamChunk(callback)
  }
}
