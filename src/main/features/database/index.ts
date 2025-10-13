import { sysLogger } from '@nodeUtils/sysLogger'
import Database from 'better-sqlite3'
import { Database as SqliteDatabase } from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import { DatabaseHelper } from './DatabaseHelper'
import { schema } from './schema'
// 1. 创建唯一的数据库连接实例
const dbPath = path.join(app.getPath('userData'), 'CognitoOcean.db')
const db: SqliteDatabase = new Database(dbPath, {}) // 加上 verbose 方便调试
db.pragma('journal_mode = WAL') // 开启 WAL 模式 “读”和“写”可以并发进行，极大地减少了数据库锁定的问题。你可以在数据库连接初始化时，执行一条 pragma 指令来开启它：
// 2. 初始化数据库表结构
export function initializeDatabase() {
  try {
    db.exec(schema)
    sysLogger.log(`Database tables created or already exist at: ${dbPath}.`)
  } catch (error) {
    sysLogger.error('Error initializing database:', error)
  }
}

// 3. 创建并导出通用的 DatabaseHelper 实例
export const dbHelper: DatabaseHelper = new DatabaseHelper(db)
export { db, dbPath }
// 4. 在应用启动时调用初始化
// initializeDatabase()
