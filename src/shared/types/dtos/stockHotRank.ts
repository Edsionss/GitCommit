/**
 * 对应于数据库 stock_hot_rank 表的完整实体接口
 */
export interface StockHotRank {
  id: string
  rank: number
  stockName: string
  tags: string | null
  hotspot: string | null
  priceChangePercentage: number | null
  hotnessScore: number | null
  summary: string | null
  stockCode: string | null
  rankType: string
  tradeDate: string // 格式: 'YYYY-MM-DD'
  createdAt: string // 格式: ISO 8601
}

/**
 * 用于创建新记录的数据传输对象 (DTO)
 * 省略了由数据库自动生成的 createdAt 字段
 */
export type CreateStockHotRankDto = Omit<StockHotRank, 'createdAt'>
