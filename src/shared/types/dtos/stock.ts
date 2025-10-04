// K线数据单元 (v-chart format)
export type KlineDataItem = [string, number, number, number, number, number] // [时间, 开, 高, 低, 收, 成交量]

// 技术指标
export interface TechnicalIndicators {
  [key: string]: any // Allow flexible keys like macd, rsi, etc.
  movingAverages?: {
    [key: string]: number[] // Allow flexible keys like ma5, ma10
  }
}

// 从前端wizard传来的配置
export interface StockFetchConfig {
  klineDays: number
  maLines: number[]
  indicators: string[]
  fetchNews: boolean
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

/**
 * @interface StockSectorCamelCase
 * @description 代表 stock_sectors 表中的一条记录 (使用驼峰命名法)
 */
export interface StockSectorCamelCase {
  /**
   * ID, 主键,
   */
  id: string

  /**
   * 板块名称 (Sector Name)
   */
  sectorName: string

  /**
   * 板块整体涨跌幅 (%)
   * @type {number | null}
   */
  changePercentage: number | null

  /**
   * 总成交量 (万手)
   * @type {number | null}
   */
  totalVolumeLots: number | null

  /**
   * 总成交额 (亿元)
   * @type {number | null}
   */
  totalTurnoverYuan: number | null

  /**
   * 净流入 (亿元)
   * @type {number | null}
   */
  netInflowYuan: number | null

  /**
   * 上涨家数
   * @type {number | null}
   */
  risingStocksCount: number | null

  /**
   * 下跌家数
   * @type {number | null}
   */
  fallingStocksCount: number | null

  /**
   * 均价
   * @type {number | null}
   */
  averagePrice: number | null

  /**
   * 领涨股名称
   * @type {string | null}
   */
  leadingStockName: string | null

  /**
   * 领涨股的最新价
   * @type {number | null}
   */
  leadingStockLatestPrice: number | null

  /**
   * 领涨股的涨跌幅 (%)
   * @type {number | null}
   */
  leadingStockChangePercentage: number | null

  /**
   * 记录创建时间 (ISO 8601 格式的字符串, e.g., '2023-10-27 10:00:00')
   */
  createdAt: string
}
