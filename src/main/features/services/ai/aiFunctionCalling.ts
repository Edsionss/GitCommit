import { generateChatResponse } from './ai'
import { StockFunctionTool } from './functionCallingRepo'
import type { GenerateChatResponseParams } from '@sharedType/ai'
export async function generateChatResponseWithFunctionCalling(params: GenerateChatResponseParams) {
  const response = await generateChatResponse({
    ...params,
    tools: params.tools || [...StockFunctionTool],
    streamFn: async (result) => {
      for await (const chunk of result) {
        const call = chunk.functionCalls?.[0]
        if (call) {
          console.log('函数名:', call.name)
          console.log('参数:', call.args)
          // 函数名: get_stock_info
          // 参数: { stock_name: '亚太药业' }
        }
        // console.log('模型输出:', chunk)
      }
    }
  })
}
