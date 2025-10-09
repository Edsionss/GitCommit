import { GoogleGenAI } from '@google/genai'
import { OpenAI } from 'openai'
import { Stream } from 'openai/streaming'
import type { ChatCompletionChunk } from 'openai/resources/chat/completions'
import type {
  AiConfig,
  ChatMessage,
  GenerateCommitMessageParams,
  GenerateChatResponseParams,
  CallOpenAIParams,
  CallKiMiParams,
  CallGeminiParams
} from '@sharedType/ai'
/**
 * @file AI Service
 * @description Handles interactions with various AI providers.
 */
// Define a common interface for AI configuration that the frontend will pass

/**
 * Generates a commit message using the configured AI provider.
 *
 * @param params The parameters for generating a commit message.
 * @returns The generated commit message.
 */
export async function generateCommitMessage(params: GenerateCommitMessageParams): Promise<string> {
  const { _, prompt, aiConfig, isStream } = params
  // For commit messages, we generally don't need history.
  // So we call the chat response function with an empty history.
  return generateChatResponse({ _, prompt, aiConfig, history: [], isStream })
}

/**
 * Generates a commit message using the configured AI provider.
 *
 * @param params The parameters for generating a chat response.
 * @returns The generated commit message.
 */
export async function generateChatResponse(params: GenerateChatResponseParams): Promise<string> {
  const { _, prompt, aiConfig, history = [], isStream = true } = params
  if (!aiConfig.provider || !aiConfig.apiKey) {
    throw new Error('AI provider or API key is not configured.')
  }

  switch (aiConfig.provider) {
    case 'openai':
      return await callOpenAI({
        _,
        prompt,
        apiKey: aiConfig.apiKey,
        model: aiConfig.model,
        history,
        isStream
      })
    case 'gemini':
      return await callGemini({
        _,
        prompt,
        apiKey: aiConfig.apiKey,
        model: aiConfig.model,
        history,
        isStream
      })
    case 'kimi':
      return await callKiMi({
        _,
        prompt,
        apiKey: aiConfig.apiKey,
        model: aiConfig.model,
        history,
        isStream
      })
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
 * @param params The parameters for calling OpenAI.
 * @returns The generated text.
 */
async function callOpenAI(params: CallOpenAIParams): Promise<string> {
  const { _, prompt, apiKey, model = 'gpt-3.5-turbo', history = [], isStream } = params
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

async function callKiMi(params: CallKiMiParams): Promise<string> {
  const { _, prompt, apiKey, model = 'gpt-3.5-turbo', history = [], isStream = true } = params
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
  if (isStream && _) {
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

async function callGemini(params: CallGeminiParams) {
  const { _, prompt, apiKey, model = 'gemini-2.5-flash', history = [], isStream = true } = params
  let messages = history.map((m) => `${m.sender}: ${m.text}`).join('\n')
  messages += `${messages}\n user:${prompt}`
  const client = new GoogleGenAI({ apiKey })
  const response = await client.models.generateContentStream({
    model,
    contents: messages
  })
  if (isStream && _) {
    // streaming  流式传输
    let text = ''
    for await (const chunk of response) {
      text += chunk.text
      _.sender.send('ai:chatStream:chunk', chunk.text)
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
