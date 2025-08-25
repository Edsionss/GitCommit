// K线数据单元 (v-chart format)
export type KlineDataItem = [string, number, number, number, number, number]; // [时间, 开, 高, 低, 收, 成交量]

// 技术指标
export interface TechnicalIndicators {
  [key: string]: any; // Allow flexible keys like macd, rsi, etc.
  movingAverages?: {
      [key: string]: number[]; // Allow flexible keys like ma5, ma10
  }
}

// 从前端wizard传来的配置
export interface StockFetchConfig {
    klineDays: number;
    maLines: number[];
    indicators: string[];
    fetchNews: boolean;
}

// 完整的股票数据结构
export interface StockData {
  code: string
  name: string
  kline: KlineDataItem[]
  indicators: TechnicalIndicators
  news: string[]
  lastUpdateTime: string
  analysisHistory: { prompt: string; report: string; time: Date }[]
}


// AI分析结果
export interface AnalysisResult {
  summaryDocument: string // 给AI的原始总结文档
  aiAnalysisReport: string // AI生成的分析报告
  context: any // 用于后续对话的上下文
}
