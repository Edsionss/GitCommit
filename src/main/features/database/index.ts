// src/main/database/index.ts

import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import { DatabaseHelper } from './DatabaseHelper'
import { createTableSQL } from './TableDesign'

// 1. 创建唯一的数据库连接实例
const dbPath = path.join(app.getPath('userData'), 'CognitoOcean.db')
const db = new Database(dbPath, { verbose: console.log }) // 加上 verbose 方便调试

// 2. 初始化数据库表结构
function initializeDatabase() {
  try {
    db.exec(createTableSQL)
    console.log(`Database tables created or already exist at: ${dbPath}.`)
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

// 3. 创建并导出通用的 DatabaseHelper 实例
export const dbHelper = new DatabaseHelper(db)

// 4. 在应用启动时调用初始化
initializeDatabase()
