import { generateChatResponse } from './ai'
import { FunctionTool, FunctionLibrary, callParams } from '@sharedType/ai'
import { sendToFocusedWindow, sendToMainWindow } from '@nodeUtils/ipcSend'

import { FunctionRepo, FunctionLibraryRepo } from './functionCallingRepo/index'
import type { GenerateChatResponseParams } from '@sharedType/ai'
export async function generateChatResponseWithFunctionCalling(params: GenerateChatResponseParams) {
  const response = await generateChatResponse({
    ...params,
    tools: params.tools || [...FunctionRepo],
    streamFn: async ({ result, contents }) => {
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
  const { result: responseContent, contents: messages } = response
  if (responseContent.functionCalls && responseContent.functionCalls.length > 0) {
    const functionCall = responseContent.functionCalls[0] // Assuming one function call
    console.log(`Function to call: ${functionCall.name}`)
    console.log(`Arguments: ${JSON.stringify(functionCall.args)}`)
    await executeFn({ ...functionCall })
  } else {
    console.log(responseContent.text)
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

export const resultCalling = async ({
  result,
  call,
  response,
  contents,
  params
}: {
  result: any
  call: callParams
  response: any
  contents: any[]
  params: GenerateChatResponseParams
}) => {
  // Create a function response part
  const function_response_part = {
    name: call.name,
    response: { result }
  }
  // Append function call and result of the function execution to contents
  contents.push(response.candidates[0].content)
  contents.push({ role: 'user', parts: [{ functionResponse: function_response_part }] })

  // Get the final response from the model
  const finalResponse = await generateChatResponseWithFunctionCalling({
    ...params,
    contents,
    tools: params.tools || [...FunctionRepo],
    streamFn: async ({ result, contents }) => {
      console.log(result, contents)
      sendToMainWindow('ai:chatStream:chunk', result)
    }
  })
}
