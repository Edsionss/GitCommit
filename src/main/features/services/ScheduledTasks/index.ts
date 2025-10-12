import {
  ScheduledTaskDto,
  TaskExecutionLogDto,
  TaskValidationResult,
  CronDescriptionDto
} from '@sharedType/scheduledTasks'
import { dbHelper } from '@features/database'
import * as cron from 'node-cron'
import dayjs from 'dayjs'

/**
 * 定时任务服务类
 * 负责处理与定时任务相关的业务逻辑
 */
class ScheduledTasksService {
  private static readonly TABLE_NAME = 'scheduled_tasks'
  private static readonly LOGS_TABLE_NAME = 'task_execution_logs'

  /**
   * 创建新任务
   * @param task 任务信息
   * @returns 创建的任务ID
   */
  public createTask(task: ScheduledTaskDto): number {
    try {
      // 验证cron表达式
      if (!cron.validate(task.cronExpression)) {
        throw new Error(`Invalid cron expression: ${task.cronExpression}`)
      }

      // 计算下次执行时间
      const nextRunTime = this.calculateNextRunTime(task.cronExpression)

      // 插入任务记录
      const result = dbHelper.execute(
        `INSERT INTO ${ScheduledTasksService.TABLE_NAME} 
        (name, description, cron_expression, task_type, task_config, is_active, created_at, updated_at, next_run_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.name,
          task.description || null,
          task.cronExpression,
          task.taskType,
          JSON.stringify(task.taskConfig),
          task.isActive ? 1 : 0,
          dayjs().format('YYYY-MM-DD HH:mm:ss'),
          dayjs().format('YYYY-MM-DD HH:mm:ss'),
          nextRunTime ? dayjs(nextRunTime).format('YYYY-MM-DD HH:mm:ss') : null
        ]
      )

      const taskId = result.lastID || 0

      // 如果任务是激活状态，通知调度器
      if (task.isActive && taskId > 0) {
        // 这里可以添加事件通知或直接调用调度器
        console.log(`Task created and scheduled: ${task.name} (${taskId})`)
      }

      return taskId
    } catch (error) {
      console.error('Error creating scheduled task:', error)
      throw new Error(`创建定时任务失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 更新任务
   * @param id 任务ID
   * @param task 更新的任务信息
   * @returns 是否更新成功
   */
  public updateTask(id: number, task: Partial<ScheduledTaskDto>): boolean {
    try {
      // 验证cron表达式（如果提供）
      if (task.cronExpression && !cron.validate(task.cronExpression)) {
        throw new Error(`Invalid cron expression: ${task.cronExpression}`)
      }

      // 构建更新字段
      const updateFields: string[] = []
      const updateValues: any[] = []

      if (task.name !== undefined) {
        updateFields.push('name = ?')
        updateValues.push(task.name)
      }

      if (task.description !== undefined) {
        updateFields.push('description = ?')
        updateValues.push(task.description)
      }

      if (task.cronExpression !== undefined) {
        updateFields.push('cron_expression = ?')
        updateValues.push(task.cronExpression)

        // 如果cron表达式改变，重新计算下次执行时间
        const nextRunTime = this.calculateNextRunTime(task.cronExpression)
        updateFields.push('next_run_at = ?')
        updateValues.push(nextRunTime ? dayjs(nextRunTime).format('YYYY-MM-DD HH:mm:ss') : null)
      }

      if (task.taskType !== undefined) {
        updateFields.push('task_type = ?')
        updateValues.push(task.taskType)
      }

      if (task.taskConfig !== undefined) {
        updateFields.push('task_config = ?')
        updateValues.push(JSON.stringify(task.taskConfig))
      }

      if (task.isActive !== undefined) {
        updateFields.push('is_active = ?')
        updateValues.push(task.isActive ? 1 : 0)
      }

      // 添加更新时间
      updateFields.push('updated_at = ?')
      updateValues.push(dayjs().format('YYYY-MM-DD HH:mm:ss'))

      // 添加ID条件
      updateValues.push(id)

      // 执行更新
      const result = dbHelper.execute(
        `UPDATE ${ScheduledTasksService.TABLE_NAME} SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )

      return result.changes > 0
    } catch (error) {
      console.error('Error updating scheduled task:', error)
      throw new Error(`更新定时任务失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 删除任务
   * @param id 任务ID
   * @returns 是否删除成功
   */
  public deleteTask(id: number): boolean {
    try {
      const result = dbHelper.execute(
        `DELETE FROM ${ScheduledTasksService.TABLE_NAME} WHERE id = ?`,
        [id]
      )

      return result.changes > 0
    } catch (error) {
      console.error('Error deleting scheduled task:', error)
      throw new Error(`删除定时任务失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 根据ID获取任务
   * @param id 任务ID
   * @returns 任务信息
   */
  public getTaskById(id: number): ScheduledTaskDto | null {
    try {
      const result = dbHelper.query<any>(
        `SELECT * FROM ${ScheduledTasksService.TABLE_NAME} WHERE id = ?`,
        [id]
      )

      if (result.length === 0) {
        return null
      }

      const task = result[0]
      return this.mapDbRowToTaskDto(task)
    } catch (error) {
      console.error('Error fetching scheduled task by ID:', error)
      return null
    }
  }

  /**
   * 获取所有任务
   * @returns 任务列表
   */
  public getAllTasks(): ScheduledTaskDto[] {
    try {
      const result = dbHelper.query<any>(
        `SELECT * FROM ${ScheduledTasksService.TABLE_NAME} ORDER BY created_at DESC`
      )

      return result.map((row) => this.mapDbRowToTaskDto(row))
    } catch (error) {
      console.error('Error fetching all scheduled tasks:', error)
      return []
    }
  }

  /**
   * 获取所有激活的任务
   * @returns 激活的任务列表
   */
  public getActiveTasks(): ScheduledTaskDto[] {
    try {
      const result = dbHelper.query<any>(
        `SELECT * FROM ${ScheduledTasksService.TABLE_NAME} WHERE is_active = 1 ORDER BY created_at DESC`
      )

      return result.map((row) => this.mapDbRowToTaskDto(row))
    } catch (error) {
      console.error('Error fetching active scheduled tasks:', error)
      return []
    }
  }

  /**
   * 切换任务激活状态
   * @param id 任务ID
   * @returns 是否切换成功
   */
  public toggleTaskStatus(id: number): boolean {
    try {
      // 获取当前状态
      const task = this.getTaskById(id)
      if (!task) {
        throw new Error(`Task not found: ${id}`)
      }

      // 切换状态
      const newStatus = !task.isActive
      const result = dbHelper.execute(
        `UPDATE ${ScheduledTasksService.TABLE_NAME} SET is_active = ?, updated_at = ? WHERE id = ?`,
        [newStatus ? 1 : 0, dayjs().format('YYYY-MM-DD HH:mm:ss'), id]
      )

      return result.changes > 0
    } catch (error) {
      console.error('Error toggling task status:', error)
      throw new Error(`切换任务状态失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 更新任务最后执行时间
   * @param id 任务ID
   * @returns 是否更新成功
   */
  public updateTaskLastRunTime(id: number): boolean {
    try {
      const result = dbHelper.execute(
        `UPDATE ${ScheduledTasksService.TABLE_NAME} SET last_run_at = ?, updated_at = ? WHERE id = ?`,
        [dayjs().format('YYYY-MM-DD HH:mm:ss'), dayjs().format('YYYY-MM-DD HH:mm:ss'), id]
      )

      return result.changes > 0
    } catch (error) {
      console.error('Error updating task last run time:', error)
      return false
    }
  }

  /**
   * 更新任务下次执行时间
   * @param id 任务ID
   * @param nextRunTime 下次执行时间
   * @returns 是否更新成功
   */
  public updateTaskNextRunTime(id: number, nextRunTime: Date): boolean {
    try {
      const result = dbHelper.execute(
        `UPDATE ${ScheduledTasksService.TABLE_NAME} SET next_run_at = ?, updated_at = ? WHERE id = ?`,
        [
          dayjs(nextRunTime).format('YYYY-MM-DD HH:mm:ss'),
          dayjs().format('YYYY-MM-DD HH:mm:ss'),
          id
        ]
      )

      return result.changes > 0
    } catch (error) {
      console.error('Error updating task next run time:', error)
      return false
    }
  }

  /**
   * 获取任务执行日志
   * @param taskId 任务ID
   * @param page 页码
   * @param pageSize 每页大小
   * @returns 执行日志列表和总数
   */
  public getTaskExecutionLogs(
    taskId: number,
    page: number,
    pageSize: number
  ): { logs: TaskExecutionLogDto[]; total: number } {
    try {
      // 计算偏移量
      const offset = (page - 1) * pageSize

      // 查询总记录数
      const countResult = dbHelper.query<{ total: number }>(
        `SELECT COUNT(*) as total FROM ${ScheduledTasksService.LOGS_TABLE_NAME} WHERE task_id = ?`,
        [taskId]
      )
      const total = countResult.length > 0 ? countResult[0].total : 0

      // 分页查询执行日志
      const logsResult = dbHelper.query<any>(
        `SELECT * FROM ${ScheduledTasksService.LOGS_TABLE_NAME} WHERE task_id = ? ORDER BY start_time DESC LIMIT ? OFFSET ?`,
        [taskId, pageSize, offset]
      )

      const logs = logsResult.map((row) => this.mapDbRowToLogDto(row))

      return { logs, total }
    } catch (error) {
      console.error('Error fetching task execution logs:', error)
      return { logs: [], total: 0 }
    }
  }

  /**
   * 验证cron表达式
   * @param cronExpression cron表达式
   * @returns 验证结果
   */
  public validateCronExpression(cronExpression: string): TaskValidationResult {
    try {
      const isValid = cron.validate(cronExpression)

      if (!isValid) {
        return {
          isValid: false,
          errorMessage: 'Invalid cron expression'
        }
      }

      // 计算下次执行时间
      const nextRunTime = this.calculateNextRunTime(cronExpression)

      return {
        isValid: true,
        nextRunTime
      }
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * 获取常用cron表达式描述
   * @returns 常用cron表达式列表
   */
  public getCronDescriptions(): CronDescriptionDto[] {
    return [
      {
        expression: '0 * * * *',
        description: '每小时执行一次',
        example: '在每小时的第0分钟执行'
      },
      {
        expression: '0 0 * * *',
        description: '每天午夜执行一次',
        example: '在每天00:00执行'
      },
      {
        expression: '0 0 * * 0',
        description: '每周日午夜执行一次',
        example: '在每周日00:00执行'
      },
      {
        expression: '0 0 1 * *',
        description: '每月1日午夜执行一次',
        example: '在每月1日00:00执行'
      },
      {
        expression: '0 0 1 1 *',
        description: '每年1月1日午夜执行一次',
        example: '在每年1月1日00:00执行'
      },
      {
        expression: '0 6,12,18 * * *',
        description: '每天6点、12点、18点执行',
        example: '在每天06:00、12:00、18:00执行'
      },
      {
        expression: '0 9 * * 1-5',
        description: '工作日上午9点执行',
        example: '在周一至周五09:00执行'
      },
      {
        expression: '*/30 * * * *',
        description: '每30分钟执行一次',
        example: '在每小时的第0和30分钟执行'
      }
    ]
  }

  /**
   * 计算下次执行时间
   * @param cronExpression cron表达式
   * @returns 下次执行时间
   */
  private calculateNextRunTime(cronExpression: string): Date | null {
    try {
      // 这里可以使用cron-parser等库来精确计算下次执行时间
      // 为简化，这里使用一个简单的实现
      const now = new Date()
      const nextRun = new Date(now.getTime() + 60000) // 默认1分钟后
      return nextRun
    } catch (error) {
      console.error('Error calculating next run time:', error)
      return null
    }
  }

  /**
   * 将数据库行映射为任务DTO
   * @param row 数据库行
   * @returns 任务DTO
   */
  private mapDbRowToTaskDto(row: any): ScheduledTaskDto {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      cronExpression: row.cron_expression,
      taskType: row.task_type,
      taskConfig: row.task_config ? JSON.parse(row.task_config) : {},
      isActive: row.is_active === 1,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      lastRunAt: row.last_run_at ? new Date(row.last_run_at) : undefined,
      nextRunAt: row.next_run_at ? new Date(row.next_run_at) : undefined
    }
  }

  /**
   * 将数据库行映射为执行日志DTO
   * @param row 数据库行
   * @returns 执行日志DTO
   */
  private mapDbRowToLogDto(row: any): TaskExecutionLogDto {
    return {
      id: row.id,
      taskId: row.task_id,
      executionStatus: row.execution_status as 'success' | 'failed' | 'running',
      startTime: new Date(row.start_time),
      endTime: row.end_time ? new Date(row.end_time) : undefined,
      result: row.result ? JSON.parse(row.result) : undefined,
      errorMessage: row.error_message
    }
  }
}

// 导出服务实例
export const scheduledTasksService = new ScheduledTasksService()
