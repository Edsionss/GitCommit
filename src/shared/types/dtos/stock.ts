// K线数据单元
export interface KlineData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// 技术指标
export interface TechnicalIndicators {
  macd: any[] // 具体类型取决于库的返回
  kdj: any[]
  rsi: any
  boll: any[]
  movingAverages: { ma5: number[]; ma10: number[]; ma20: number[] }
}

// AI分析结果
export interface AnalysisResult {
  summaryDocument: string // 给AI的原始总结文档
  aiAnalysisReport: string // AI生成的分析报告
  context: any // 用于后续对话的上下文
}
