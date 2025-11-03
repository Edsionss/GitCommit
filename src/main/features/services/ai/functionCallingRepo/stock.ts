import { FunctionTool, FunctionLibrary } from '@sharedType/ai'
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
        start_date: {
          type: Type.STRING,
          description:
            'The input parameter is the start date, From the start date to the present news, and the input format is: 2025.09.30 星期六,the default is yesterday'
        },
        start_time: {
          type: Type.STRING,
          description:
            'The input parameter is the start time, From the start date to the present news, and the input format is: 15:00:00 ,the default is 15:00:00'
        }
      },
      required: []
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

export const StockFunctionLibrary: FunctionLibrary[] = [
  {
    name: 'get_stock_info',
    async paramsExecutor(params) {
      return await scrapingStockInfo(params?.stock_name)
    }
  },
  {
    name: 'get_market_news',
    async paramsExecutor(params) {
      return await telegraphTest(params?.start_date, params?.start_time)
    }
  },
  {
    name: 'market_hot_list',
    async paramsExecutor(params) {
      return await scrapingAllHotRank()
    }
  },
  {
    name: 'industry_sector_list',
    async paramsExecutor(params) {
      return await scrapingThsIndustry()
    }
  }
]
