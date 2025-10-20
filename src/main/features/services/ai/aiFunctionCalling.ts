import { GoogleGenAI } from '@google/genai'
import { OpenAI } from 'openai'
import { Stream } from 'openai/streaming'
import type { ChatCompletionChunk } from 'openai/resources/chat/completions'
import type {
  AiConfig,
  ChatMessage,
  FunctionTool,
  FunctionCall,
  FunctionResponse
} from '@sharedType/ai'
import * as tools from './tools'

/**
 * @file AI Function Calling
 * @description Handles AI function calling capabilities for various AI providers.
 */

/**
 * Calls the OpenAI API with function calling support.
 *
 * @param params The parameters for calling OpenAI with tools.
 * @returns The generated text.
 */
export async function callOpenAIWithTools(params: {
  _: any
  prompt: string
  apiKey: string
  model?: string
  history?: ChatMessage[]
  isStream?: boolean
  tools?: FunctionTool[]
}): Promise<string> {
  const { _, prompt, apiKey, model = 'gpt-3.5-turbo', history = [], isStream = true, tools = [] } = params
  
  const client = new OpenAI({ apiKey })
  
  // 构建消息数组
  const messages = history.map((msg) => ({
    role: msg.sender === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }))
  messages.push({ role: 'user', content: prompt })
  
  // 构建工具定义
  const functionDefinitions = tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters
  }))
  
  try {
    // 第一次调用，获取可能的函数调用请求
    const response = await client.chat.completions.create({
      model,
      messages: messages as Array<any>,
      functions: functionDefinitions.length > 0 ? functionDefinitions : undefined,
      function_call: functionDefinitions.length > 0 ? 'auto' : undefined,
      temperature: 0.6,
      stream: false // 先不使用流式，以便处理函数调用
    })
    
    let finalResponse = response.choices[0]?.message?.content || ''
    const functionCall = response.choices[0]?.message?.function_call
    
    // 如果有函数调用，执行函数并再次调用API
    if (functionCall) {
      const functionName = functionCall.name
      const functionArgs = JSON.parse(functionCall.arguments || '{}')
      
      console.log(`AI requests to call function: ${functionName} with args:`, functionArgs)
      
      // 执行函数
      let functionResult
      if (tools[functionName]) {
        try {
          functionResult = await tools[functionName](functionArgs)
        } catch (error) {
          functionResult = { error: error instanceof Error ? error.message : String(error) }
        }
      } else {
        functionResult = { error: `Function ${functionName} not found` }
      }
      
      // 将函数调用和结果添加到消息历史
      messages.push({
        role: 'assistant',
        content: null,
        function_call: functionCall
      })
      messages.push({
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionResult)
      })
      
      // 第二次调用，获取包含函数执行结果的最终响应
      const secondResponse = await client.chat.completions.create({
        model,
        messages: messages as Array<any>,
        temperature: 0.6,
        stream: isStream
      })
      
      if (isStream) {
        let text = ''
        for await (const chunk of secondResponse as Stream<ChatCompletionChunk>) {
          const delta = chunk.choices[0]?.delta
          if (delta.content) {
            const content = delta.content
            text += content
            _.sender.send('ai:chatStream:chunk', content)
          }
        }
        return text
      } else {
        finalResponse = secondResponse.choices[0]?.message?.content || ''
      }
    }
    
    return finalResponse
  } catch (error) {
    console.error('OpenAI API with tools error:', error)
    throw error
  }
}

/**
 * Calls the Gemini API with function calling support.
 *
 * @param params The parameters for calling Gemini with tools.
 * @returns The generated text.
 */
export async function callGeminiWithTools(params: {
  _: any
  prompt: string
  apiKey: string
  model?: string
  history?: ChatMessage[]
  isStream?: boolean
  tools?: FunctionTool[]
}): Promise<string> {
  const { _, prompt, apiKey, model = 'gemini-pro', history = [], isStream = true, tools = [] } = params
  
  const client = new GoogleGenAI({ apiKey })
  
  // 构建消息历史
  let conversation = history.map((msg) => `${msg.sender}: ${msg.text}`).join('\n')
  conversation += `\nuser: ${prompt}`
  
  // 构建工具定义
  const toolDefinitions = tools.map(tool => ({
    functionDeclarations: [tool]
  }))
  
  try {
    // 创建模型实例，并绑定工具
    const modelInstance = client.getGenerativeModel({
      model,
      tools: toolDefinitions.length > 0 ? toolDefinitions : undefined
    })
    
    // 开始聊天
    const chat = modelInstance.startChat()
    
    // 发送消息并获取响应
    const result = await chat.sendMessage(conversation)
    let response = result.response
    
    // 循环处理函数调用
    while (response.functionCalls && response.functionCalls.length > 0) {
      const functionCalls = response.functionCalls
      
      // 并行执行所有函数调用
      const toolExecutionResults = await Promise.all(
        functionCalls.map(async (call) => {
          const { name, args } = call
          console.log(`AI requests to call function: ${name} with args:`, args)
          
          // 在这里查找并执行本地函数
          if (tools[name]) {
            try {
              const executionResult = await tools[name](args)
              return {
                functionResponse: {
                  name,
                  response: { result: executionResult }
                }
              }
            } catch (error) {
              return {
                functionResponse: {
                  name,
                  response: { error: error instanceof Error ? error.message : String(error) }
                }
              }
            }
          } else {
            return {
              functionResponse: {
                name,
                response: { error: `Function ${name} not found` }
              }
            }
          }
        })
      )
      
      // 将执行结果返回给 AI
      const nextResult = await chat.sendMessage(toolExecutionResults)
      response = nextResult.response
    }
    
    // 返回最终的文本分析结果
    return response.text()
  } catch (error) {
    console.error('Gemini API with tools error:', error)
    throw error
  }
}

/**
 * Calls the KiMi API with function calling support.
 *
 * @param params The parameters for calling KiMi with tools.
 * @returns The generated text.
 */
export async function callKiMiWithTools(params: {
  _: any
  prompt: string
  apiKey: string
  model?: string
  history?: ChatMessage[]
  isStream?: boolean
  tools?: FunctionTool[]
}): Promise<string> {
  const { _, prompt, apiKey, model = 'moonshot-v1-8k', history = [], isStream = true, tools = [] } = params
  
  const client = new OpenAI({ apiKey, baseURL: 'https://api.moonshot.cn/v1' })
  
  // 构建消息数组
  const messages = history.map((msg) => ({
    role: msg.sender === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }))
  messages.push({ role: 'user', content: prompt })
  
  // 构建工具定义
  const functionDefinitions = tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters
  }))
  
  try {
    // 第一次调用，获取可能的函数调用请求
    const response = await client.chat.completions.create({
      model,
      messages: messages as Array<any>,
      functions: functionDefinitions.length > 0 ? functionDefinitions : undefined,
      function_call: functionDefinitions.length > 0 ? 'auto' : undefined,
      temperature: 0.6,
      stream: false // 先不使用流式，以便处理函数调用
    })
    
    let finalResponse = response.choices[0]?.message?.content || ''
    const functionCall = response.choices[0]?.message?.function_call
    
    // 如果有函数调用，执行函数并再次调用API
    if (functionCall) {
      const functionName = functionCall.name
      const functionArgs = JSON.parse(functionCall.arguments || '{}')
      
      console.log(`AI requests to call function: ${functionName} with args:`, functionArgs)
      
      // 执行函数
      let functionResult
      if (tools[functionName]) {
        try {
          functionResult = await tools[functionName](functionArgs)
        } catch (error) {
          functionResult = { error: error instanceof Error ? error.message : String(error) }
        }
      } else {
        functionResult = { error: `Function ${functionName} not found` }
      }
      
      // 将函数调用和结果添加到消息历史
      messages.push({
        role: 'assistant',
        content: null,
        function_call: functionCall
      })
      messages.push({
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionResult)
      })
      
      // 第二次调用，获取包含函数执行结果的最终响应
      const secondResponse = await client.chat.completions.create({
        model,
        messages: messages as Array<any>,
        temperature: 0.6,
        stream: isStream
      })
      
      if (isStream) {
        let text = ''
        for await (const chunk of secondResponse as Stream<ChatCompletionChunk>) {
          const delta = chunk.choices[0]?.delta
          if (delta.content) {
            const content = delta.content
            text += content
            _.sender.send('ai:chatStream:chunk', content)
          }
        }
        return text
      } else {
        finalResponse = secondResponse.choices[0]?.message?.content || ''
      }
    }
    
    return finalResponse
  } catch (error) {
    console.error('KiMi API with tools error:', error)
    throw error
  }
}