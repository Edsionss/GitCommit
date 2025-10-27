import { generateChatResponse } from './ai'
import { StockFunctionTool } from './functionCallingRepo/stock'
import type { GenerateChatResponseParams } from '@sharedType/ai'
export async function generateChatResponseWithFunctionCalling(params: GenerateChatResponseParams) {
  const response = await generateChatResponse({
    ...params,
    tools: params.tools || [...StockFunctionTool]
  })
  console.log(response)
}
