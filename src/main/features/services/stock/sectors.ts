import { sysLogger } from '@nodeUtils/sysLogger'
import { dbHelper } from '@features/database'
import { scrapingThsIndustry } from '@services/stock/scraping/sectors'
import { getLastTradingDay } from '@shared/utils'
import type { StockSectorCamelCase } from '@sharedType/stock'
import type { RunResult } from 'better-sqlite3'
/**
 * StockSectorCamelCase 对象的创建类型。
 * 在创建时，所有字段都是必需的，因为 ID 是手动生成的。
 */
type StockSectorCamelCaseCreationData = StockSectorCamelCase
/**
 * StockSectorCamelCasesService
 *
 * 负责处理 `stock_sectors` 表所有数据库操作的业务逻辑层。
 * 它封装了所有 SQL 查询，为上层应用提供清晰、易用的接口。
 */
export class StockSectorCamelCasesService {
  private readonly tableName = 'stock_sectors'

  /**
   * 构造函数
   *
   */

  /**
   * 批量新增板块数据。
   * @param sectors - 要插入的板块数据对象数组 (每个对象都必须包含一个唯一的 `id`)。
   * @returns better-sqlite3 的执行结果数组。
   */
  public insertMany(sectors: StockSectorCamelCaseCreationData[]) {
    if (!sectors || sectors.length === 0) {
      return []
    }
    return dbHelper.insertMany(this.tableName, sectors)
  }

  /**
   * 根据 ID 列表批量删除板块数据。
   * @param ids - 要删除的记录的 ID 字符串数组。
   * @returns 一个包含受影响行数的对象 { changes: number }。
   */
  public deleteSectorsByIds(ids: string[]): { changes: number } {
    if (!ids || ids.length === 0) {
      return { changes: 0 }
    }

    // 使用原生 SQL 的 IN 子句进行批量删除，这是最高效的方式。
    const placeholders = ids.map(() => '?').join(',')
    const sql = `DELETE FROM ${this.tableName} WHERE id IN (${placeholders})`
    return dbHelper.execute(sql, ids)
  }

  /**
   * 清空 `stock_sectors` 表的所有数据。
   * @returns 一个包含被删除行数的对象 { changes: number }。
   */
  public clearAllSectors() {
    // 由于主键 `id` 不是自增的，重置自增序列的操作在这里没有意义。
    return dbHelper.clearTable(this.tableName, { resetAutoIncrement: false })
  }

  /**
   * 抓取行业数据并插入数据库
   * @returns 插入结果
   */
  public async scrapeAndInsertSectors(): Promise<RunResult[]> {
    const sectorsData = await scrapingThsIndustry()
    return this.insertMany(sectorsData)
  }

  /**
   * 根据交易日期查询行业数据，如果没有提供交易日期则使用最近交易日
   * @param tradeDate - 交易日期，可选
   * @returns 符合条件的StockSectorCamelCase数组
   */
  public async findByTradeDateOrDefault(tradeDate?: string): Promise<StockSectorCamelCase[]> {
    if (!tradeDate) {
      tradeDate = await getLastTradingDay()
    }
    return this.findByTradeDate(tradeDate)
  }

  /**
   * 获取最新时间戳对应的一批板块数据。
   * 这对于获取最近一次同步或抓取的数据非常有用。
   * @returns 最新板块数据的数组。
   */
  public getLatestSectors(): StockSectorCamelCase[] {
    // 使用子查询找出最大的 created_at, 然后查询所有匹配该时间戳的记录。
    // 这种方式非常高效，只需一次数据库查询。
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE created_at = (SELECT MAX(created_at) FROM ${this.tableName})
    `
    return dbHelper.query<StockSectorCamelCase>(sql)
  }

  /**
   * 获取指定单个日期创建的所有板块数据。
   * @param dateString - 日期字符串，格式为 'YYYY-MM-DD'。
   * @returns 指定日期内的板块数据数组。
   */
  public getSectorsBySingleDate(dateString: string): StockSectorCamelCase[] {
    const { startTimestamp, endTimestamp } = this._getDateRangeForSingleDay(dateString)
    const sql = `SELECT * FROM ${this.tableName} WHERE created_at >= ? AND created_at <= ?`
    return dbHelper.query<StockSectorCamelCase>(sql, [startTimestamp, endTimestamp])
  }

  /**
   * 获取指定日期范围内（含起止日期）创建的所有板块数据。
   * @param startDateString - 开始日期字符串，格式为 'YYYY-MM-DD'。
   * @param endDateString - 结束日期字符串，格式为 'YYYY-MM-DD'。
   * @returns 日期范围内的板块数据数组。
   */
  public getSectorsByDateRange(
    startDateString: string,
    endDateString: string
  ): StockSectorCamelCase[] {
    const startObj = new Date(startDateString)
    startObj.setHours(0, 0, 0, 0)
    const startTimestamp = Math.floor(startObj.getTime() / 1000)

    const endObj = new Date(endDateString)
    endObj.setHours(23, 59, 59, 999)
    const endTimestamp = Math.floor(endObj.getTime() / 1000)

    const sql = `SELECT * FROM ${this.tableName} WHERE created_at >= ? AND created_at <= ?`
    return dbHelper.query<StockSectorCamelCase>(sql, [startTimestamp, endTimestamp])
  }

  /**
   * 根据主键 ID 查询单个板块数据。
   * @param id - 板块的 ID (字符串)。
   * @returns 单个板块数据对象；如果未找到，则返回 null。
   */
  public getSectorById(id: string): StockSectorCamelCase | null {
    return dbHelper.findOne<StockSectorCamelCase>(this.tableName, { id })
  }

  /**
   * 根据交易日期查询所有板块数据。
   * @param tradeDate - 交易日期字符串，格式为 'YYYY-MM-DD'。
   * @returns 该日期内所有板块数据的数组。
   */
  public findByTradeDate(tradeDate: string): StockSectorCamelCase[] {
    return dbHelper.find<StockSectorCamelCase>(this.tableName, { tradeDate })
  }

  /**
   * 根据板块名称查询所有匹配的板块数据。
   * @param name - 要查询的板块名称。
   * @returns 包含所有同名板块数据的数组，如果没找到则返回空数组。
   */
  public getSectorsByName(name: string): StockSectorCamelCase[] {
    return dbHelper.find<StockSectorCamelCase>(this.tableName, { sectorName: name })
  }

  /**
   * [私有方法] 将单个日期字符串转换为当天的开始和结束 Unix 时间戳。
   * @param dateString - 日期字符串，格式为 'YYYY-MM-DD'。
   * @returns 包含开始和结束时间戳的对象。
   */
  private _getDateRangeForSingleDay(dateString: string): {
    startTimestamp: number
    endTimestamp: number
  } {
    const date = new Date(dateString)

    // 设置为当天的开始时间 (00:00:00)
    date.setHours(0, 0, 0, 0)
    const startTimestamp = Math.floor(date.getTime() / 1000)

    // 设置为当天的结束时间 (23:59:59)
    date.setHours(23, 59, 59, 999)
    const endTimestamp = Math.floor(date.getTime() / 1000)

    return { startTimestamp, endTimestamp }
  }
}

/**
 * 将列式存储的原始数据转换为可以插入数据库的行式对象数组。
 * @param rawData - 从 API 或爬虫获取的原始数据数组
 * @returns - 一个对象数组，每个对象代表一行可以插入数据库的数据
 */
export function transformDataForDB(rawData: any[]): StockSectorCamelCase[] {
  // 步骤 1: 建立中文标题到驼峰命名字段的映射
  const titleToKeyMap: { [key: string]: keyof StockSectorCamelCase } = {
    板块: 'sectorName',
    '涨跌幅(%)': 'changePercentage',
    '总成交量（万手）': 'totalVolumeLots',
    '总成交额（亿元）': 'totalTurnoverYuan',
    '净流入（亿元）': 'netInflowYuan',
    上涨家数: 'risingStocksCount',
    下跌家数: 'fallingStocksCount',
    均价: 'averagePrice',
    领涨股: 'leadingStockName',
    最新价: 'leadingStockLatestPrice',
    '领涨股涨跌幅(%)': 'leadingStockChangePercentage',
    id: 'id'
    // 注意：领涨股的涨跌幅标题可能与板块的重复，这里假设它就是第二个'涨跌幅(%)'
    // 在实际应用中，您可能需要更可靠的方式来区分它们，例如顺序。
    // 如果无法区分，需要调整数据源或处理逻辑。
    // 为了示例，我们这里先忽略第二个涨跌幅，因为它不在您的接口定义中。
    // 如果需要，可以将其命名为 leadingStockChangePercentage
  }

  // 识别哪些字段应该是数字类型
  const numericKeys = new Set<keyof StockSectorCamelCase>([
    'changePercentage',
    'totalVolumeLots',
    'totalTurnoverYuan',
    'netInflowYuan',
    'risingStocksCount',
    'fallingStocksCount',
    'averagePrice',
    'leadingStockLatestPrice',
    'leadingStockChangePercentage'
  ])

  // 步骤 2: 解析数据并按列存储
  const columns: { [key: string]: (string | number)[] } = {}

  for (const item of rawData) {
    // 忽略我们不需要的'序号'列
    if (item.title === '序号') {
      continue
    }

    const key = titleToKeyMap[item.title]
    if (key) {
      try {
        columns[key] = JSON.parse(item.value)
      } catch (e) {
        sysLogger.error(`Error parsing JSON for title "${item.title}":`, e)
        return [] // 解析失败则返回空数组
      }
    }
  }

  // 步骤 3: 将列式数据转换为行式数据
  const results: StockSectorCamelCase[] = []

  // 确定总共有多少行数据（假设所有列的长度都相同）
  const numRows = columns.sectorName ? columns.sectorName.length : 0
  if (numRows === 0) {
    return [] // 如果没有数据行，直接返回
  }

  for (let i = 0; i < numRows; i++) {
    // 创建一个临时的行对象，这里使用 any 类型以方便动态赋值
    const rowObject: any = {}

    for (const key in columns) {
      const typedKey = key as keyof StockSectorCamelCase
      const rawValue = columns[typedKey][i]

      // 步骤 4: 处理数据类型
      if (numericKeys.has(typedKey)) {
        // 如果是数字字段，尝试转换
        const num = parseFloat(String(rawValue))
        // 如果转换结果不是一个数字 (比如 --)，则设为 null
        rowObject[typedKey] = isNaN(num) ? null : num
      } else {
        // 否则保持为字符串
        rowObject[typedKey] = rawValue
      }
    }
    results.push(rowObject as StockSectorCamelCase)
  }

  return results
}

export const stockSectorService = new StockSectorCamelCasesService()
