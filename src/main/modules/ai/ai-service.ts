import { GoogleGenAI } from '@google/genai'
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

/**
 * Generates a commit message using the configured AI provider.
 *
 * @param prompt The prompt to send to the AI.
 * @param aiConfig The AI configuration.
 * @returns The generated commit message.
 */
export async function generateCommitMessage(prompt: string, aiConfig: AiConfig): Promise<string> {
  if (!aiConfig.provider || !aiConfig.apiKey) {
    throw new Error('AI provider or API key is not configured.')
  }

  switch (aiConfig.provider) {
    case 'openai':
      return await callOpenAI(prompt, aiConfig.apiKey, aiConfig.model)
    // Add cases for other providers here
    case 'gemini':
      return await callGemini(prompt, aiConfig.apiKey, aiConfig.model)
    case 'kimi':
      return await callKimi(prompt, aiConfig.apiKey, aiConfig.model)
    case 'anthropic':
    case 'custom':
      throw new Error(`${aiConfig.provider} is not yet supported.`)
    default:
      throw new Error(`Unknown AI provider: ${aiConfig.provider}`)
  }
}

/**
 * Calls the OpenAI API.
 *
 * @param prompt The prompt to send.
 * @param apiKey The OpenAI API key.
 * @param model The model to use.
 * @returns The generated text.
 */
async function callOpenAI(
  prompt: string,
  apiKey: string,
  model = 'gpt-3.5-turbo'
): Promise<string> {
  const endpoint = 'https://api.openai.com/v1/chat/completions'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`OpenAI API request failed with status ${response.status}: ${errorBody}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

async function callGemini(prompt: string, apiKey: string, model = 'gemini-2.5-flash') {
  const client = new GoogleGenAI({ apiKey })
  const response = await client.models.generateContent({
    model,
    contents: prompt
  })
  return response.text as string
}

async function callKimi(prompt: string, apiKey: string, model = 'kimi-k2-0711-preview') {
  const client = new OpenAI({ apiKey, baseURL: 'https://api.moonshot.cn/v1' })
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6
  })
  return response.choices[0]?.message?.content || ''
}
