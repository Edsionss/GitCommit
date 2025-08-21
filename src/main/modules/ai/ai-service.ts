import { GoogleGenAI } from '@google/genai'
import { OpenAI } from 'openai'
import { Stream } from 'openai/streaming'
import type { ChatCompletionChunk } from 'openai/resources/chat/completions'
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
 * Generates a commit message using the configured AI provider.
 *
 * @param prompt The prompt to send to the AI.
 * @param aiConfig The AI configuration.
 * @returns The generated commit message.
 */
export async function generateCommitMessage(
  _,
  prompt: string,
  aiConfig: AiConfig,
  isStream: boolean
): Promise<string> {
  // For commit messages, we generally don't need history.
  // So we call the chat response function with an empty history.
  return generateChatResponse(_, prompt, aiConfig, [], isStream)
}

/**
 * Generates a commit message using the configured AI provider.
 *
 * @param prompt The prompt to send to the AI.
 * @param history The chat history.
 * @param aiConfig The AI configuration.
 * @returns The generated commit message.
 */
export async function generateChatResponse(
  _,
  prompt: string,
  aiConfig: AiConfig,
  history: ChatMessage[] = [],
  isStream: boolean = true
): Promise<string> {
  if (!aiConfig.provider || !aiConfig.apiKey) {
    throw new Error('AI provider or API key is not configured.')
  }

  switch (aiConfig.provider) {
    case 'openai':
      return await callOpenAI(_, prompt, aiConfig.apiKey, aiConfig.model, history, isStream)
    // Add cases for other providers here
    case 'gemini':
      return await callGemini(_, prompt, aiConfig.apiKey, aiConfig.model, history, isStream)
    case 'kimi':
      return await callKiMi(_, prompt, aiConfig.apiKey, aiConfig.model, history, isStream)
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
  _,
  prompt: string,
  apiKey: string,
  model = 'gpt-3.5-turbo',
  history: ChatMessage[] = [],
  isStream: boolean
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

async function callKiMi(
  _,
  prompt: string,
  apiKey: string,
  model = 'gpt-3.5-turbo',
  history: ChatMessage[] = [],
  isStream: boolean = true
): Promise<string> {
  const client = new OpenAI({ apiKey, baseURL: 'https://api.moonshot.cn/v1' })

  const messages = history.map((msg) => ({
    role: msg.sender === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }))
  messages.push({ role: 'user', content: prompt })

  const response = await client.chat.completions.create({
    model,
    messages: messages as Array<any>,
    temperature: 0.6,
    stream: isStream
  })
  if (isStream) {
    // streaming  流式传输
    let text = ''
    for await (const chunk of response as Stream<ChatCompletionChunk>) {
      // 在这里，每个 chunk 的结构都与之前的 completion 相似，但 message 字段被替换成了 delta 字段
      const delta = chunk.choices[0].delta // <-- message 字段被替换成了 delta 字段
      if (delta.content) {
        const content = delta.content
        text += content
        _.sender.send('ai:chatStream:chunk', content)
        // 我们在打印内容时，由于是流式输出，为了保证句子的连贯性，我们不人为地添加
        // 换行符，因此通过设置 end="" 来取消 print 自带的换行符。
      }
    }
    return text as string
  } else {
    return response?.choices[0]?.message?.content || ''
  }
}

async function callGemini(
  _,
  prompt: string,
  apiKey: string,
  model = 'gemini-2.5-flash',
  history: ChatMessage[] = [],
  isStream: boolean = true
) {
  let messages = history.map((m) => `${m.sender}: ${m.text}`).join('\n')
  messages += `${messages}\n user:${prompt}`
  const client = new GoogleGenAI({ apiKey })
  const response = await client.models.generateContentStream({
    model,
    contents: messages
  })
  if (isStream) {
    // streaming  流式传输
    let text = ''
    for await (const chunk of response) {
      text += chunk.text
      // setTimeout(() => {
      _.sender.send('ai:chatStream:chunk', chunk.text)
      // }, 1000)
    }
    return text as string
  } else {
    const response = await client.models.generateContent({
      model,
      contents: messages
    })
    return response.text as string
  }
}
