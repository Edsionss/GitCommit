import { generateChatResponse } from './ai'
import { FunctionTool, FunctionLibrary } from '@sharedType/ai'

import { FunctionRepo, FunctionLibraryRepo } from './functionCallingRepo/index'
import type { GenerateChatResponseParams } from '@sharedType/ai'
export async function generateChatResponseWithFunctionCalling(params: GenerateChatResponseParams) {
  const response = await generateChatResponse({
    ...params,
    tools: params.tools || [...FunctionRepo],
    streamFn: async (result) => {
      for await (const chunk of result) {
        const call = chunk.functionCalls?.[0]
        if (call) {
          console.log('函数名:', call.name)
          console.log('参数:', call.args)
          await executeFn({ ...call })
          // 函数名: get_stock_info
          // 参数: { stock_name: '亚太药业' }
        }
        // console.log('模型输出:', chunk)
      }
    }
  })
  // console.log(response)
  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionCall = response.functionCalls[0] // Assuming one function call
    console.log(`Function to call: ${functionCall.name}`)
    console.log(`Arguments: ${JSON.stringify(functionCall.args)}`)
    await executeFn({ ...functionCall })
  } else {
    console.log(response.text)
  }
}

export const executeFn = async ({
  name,
  args,
  fnRepo = FunctionLibraryRepo
}: {
  name: string
  args: any
  fnRepo: FunctionLibrary[]
}) => {
  const fn = fnRepo.filter((fn) => fn.name === name)[0]
  return await fn.paramsExecutor(args)
}
