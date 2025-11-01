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
  },
  {
    name: 'get_market_info',
    description: 'Get the market information ',
    parameters: {
      type: Type.OBJECT,
      properties: {
        market_name: {
          type: Type.STRING,
          description: 'The time of the market '
        }
      },
      required: ['market_name']
    }
  },
  {
    name: 'market_hot_list',
    description: 'Get the market hot list ',
    parameters: {
      type: Type.OBJECT,
      properties: {
        market_name: {
          type: Type.STRING,
          description: 'The time of the market '
        }
      },
      required: ['market_name']
    }
  },
  {
    name: 'industry_sector_list',
    description: 'Get the market hot list ',
    parameters: {
      type: Type.OBJECT,
      properties: {
        market_name: {
          type: Type.STRING,
          description: 'The time of the market '
        }
      },
      required: ['market_name']
    }
  }
]
