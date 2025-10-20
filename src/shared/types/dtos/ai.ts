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
  isLoading?: boolean
  streaming?: boolean
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

export interface ChatSession {
  id: string
  name: string
  startTime: string
  messages: ChatMessage[]
}

// Function Calling 相关类型定义
export interface FunctionTool {
  name: string
  description: string
  parameters: {
    type: 'OBJECT'
    properties: Record<string, {
      type: string
      description: string
      enum?: string[]
    }>
    required: string[]
  }
}

export interface FunctionCall {
  name: string
  args: Record<string, any>
}

export interface FunctionResponse {
  functionResponse: {
    name: string
    response: {
      result: any
    }
  }
}

export interface GenerateChatResponseWithToolsParams {
  _: any
  prompt: string
  aiConfig: AiConfig
  history?: ChatMessage[]
  isStream?: boolean
  tools?: FunctionTool[]
}
