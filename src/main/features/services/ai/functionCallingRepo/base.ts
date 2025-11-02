import { FunctionTool } from '@sharedType/ai'
import { Type } from '@google/genai'
import { getDateWithFormat } from '@nodeUtils/index'
export const BaseFunctionTool: FunctionTool[] = [
  {
    name: 'get_today_date',
    description: 'get today date example: 2023.05.01 星期一',
    parameters: {
      type: Type.STRING,
      properties: {
        daysAgo: {
          type: Type.NUMBER,
          description:
            'how many days ago from today,if you want to get yesterday, please set it to 1'
        }
      },
      required: []
    }
  }
]
export const functionLibrary = [
  {
    name: 'get_market_news',
    async paramsExecutor(params) {
      return getDateWithFormat(params?.daysAgo)
    }
  }
]
