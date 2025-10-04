// src/main/database/db-helper.ts

import type { Database, RunResult } from 'better-sqlite3'
// --> 转换: 导入我们的自动转换函数
import { autoTransformKeys } from '@nodeUtils/index' // 引入自动转换键的函数

// 定义一个通用的 where 条件对象类型
type WhereClause = Record<string, any>

export class DatabaseHelper {
  private db: Database

  constructor(databaseInstance: Database) {
    this.db = databaseInstance
  }

  /**
   * 将 JS 对象转换为 SQL 的 WHERE 子句。
   * (内部使用，自动处理命名转换)
   */
  private formatWhereClause(where: WhereClause): { text: string; params: any[] } {
    // --> 转换: 将传入的驼峰式 where 条件转换为数据库使用的下划线式
    const snakeCaseWhere = autoTransformKeys(where, 'snake')

    const keys = Object.keys(snakeCaseWhere)
    if (keys.length === 0) {
      return { text: '', params: [] }
    }
    const text = 'WHERE ' + keys.map((key) => `"${key}" = ?`).join(' AND ')
    const params = Object.values(snakeCaseWhere)
    return { text, params }
  }

  /**
   * 通用插入方法
   */
  public insert(tableName: string, data: Record<string, any>): RunResult {
    // --> 转换: 将传入的驼峰式 data 转换为下划线式
    const snakeCaseData = autoTransformKeys(data, 'snake')

    const keys = Object.keys(snakeCaseData)
    const columns = keys.map((key) => `"${key}"`).join(', ')
    const placeholders = keys.map(() => '?').join(', ')
    const values = Object.values(snakeCaseData)

    const sql = `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders})`
    const stmt = this.db.prepare(sql)
    const info = stmt.run(values)
    console.log(`[DB insert from table  ${tableName}] `)
    return info
  }

  /**
   * 通用批量插入方法
   */
  public insertMany(tableName: string, dataArray: Record<string, any>[]): RunResult[] {
    if (dataArray.length === 0) return []

    // --> 转换: 将传入的驼峰式 data 数组转换为下划线式
    const snakeCaseDataArray = autoTransformKeys(dataArray, 'snake')

    const keys = Object.keys(snakeCaseDataArray[0])
    const columns = keys.map((key) => `"${key}"`).join(', ')
    const placeholders = keys.map(() => '?').join(', ')

    const sql = `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders})`
    const stmt = this.db.prepare(sql)

    console.log(`[DB insertMany from table  ${tableName}] `)

    return this.transaction(() => {
      return snakeCaseDataArray.map((row) => stmt.run(Object.values(row)))
    })
  }

  /**
   * 通用查询方法（返回多条记录）
   */
  public find<T>(tableName: string, where: Partial<T> = {}, columns: string = '*'): T[] {
    // `formatWhereClause` 会自动处理 `where` 对象的转换
    const { text, params } = this.formatWhereClause(where as WhereClause)
    const sql = `SELECT ${columns} FROM "${tableName}" ${text}`
    const stmt = this.db.prepare(sql)
    const results = stmt.all(params)
    console.log(`[DB find from table  ${tableName}] `)

    // --> 转换: 将从数据库返回的下划线式结果转换为应用层使用的驼峰式
    return autoTransformKeys(results, 'camel') as T[]
  }

  /**
   * 通用查询方法（返回单条记录）
   */
  public findOne<T>(tableName: string, where: Partial<T> = {}, columns: string = '*'): T | null {
    // `formatWhereClause` 会自动处理 `where` 对象的转换
    const { text, params } = this.formatWhereClause(where as WhereClause)
    const sql = `SELECT ${columns} FROM "${tableName}" ${text} LIMIT 1`
    const stmt = this.db.prepare(sql)
    const result = stmt.get(params)
    console.log(`[DB findOne from table  ${tableName}] `)

    if (!result) {
      return null
    }

    // --> 转换: 将从数据库返回的下划线式结果转换为应用层使用的驼峰式
    return autoTransformKeys(result, 'camel') as T
  }

  /**
   * 通用更新方法
   */
  public update<T>(tableName: string, data: Partial<T>, where: Partial<T>): { changes: number } {
    // --> 转换: 将传入的驼峰式 data 转换为下划线式
    const snakeCaseData = autoTransformKeys(data, 'snake')

    const dataKeys = Object.keys(snakeCaseData)
    if (dataKeys.length === 0) {
      return { changes: 0 }
    }

    const setClause = dataKeys.map((key) => `"${key}" = ?`).join(', ')
    const dataValues = Object.values(snakeCaseData)

    // `formatWhereClause` 会自动处理 `where` 对象的转换
    const { text: whereClause, params: whereValues } = this.formatWhereClause(where as WhereClause)
    if (!whereClause) {
      throw new Error('Update operation must have a WHERE clause.')
    }

    const sql = `UPDATE "${tableName}" SET ${setClause} ${whereClause}`
    const stmt = this.db.prepare(sql)
    const info = stmt.run([...dataValues, ...whereValues])

    console.log(`[DB update from table  ${tableName}] `)
    return { changes: info.changes }
  }

  /**
   * 通用删除方法
   */
  public delete(tableName: string, where: WhereClause): { changes: number } {
    // `formatWhereClause` 会自动处理 `where` 对象的转换
    const { text, params } = this.formatWhereClause(where)
    if (!text) {
      throw new Error('Delete operation must have a WHERE clause.')
    }
    const sql = `DELETE FROM "${tableName}" ${text}`
    const stmt = this.db.prepare(sql)
    const info = stmt.run(params)

    console.log(`[DB delete from table  ${tableName}] `)
    return { changes: info.changes }
  }

  /**
   * 清空指定表的所有数据
   */
  public clearTable(
    tableName: string,
    options: { resetAutoIncrement?: boolean } = { resetAutoIncrement: false }
  ): { changes: number } {
    return this.transaction(() => {
      const deleteSql = `DELETE FROM "${tableName}"`
      const info = this.db.prepare(deleteSql).run()

      if (options.resetAutoIncrement) {
        const resetSql = `DELETE FROM sqlite_sequence WHERE name = ?`
        this.db.prepare(resetSql).run(tableName)
      }

      console.log(`[DB clearTable from table  ${tableName}] `)
      return { changes: info.changes }
    })
  }

  /**
   * 直接执行 SQL 查询（用于复杂查询）
   */
  public query<T>(sql: string, params: any[] = []): T[] {
    console.log(`[DB query] `)
    const results = this.db.prepare(sql).all(params)

    // --> 转换: 将原生查询返回的结果也转换为驼峰式
    return autoTransformKeys(results, 'camel') as T[]
  }

  /**
   * 直接执行 SQL 操作（用于无返回值的操作）
   */
  public execute(sql: string, params: any[] = []): { changes: number } {
    const info = this.db.prepare(sql).run(params)
    console.log(`[DB execute] `)
    return { changes: info.changes }
  }

  /**
   * 执行一个事务
   */
  public transaction<T>(callback: () => T): T {
    const runTransaction = this.db.transaction(callback)
    console.log(`[DB transaction] `)
    return runTransaction()
  }
}
