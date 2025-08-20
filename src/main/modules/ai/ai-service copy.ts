import { GoogleGenAI, Content } from '@google/genai'
import { OpenAI } from 'openai'
/**
 * @file AI Service
 * @description Handles interactions with various AI providers.
 */
// Define a common interface for AI configuration that the frontend will pass
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

/**
 * Generates a chat response using the configured AI provider.
 *
 * @param prompt The prompt to send to the AI.
 * @param aiConfig The AI configuration.
 * @param history The chat history.
 * @returns The generated chat message.
 */
export async function generateChatResponse(
  prompt: string,
  aiConfig: AiConfig,
  history: ChatMessage[] = []
): Promise<string> {
  if (!aiConfig.provider || !aiConfig.apiKey) {
    throw new Error('AI provider or API key is not configured.')
  }

  switch (aiConfig.provider) {
    case 'openai':
      return await callOpenAI(prompt, aiConfig.apiKey, aiConfig.model, history)
    case 'gemini':
      return await callGemini(prompt, aiConfig.apiKey, aiConfig.model, history)
    case 'kimi':
      return await callKimi(prompt, aiConfig.apiKey, aiConfig.model, history)
    case 'anthropic':
    case 'custom':
      throw new Error(`${aiConfig.provider} is not yet supported.`)
    default:
      throw new Error(`Unknown AI provider: ${aiConfig.provider}`)
  }
}

/**
 * Generates a commit message using the configured AI provider.
 *
 * @param prompt The prompt to send to the AI.
 * @param aiConfig The AI configuration.
 * @returns The generated commit message.
 */
export async function generateCommitMessage(prompt: string, aiConfig: AiConfig): Promise<string> {
  // For commit messages, we generally don't need history.
  // So we call the chat response function with an empty history.
  return generateChatResponse(prompt, aiConfig, [])
}

/**
 * Calls the OpenAI API.
 *
 * @param prompt The prompt to send.
 * @param apiKey The OpenAI API key.
 * @param model The model to use.
 * @param history The chat history.
 * @returns The generated text.
 */
async function callOpenAI(
  prompt: string,
  apiKey: string,
  model = 'gpt-3.5-turbo',
  history: ChatMessage[] = []
): Promise<string> {
  const messages = history.map((msg) => ({
    role: msg.sender === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }))
  messages.push({ role: 'user', content: prompt })

  const endpoint = 'https://api.openai.com/v1/chat/completions'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages
    })
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`OpenAI API request failed with status ${response.status}: ${errorBody}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

async function callGemini(
  prompt: string,
  apiKey: string,
  model = 'gemini-2.5-flash',
  history: ChatMessage[] = []
): Promise<string> {
  const genAI = new GoogleGenAI({ apiKey })
  const geminiModel = genAI.getGenerativeModel({ model })

  const chat = geminiModel.startChat({
    history: history.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })),
    generationConfig: {
      maxOutputTokens: 2048
    }
  })

  const result = await chat.sendMessage(prompt)
  const response = await result.response
  return response.text()
}

async function callKimi(
  prompt: string,
  apiKey: string,
  model = 'moonshot-v1-8k',
  history: ChatMessage[] = []
): Promise<string> {
  const client = new OpenAI({ apiKey, baseURL: 'https://api.moonshot.cn/v1' })

  const messages = history.map((msg) => ({
    role: msg.sender === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }))
  messages.push({ role: 'user', content: prompt })

  const response = await client.chat.completions.create({
    model,
    messages: messages,
    temperature: 0.3
  })

  return response.choices[0]?.message?.content || ''
}
