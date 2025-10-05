// src/main/services/stock-news.service.ts
import { dbHelper } from '@features/database'
import { DatabaseHelper } from '@features/database/DatabaseHelper'
import type { StockNews, StockNewsQueryOptions } from '@sharedType/stockNews'
import type { RunResult } from 'better-sqlite3'

export class StockNewsService {
  private dbHelper: DatabaseHelper
  private readonly tableName = 'stock_news'

  constructor() {
    this.dbHelper = dbHelper
  }

  /**
   * 创建一条新的市场快讯 (单个插入)
   * @param newsData - 快讯数据，不包含 id 和 createdAt
   * @returns better-sqlite3 的 RunResult 对象
   */
  public createNews(newsData: Omit<StockNews, 'id' | 'createdAt'>): RunResult {
    return this.dbHelper.insert(this.tableName, newsData)
  }

  /**
   * [新增] 批量插入多条市场快讯
   * @param newsDataArray - 快讯数据对象的数组
   * @returns an array of better-sqlite3's RunResult objects, one for each row inserted.
   */
  public insertManyNews(newsDataArray: Omit<StockNews, 'id' | 'createdAt'>[]): RunResult[] {
    // dbHelper.insertMany 内部会处理空数组的情况，这里直接调用即可
    return this.dbHelper.insertMany(this.tableName, newsDataArray)
  }

  /**
   * 聚合查询方法：根据多种条件组合查询市场快讯
   * @param options - 查询条件对象
   * @returns 符合条件的快讯数组
   */
  public findByCriteria(options: StockNewsQueryOptions = {}): StockNews[] {
    const whereClauses: string[] = []
    const params: any[] = []

    // 字段名需要是数据库中的下划线式 (snake_case)
    if (options.source) {
      whereClauses.push('source = ?')
      params.push(options.source)
    }

    if (options.isImportant !== undefined) {
      whereClauses.push('is_important = ?')
      params.push(options.isImportant)
    }

    if (options.startTime) {
      whereClauses.push('created_at >= ?')
      params.push(options.startTime)
    }

    if (options.endTime) {
      whereClauses.push('created_at <= ?')
      params.push(options.endTime)
    }

    let sql = `SELECT * FROM "${this.tableName}"`
    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ')
    }
    sql += ' ORDER BY created_at DESC' // 默认按创建时间降序排序

    return this.dbHelper.query<StockNews>(sql, params)
  }

  /**
   * 根据来源查询快讯
   * @param source - 新闻来源
   * @returns 符合条件的快讯数组
   */
  public findBySource(source: string): StockNews[] {
    return this.findByCriteria({ source })
  }

  /**
   * 根据重要程度查询快讯
   * @param isImportant - 是否重要 (1: 是, 0: 否)
   * @returns 符合条件的快讯数组
   */
  public findByImportance(isImportant: 0 | 1): StockNews[] {
    return this.findByCriteria({ isImportant })
  }

  /**
   * 根据创建时间范围查询快讯
   * @param startTime - 开始时间 (e.g., '2023-01-01 00:00:00')
   * @param endTime - 结束时间 (e.g., '2023-01-31 23:59:59')
   * @returns 符合条件的快讯数组
   */
  public findByDateRange(startTime: string, endTime: string): StockNews[] {
    return this.findByCriteria({ startTime, endTime })
  }

  /**
   * 组合查询示例：根据重要程度和来源查询
   * @param isImportant - 是否重要 (1: 是, 0: 否)
   * @param source - 新闻来源
   * @returns 符合条件的快讯数组
   */
  public findByImportanceAndSource(isImportant: 0 | 1, source: string): StockNews[] {
    return this.findByCriteria({ isImportant, source })
  }

  /**
   * 清空市场快讯表中的所有数据，并重置自增ID
   * @returns 操作结果，包含变化的行数
   */
  public clearAllNews(): { changes: number } {
    return this.dbHelper.clearTable(this.tableName, { resetAutoIncrement: true })
  }
}
export const stockNewsService = new StockNewsService()
