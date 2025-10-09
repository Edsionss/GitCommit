export interface AiConfig {
  provider: 'openai' | 'gemini' | 'anthropic' | 'kimi' | 'custom' | null
  apiKey: string
  endpoint?: string
  model?: string
  enableAiHistory?: boolean
  enableAutoSave?: boolean
  enableStreaming?: boolean
}

export interface ChatMessage {
  sender: 'user' | 'ai'
  text: string
}

export interface GenerateCommitMessageParams {
  _: any
  prompt: string
  aiConfig: AiConfig
  isStream?: boolean
}

export interface GenerateChatResponseParams {
  _: any
  prompt: string
  aiConfig: AiConfig
  history?: ChatMessage[]
  isStream?: boolean
}

export interface CallOpenAIParams {
  _: any
  prompt: string
  apiKey: string
  model?: string
  history?: ChatMessage[]
  isStream?: boolean
}

export interface CallKiMiParams {
  _: any
  prompt: string
  apiKey: string
  model?: string
  history?: ChatMessage[]
  isStream?: boolean
}

export interface CallGeminiParams {
  _: any
  prompt: string
  apiKey: string
  model?: string
  history?: ChatMessage[]
  isStream?: boolean
}

export interface AiChatResponse {
  success: boolean
  message?: string
  error?: string
}
