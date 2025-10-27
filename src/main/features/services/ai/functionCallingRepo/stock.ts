import { FunctionTool } from '@sharedType/ai'
import { Type } from '@google/genai'
export const StockFunctionTool: FunctionTool[] = [
  {
    name: 'get_stock_info',
    description: 'Get the stock information of a company',
    parameters: {
      type: Type.OBJECT,
      properties: {
        stock_name: {
          type: Type.STRING,
          description: 'The name of the stock'
        }
      },
      required: ['stock_name']
    }
  }
]
