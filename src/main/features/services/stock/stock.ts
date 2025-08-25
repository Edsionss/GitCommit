// stock-analysis.service.ts
import yahooFinance from 'yahoo-finance2'
import * as ti from 'technicalindicators'
import { AIService } from '../ai/ai-service' // 假设你的AI服务路径
import { KlineData, TechnicalIndicators, AnalysisResult } from '@sharedType/stock'

export class StockAnalysisService {
  private aiService: AIService

  constructor() {
    // 实例化或获取已有的AI服务实例
    this.aiService = new AIService()
  }

  // 主分析函数
  public async analyzeStock(stockName: string): Promise<AnalysisResult> {
    // 1. 获取股票代码 (此处简化，实际可能需要一个搜索接口)
    const stockCode = await this.getStockCode(stockName)
    if (!stockCode) throw new Error('无法找到该股票代码')

    // 2. 获取20日K线和量能数据
    const klineData = await this.fetchKLineData(stockCode, 40) // 获取更多数据以计算指标

    // 3. 计算技术指标
    const indicators = this.calculateIndicators(klineData)

    // 4. 获取新闻和公告 (此部分实现可能较复杂，可先用占位符)
    const news = '近期市场热点为人工智能领域，该公司发布了新的AI芯片公告...'

    // 5. 生成总结文档 (关键！)
    const summaryDocument = this.generateSummaryPrompt(
      stockCode,
      klineData.slice(-20),
      indicators,
      news
    )

    // 6. 调用AI进行分析
    const aiConfig = { provider: 'openai', model: 'gpt-4' } // 从用户配置中读取
    const aiAnalysisReport = await this.aiService.generateCommitMessage(summaryDocument, aiConfig) // 复用或新增一个通用方法

    return {
      summaryDocument,
      aiAnalysisReport,
      context: [
        // 初始上下文
        { role: 'user', content: summaryDocument },
        { role: 'assistant', content: aiAnalysisReport }
      ]
    }
  }

  // 后续问答函数
  public async queryAnalysis(
    context: any[],
    question: string
  ): Promise<{ answer: string; newContext: any[] }> {
    const newContext = [...context, { role: 'user', content: question }]
    const aiConfig = { provider: 'openai', model: 'gpt-4' } // 从用户配置中读取
    // ai-service需要支持传入上下文的对话功能
    const answer = await this.aiService.chatWithContext(newContext, aiConfig)

    return { answer, newContext: [...newContext, { role: 'assistant', content: answer }] }
  }

  private async getStockCode(name: string): Promise<string | null> {
    // 简单实现，例如：腾讯 -> 0700.HK
    if (name.includes('腾讯')) return '0700.HK'
    // 实际项目中，这里应该调用一个搜索API
    const searchResults = await yahooFinance.search(name)
    return searchResults.quotes[0]?.symbol || null
  }

  private async fetchKLineData(code: string, days: number): Promise<KlineData[]> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    const results = await yahooFinance.historical(code, {
      period1: startDate,
      period2: endDate
    })
    return results.map((r) => ({ ...r, date: r.date.toISOString().split('T')[0] }))
  }

  private calculateIndicators(data: KlineData[]): TechnicalIndicators {
    const closes = data.map((d) => d.close)
    const highs = data.map((d) => d.high)
    const lows = data.map((d) => d.low)

    const macd = new ti.MACD({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    }).getResult()
    // ... 计算 KDJ, RSI, BOLL 等

    return {
      macd: macd.slice(-20),
      // ... 其他指标
      movingAverages: {
        ma5: ti.SMA.calculate({ period: 5, values: closes }).slice(-20),
        ma10: ti.SMA.calculate({ period: 10, values: closes }).slice(-20),
        ma20: ti.SMA.calculate({ period: 20, values: closes }).slice(-20)
      }
    }
  }

  private generateSummaryPrompt(
    code: string,
    kline: KlineData[],
    indicators: TechnicalIndicators,
    news: string
  ): string {
    return `
      请基于以下信息，为股票 ${code} 生成一份详细的技术面和基本面结合的分析报告。

      **近期市场热点与新闻:**
      ${news}

      **最近20日K线数据:**
      ${JSON.stringify(kline, null, 2)}

      **核心技术指标:**
      - **MACD**: ${JSON.stringify(indicators.macd.slice(-5))}
      - **均线**: 最近一日 MA5: ${indicators.movingAverages.ma5.slice(-1)[0]}, MA10: ${indicators.movingAverages.ma10.slice(-1)[0]}, MA20: ${indicators.movingAverages.ma20.slice(-1)[0]}
      
      请从以下几个方面进行分析：
      1. 当前股价趋势和关键支撑/压力位。
      2. 量价关系分析。
      3. 基于技术指标（MACD、均线等）的买卖信号。
      4. 结合新闻和市场热点，判断其潜在影响。
      5. 给出综合性的投资建议（看涨、看跌、震荡）和风险提示。
    `
  }
}
