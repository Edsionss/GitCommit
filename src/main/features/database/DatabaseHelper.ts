// src/main/database/db-helper.ts

import type { Database, Statement, RunResult } from 'better-sqlite3'

// 定义一个通用的 where 条件对象类型
// 示例: { id: 5, status: 'active' } 会被转换成 "WHERE id = ? AND status = ?"
type WhereClause = Record<string, any>

export class DatabaseHelper {
  private db: Database

  constructor(databaseInstance: Database) {
    this.db = databaseInstance
  }

  /**
   * 将 JS 对象转换为 SQL 的 WHERE 子句和对应的参数数组
   * @param where - { key: value } 形式的对象
   * @returns { text: string, params: any[] }
   */
  private formatWhereClause(where: WhereClause): { text: string; params: any[] } {
    const keys = Object.keys(where)
    if (keys.length === 0) {
      return { text: '', params: [] }
    }
    const text = 'WHERE ' + keys.map((key) => `${key} = ?`).join(' AND ')
    const params = Object.values(where)
    return { text, params }
  }

  /**
   * 通用插入方法
   * @param tableName - 表名
   * @param data - 要插入的数据对象 { column: value }
   * @returns - { id: number } 返回新插入行的 ID
   */
  public insert(tableName: string, data: Record<string, any>): RunResult {
    const keys = Object.keys(data)
    const columns = keys.join(', ')
    const placeholders = keys.map(() => '?').join(', ')
    const values = Object.values(data)

    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`
    const stmt = this.db.prepare(sql)
    const info = stmt.run(values)

    return info
  }

  /**
   * 通用批量插入方法
   * @param tableName - 表名
   * @param dataArray - 要插入的数据对象 {{ column: value }...}
   * @returns - 每一条的执行结果都能拿到（含 changes 和 lastInsertRowid）
   */
  public insertMany(tableName: string, dataArray: Record<string, any>[]): RunResult[] {
    if (dataArray.length === 0) return []

    const keys = Object.keys(dataArray[0])
    const columns = keys.join(', ')
    const placeholders = keys.map(() => '?').join(', ')

    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`
    const stmt = this.db.prepare(sql)

    // 用事务保证效率和原子性
    // const insertManyTransaction = this.db.transaction((rows: Record<string, any>[]) => {
    //   return rows.map((row) => stmt.run(Object.values(row)))
    // })

    // return insertManyTransaction(dataArray)
    // 用你封装好的 transaction 来执行
    return this.transaction(() => {
      return dataArray.map((row) => stmt.run(Object.values(row)))
    })
  }

  /**
   * 通用查询方法（返回多条记录）
   * @param tableName - 表名
   * @param where - (可选) 查询条件对象
   * @param columns - (可选) 要查询的列，默认 '*'
   * @returns - 结果数组
   */
  // public find<T>(tableName: string, where: WhereClause = {}, columns: string = '*'): T[] {
  public find<T>(tableName: string, where: Partial<T> = {}, columns: string = '*'): T[] {
    const { text, params } = this.formatWhereClause(where)
    const sql = `SELECT ${columns} FROM ${tableName} ${text}`
    const stmt = this.db.prepare(sql)
    return stmt.all(params) as T[]
  }

  /**
   * 通用查询方法（返回单条记录）
   * @param tableName - 表名
   * @param where - (可选) 查询条件对象
   * @param columns - (可选) 要查询的列，默认 '*'
   * @returns - 单个结果对象或 null
   */
  // public findOne<T>(tableName: string, where: WhereClause = {}, columns: string = '*'): T | null {
  public findOne<T>(tableName: string, where: Partial<T> = {}, columns: string = '*'): T | null {
    const { text, params } = this.formatWhereClause(where)
    const sql = `SELECT ${columns} FROM ${tableName} ${text} LIMIT 1`
    const stmt = this.db.prepare(sql)
    const result = stmt.get(params) as T | undefined
    return result || null
  }

  /**
   * 通用更新方法
   * @param tableName - 表名
   * @param data - 要更新的数据 { column: value }
   * @param where - 更新条件
   * @returns - { changes: number } 影响的行数
   */
  public update<T>(
    tableName: string,
    // data: Record<string, any>,
    // where: WhereClause
    data: Partial<T>,
    where: Partial<T>
  ): { changes: number } {
    const dataKeys = Object.keys(data)
    if (dataKeys.length === 0) {
      return { changes: 0 } // 没有要更新的数据
    }

    const setClause = dataKeys.map((key) => `${key} = ?`).join(', ')
    const dataValues = Object.values(data)

    const { text: whereClause, params: whereValues } = this.formatWhereClause(where)
    if (!whereClause) {
      throw new Error('Update operation must have a WHERE clause.')
    }

    const sql = `UPDATE ${tableName} SET ${setClause} ${whereClause}`
    const stmt = this.db.prepare(sql)
    const info = stmt.run([...dataValues, ...whereValues])

    return { changes: info.changes }
  }

  /**
   * 通用删除方法
   * @param tableName - 表名
   * @param where - 删除条件
   * @returns - { changes: number } 影响的行数
   */
  public delete(tableName: string, where: WhereClause): { changes: number } {
    const { text, params } = this.formatWhereClause(where)
    if (!text) {
      throw new Error('Delete operation must have a WHERE clause.')
    }
    const sql = `DELETE FROM ${tableName} ${text}`
    const stmt = this.db.prepare(sql)
    const info = stmt.run(params)

    return { changes: info.changes }
  }

  /**
   * 清空指定表的所有数据 (类似 TRUNCATE)
   * @param tableName - 要清空的表名
   * @param options - (可选) 选项
   * @param options.resetAutoIncrement - (可选) 是否重置自增ID计数器。默认为 false。
   * @returns - { changes: number } 删除的行数
   */
  public clearTable(
    tableName: string,
    options: { resetAutoIncrement?: boolean } = { resetAutoIncrement: false }
  ): { changes: number } {
    // 使用事务来确保两个操作（删除数据和重置计数器）的原子性
    return this.transaction(() => {
      // 1. 删除表中的所有行
      const deleteSql = `DELETE FROM ${tableName}`
      const info = this.db.prepare(deleteSql).run()

      // 2. 如果需要，重置自增计数器
      // SQLite 将自增计数器存储在名为 `sqlite_sequence` 的内部表中
      if (options.resetAutoIncrement) {
        // 只有当有行被实际删除时，才可能有必要重置。
        // 即使表没有自增键，执行此操作也是安全的（它不会找到匹配的行）。
        const resetSql = `DELETE FROM sqlite_sequence WHERE name = ?`
        this.db.prepare(resetSql).run(tableName)
      }

      return { changes: info.changes }
    })
  }

  /**
   * 直接执行 SQL 查询（用于复杂查询）
   * @param sql - 完整的 SQL 语句
   * @param params - (可选) 参数
   * @returns - 结果数组
   */
  public query<T>(sql: string, params: any[] = []): T[] {
    return this.db.prepare(sql).all(params) as T[]
  }

  /**
   * 直接执行 SQL 操作（用于无返回值的操作）
   * @param sql - 完整的 SQL 语句
   * @param params - (可选) 参数
   * @returns - { changes: number } 影响的行数
   */
  public execute(sql: string, params: any[] = []): { changes: number } {
    const info = this.db.prepare(sql).run(params)
    return { changes: info.changes }
  }

  /**
   * 执行一个事务
   * @param callback - 包含所有数据库操作的回调函数
   */
  public transaction<T>(callback: () => T): T {
    const runTransaction = this.db.transaction(callback)
    return runTransaction()
  }
}
