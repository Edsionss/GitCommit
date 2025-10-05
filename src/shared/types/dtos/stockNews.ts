/**
 * 市场快讯数据模型 (对应数据库 market_news 表)
 * 在应用层使用驼峰式命名 (camelCase)
 */
export interface StockNews {
  id: number
  newsTime: string // 快讯时间
  isImportant: number // 是否重要 (0: 否, 1: 是)
  title: string
  content: string
  source: string
  createdAt: string // 记录创建时间
}

/**
 * 市场快讯聚合查询的筛选条件
 */
export interface StockNewsQueryOptions {
  source?: string
  isImportant?: 0 | 1
  startTime?: string // 查询创建时间的开始范围 (格式: 'YYYY-MM-DD HH:MM:SS')
  endTime?: string // 查询创建时间的结束范围 (格式: 'YYYY-MM-DD HH:MM:SS')
}
