export interface AiConfig {
  provider: 'openai' | 'gemini' | 'anthropic' | 'kimi' | 'custom' | null
  apiKey: string
  endpoint?: string
  model?: string
}

export interface ChatMessage {
  sender: 'user' | 'ai'
  text: string
}
