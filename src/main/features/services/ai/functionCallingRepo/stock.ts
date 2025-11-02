import { FunctionTool } from '@sharedType/ai'
import { Type } from '@google/genai'
import { scrapingStockInfo } from '@services/stock/scraping/info'
import { scrapingAllHotRank } from '@services/stock/scraping/hotRank'
import { telegraphTest } from '@services/stock/scraping/news'
import { scrapingThsIndustry } from '@services/stock/scraping/sectors'
import { scrapingThsStockFunds } from '@services/stock/scraping/stockFunds'
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
    name: 'get_market_news',
    description: 'Get financial news and information',
    parameters: {
      type: Type.OBJECT,
      properties: {
        start_data: {
          type: Type.STRING,
          description:
            'The input parameter is the start time, From the start date to the present news, and the input format is: 2025.9.30'
        }
      },
      required: ['start_date']
    }
  },
  {
    name: 'market_hot_list',
    description: 'Get the market hot list ',
    parameters: {
      type: Type.OBJECT,
      properties: {
        start_data: {
          type: Type.STRING,
          description: 'Start trading date,if not params ,then return the latest trading data'
        },
        end_data: {
          type: Type.STRING,
          description: 'end trading date,if not params ,then return the latest trading data'
        }
      },
      required: []
    }
  },
  {
    name: 'industry_sector_list',
    description: 'Obtain the trading data of the industry sector',
    parameters: {
      type: Type.OBJECT,
      properties: {
        start_date: {
          type: Type.STRING,
          description: 'Start trading date,if not params ,then return the latest trading data'
        },
        end_date: {
          type: Type.STRING,
          description: 'end trading date,if not params ,then return the latest trading data'
        }
      },
      required: []
    }
  }
]

export const functionLibrary = [
  {
    name: 'get_stock_info',
    paramsExecutor(params) {}
  }
]
