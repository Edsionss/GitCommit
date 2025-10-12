import {
  ScheduledTaskDto,
  TaskExecutionContext,
  TaskExecutionResult,
  SystemNotificationConfig,
  DataBackupConfig,
  DataCleanupConfig,
  CustomScriptConfig
} from '@sharedType/scheduledTasks'

import { Notification } from 'electron'
import { dbHelper } from '@features/database'
import * as fs from 'fs'
import * as path from 'path'

/**
 * 任务执行器类
 * 负责执行不同类型的定时任务
 */
class TaskExecutor {
  /**
   * 执行任务
   * @param task 要执行的任务
   * @param context 执行上下文
   * @returns 执行结果
   */
  public async executeTask(
    task: ScheduledTaskDto,
    context: TaskExecutionContext
  ): Promise<TaskExecutionResult> {
    const startTime = Date.now()

    try {
      let result: Record<string, any> = {}

      // 根据任务类型执行不同的逻辑
      switch (task.taskType) {
        case 'system_notification':
          result = await this.executeSystemNotification(task.taskConfig as SystemNotificationConfig)
          break

        case 'data_backup':
          result = await this.executeDataBackup(task.taskConfig as DataBackupConfig)
          break

        case 'data_cleanup':
          result = await this.executeDataCleanup(task.taskConfig as DataCleanupConfig)
          break

        case 'custom_script':
          result = await this.executeCustomScript(task.taskConfig as CustomScriptConfig, context)
          break

        default:
          throw new Error(`Unknown task type: ${task.taskType}`)
      }

      const executionTime = Date.now() - startTime
      return {
        success: true,
        result,
        executionTime
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
        executionTime
      }
    }
  }

  /**
   * 执行系统通知任务
   * @param config 通知配置
   * @returns 执行结果
   */
  private async executeSystemNotification(
    config: SystemNotificationConfig
  ): Promise<Record<string, any>> {
    try {
      // 创建并显示系统通知
      const notification = new Notification({
        title: config.title,
        body: config.message,
        icon: config.icon,
        urgency: config.urgency || 'normal'
      })

      notification.show()

      return {
        type: 'system_notification',
        title: config.title,
        message: config.message,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(
        `Failed to execute system notification: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * 执行数据备份任务
   * @param config 备份配置
   * @returns 执行结果
   */
  private async executeDataBackup(config: DataBackupConfig): Promise<Record<string, any>> {
    try {
      // 确保备份目录存在
      const backupDir = path.dirname(config.backupPath)
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }

      // 获取所有表名
      const tablesResult = dbHelper.query<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      )

      const tables = tablesResult.map((row) => row.name)
      const backupData: Record<string, any> = {}

      // 备份每个表的数据
      for (const tableName of tables) {
        // 检查是否在排除列表中
        if (config.excludeTables && config.excludeTables.includes(tableName)) {
          continue
        }

        // 如果指定了包含列表，只备份包含的表
        if (config.includeTables && !config.includeTables.includes(tableName)) {
          continue
        }

        // 获取表数据
        const tableData = dbHelper.query(`SELECT * FROM ${tableName}`)
        backupData[tableName] = tableData
      }

      // 写入备份文件
      const backupContent = JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          tables: backupData
        },
        null,
        2
      )

      fs.writeFileSync(config.backupPath, backupContent)

      return {
        type: 'data_backup',
        backupPath: config.backupPath,
        tablesCount: Object.keys(backupData).length,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(
        `Failed to execute data backup: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * 执行数据清理任务
   * @param config 清理配置
   * @returns 执行结果
   */
  private async executeDataCleanup(config: DataCleanupConfig): Promise<Record<string, any>> {
    try {
      // 计算截止日期
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays)

      // 构建清理条件
      let whereClause = `created_at < '${cutoffDate.toISOString()}'`
      if (config.condition) {
        whereClause += ` AND ${config.condition}`
      }

      // 执行清理操作
      const result = dbHelper.execute(`DELETE FROM ${config.targetTable} WHERE ${whereClause}`)

      return {
        type: 'data_cleanup',
        targetTable: config.targetTable,
        deletedRecords: result.changes,
        retentionDays: config.retentionDays,
        cutoffDate: cutoffDate.toISOString(),
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(
        `Failed to execute data cleanup: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * 执行自定义脚本任务
   * @param config 脚本配置
   * @param context 执行上下文
   * @returns 执行结果
   */
  private async executeCustomScript(
    config: CustomScriptConfig,
    context: TaskExecutionContext
  ): Promise<Record<string, any>> {
    try {
      // 创建安全的执行环境
      const sandbox = this.createSandbox(context, config.context || {})

      // 使用Function构造器执行脚本
      const scriptFunction = new Function(
        ...Object.keys(sandbox),
        `
        try {
          ${config.scriptCode}
          return { success: true, result: typeof result !== 'undefined' ? result : null };
        } catch (error) {
          return { success: false, error: error.message };
        }
        `
      )

      // 设置超时
      const timeout = config.timeout || 30000 // 默认30秒超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Script execution timeout')), timeout)
      })

      // 执行脚本
      const scriptPromise = Promise.resolve(scriptFunction(...Object.values(sandbox)))

      // 等待脚本执行完成或超时
      const scriptResult = (await Promise.race([scriptPromise, timeoutPromise])) as any

      if (!scriptResult.success) {
        throw new Error(scriptResult.error)
      }

      return {
        type: 'custom_script',
        result: scriptResult.result,
        executionTime: Date.now() - context.actualStartTime.getTime(),
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(
        `Failed to execute custom script: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * 创建安全的脚本执行沙箱
   * @param context 任务执行上下文
   * @param additionalContext 额外的上下文变量
   * @returns 沙箱对象
   */
  private createSandbox(
    context: TaskExecutionContext,
    additionalContext: Record<string, any>
  ): Record<string, any> {
    return {
      // 任务上下文
      taskId: context.taskId,
      taskName: context.taskName,
      taskType: context.taskType,
      executionId: context.executionId,
      scheduledTime: context.scheduledTime,
      actualStartTime: context.actualStartTime,

      // 工具函数
      console: {
        log: (...args: any[]) => console.log(`[Custom Script ${context.taskId}]`, ...args),
        error: (...args: any[]) => console.error(`[Custom Script ${context.taskId}]`, ...args),
        warn: (...args: any[]) => console.warn(`[Custom Script ${context.taskId}]`, ...args)
      },

      // 数据库访问（受限）
      db: {
        query: (sql: string, params?: any[]) => dbHelper.query(sql, params),
        execute: (sql: string, params?: any[]) => dbHelper.execute(sql, params)
      },

      // 工具库
      Date,
      Math,
      JSON,
      parseInt,
      parseFloat,

      // 额外的上下文变量
      ...additionalContext
    }
  }
}

// 导出单例实例
export const taskExecutor = new TaskExecutor()
