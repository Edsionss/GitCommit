import { DatabaseHelper } from '@features/database/DatabaseHelper'
import { dbHelper } from '@features/database'
import type { StockHotRank, CreateStockHotRankDto } from '@sharedType/stockHotRank'
import type { RunResult } from 'better-sqlite3'

/**
 * 获取上一个交易日的 'YYYY-MM-DD' 格式字符串
 * 注意: 这是一个简化的实现，并未考虑法定节假日和周末。
 * 在生产环境中，应使用包含交易日历的库来获取准确的上一个交易日。
 * @returns {string} 'YYYY-MM-DD'
 */
function getPreviousTradeDate(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const year = yesterday.getFullYear()
  const month = String(yesterday.getMonth() + 1).padStart(2, '0')
  const day = String(yesterday.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 负责处理 stock_hot_rank 表所有数据库操作的服务层
 */
export class StockHotRankService {
  private dbHelper: DatabaseHelper
  private readonly tableName = 'stock_hot_rank'

  constructor() {
    this.dbHelper = dbHelper
  }

  /**
   * 新增一条热榜排名记录
   * @param data - 要插入的数据，符合 CreateStockHotRankDto 接口
   * @returns better-sqlite3 的 RunResult 对象
   */
  public insert(data: CreateStockHotRankDto): RunResult {
    return this.dbHelper.insert(this.tableName, data)
  }

  /**
   * 批量新增多条热榜排名记录 (使用事务)
   * @param dataArray - 包含多个记录对象的数组
   * @returns RunResult 对象数组
   */
  public insertMany(dataArray: CreateStockHotRankDto[]): RunResult[] {
    if (!dataArray || dataArray.length === 0) {
      return []
    }
    return this.dbHelper.insertMany(this.tableName, dataArray)
  }

  /**
   * 根据交易日期查询热榜数据
   * @param tradeDate - 交易日期 ('YYYY-MM-DD')。如果未提供，则默认查询上一个交易日的数据。
   * @returns 返回符合条件的 StockHotRank 对象数组
   */
  public findByTradeDate(tradeDate?: string): StockHotRank[] {
    const targetDate = tradeDate || getPreviousTradeDate()
    return this.dbHelper.find<StockHotRank>(this.tableName, { tradeDate: targetDate })
  }

  /**
   * 根据交易日期删除所有相关记录
   * @param tradeDate - 要删除数据的交易日期 ('YYYY-MM-DD')
   * @returns 返回包含变更行数的对象
   */
  public deleteByTradeDate(tradeDate: string): { changes: number } {
    if (!tradeDate) {
      throw new Error('删除操作必须提供交易日期 (tradeDate)。')
    }
    return this.dbHelper.delete(this.tableName, { tradeDate })
  }

  /**
   * 根据 ID 列表批量删除记录
   * @param ids - 要删除记录的 ID 数组
   * @returns 返回包含变更行数的对象
   */
  public deleteMany(ids: string[]): { changes: number } {
    if (!ids || ids.length === 0) {
      return { changes: 0 }
    }

    // 使用原生 SQL 和参数化查询来处理 IN 子句
    const placeholders = ids.map(() => '?').join(', ')
    const sql = `DELETE FROM "${this.tableName}" WHERE id IN (${placeholders})`

    return this.dbHelper.execute(sql, ids)
  }

  /**
   * 清空 stock_hot_rank 表的所有数据
   * @returns 返回包含变更行数的对象
   */
  public clearAll(): { changes: number } {
    // id 不是自增的，所以 resetAutoIncrement 选项不是必需的
    return this.dbHelper.clearTable(this.tableName, { resetAutoIncrement: false })
  }

  // ---- 附赠一些常用的方法 ----

  /**
   * 根据主键 ID 查找单条记录
   * @param id - 记录的唯一ID
   * @returns 返回单个 StockHotRank 对象或 null
   */
  public findById(id: string): StockHotRank | null {
    return this.dbHelper.findOne<StockHotRank>(this.tableName, { id })
  }

  /**
   * 更新一条记录
   * @param id - 要更新记录的ID
   * @param data - 要更新的字段 (驼峰式)
   * @returns 返回包含变更行数的对象
   */
  public update(id: string, data: Partial<CreateStockHotRankDto>): { changes: number } {
    return this.dbHelper.update(this.tableName, data, { id })
  }
}

export const stockHotRankService = new StockHotRankService()
