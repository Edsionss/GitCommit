import * as cron from 'node-cron'
import {
  ScheduledTaskDto,
  TaskExecutionLogDto,
  TaskExecutionContext
} from '@sharedType/scheduledTasks'
import { scheduledTasksService } from './index'
import { taskExecutor } from './executor'
import { dbHelper } from '@features/database'

/**
 * 任务调度器类
 * 负责管理和执行定时任务
 */
class TaskScheduler {
  private scheduledTasks: Map<number, cron.ScheduledTask> = new Map()
  private isInitialized: boolean = false

  /**
   * 初始化任务调度器
   * 从数据库加载所有激活的任务并开始调度
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // 获取所有激活的任务
      const activeTasks = scheduledTasksService.getActiveTasks()

      // 为每个任务创建调度
      for (const task of activeTasks) {
        this.scheduleTask(task)
      }

      this.isInitialized = true
      console.log(`Task scheduler initialized with ${activeTasks.length} active tasks`)
    } catch (error) {
      console.error('Failed to initialize task scheduler:', error)
      throw error
    }
  }

  /**
   * 调度单个任务
   * @param task 要调度的任务
   */
  public scheduleTask(task: ScheduledTaskDto): void {
    // 如果任务已经调度，先取消
    if (this.scheduledTasks.has(task.id!)) {
      this.unscheduleTask(task.id!)
    }

    try {
      // 验证cron表达式
      if (!cron.validate(task.cronExpression)) {
        throw new Error(`Invalid cron expression: ${task.cronExpression}`)
      }

      // 创建cron调度
      const cronTask = cron.schedule(
        task.cronExpression,
        () => {
          this.executeTask(task.id!)
        },
        {
          scheduled: false // 先不启动，稍后手动启动
        }
      )

      // 保存到调度任务映射
      this.scheduledTasks.set(task.id!, cronTask)

      // 如果任务是激活状态，开始调度
      if (task.isActive) {
        cronTask.start()
        console.log(`Task scheduled: ${task.name} (${task.id}) with cron: ${task.cronExpression}`)
      }
    } catch (error) {
      console.error(`Failed to schedule task ${task.name} (${task.id}):`, error)
      throw error
    }
  }

  /**
   * 取消调度单个任务
   * @param taskId 任务ID
   */
  public unscheduleTask(taskId: number): void {
    const cronTask = this.scheduledTasks.get(taskId)
    if (cronTask) {
      cronTask.stop()
      this.scheduledTasks.delete(taskId)
      console.log(`Task unscheduled: ${taskId}`)
    }
  }

  /**
   * 立即执行指定任务
   * @param taskId 任务ID
   */
  public async executeTask(taskId: number): Promise<void> {
    try {
      // 获取任务信息
      const task = scheduledTasksService.getTaskById(taskId)
      if (!task) {
        throw new Error(`Task not found: ${taskId}`)
      }

      // 创建执行日志记录
      const executionId = this.createExecutionLog(taskId, 'running')

      // 更新任务最后执行时间
      scheduledTasksService.updateTaskLastRunTime(taskId)

      // 创建执行上下文
      const context: TaskExecutionContext = {
        taskId: task.id!,
        taskName: task.name,
        taskType: task.taskType,
        executionId,
        scheduledTime: new Date(),
        actualStartTime: new Date()
      }

      console.log(`Executing task: ${task.name} (${taskId})`)

      try {
        // 执行任务
        const result = await taskExecutor.executeTask(task, context)

        // 更新执行日志为成功
        this.updateExecutionLog(executionId, 'success', result.result, undefined)

        // 计算下次执行时间并更新
        const nextRunTime = this.calculateNextRunTime(task.cronExpression)
        scheduledTasksService.updateTaskNextRunTime(taskId, nextRunTime)

        console.log(`Task executed successfully: ${task.name} (${taskId})`)
      } catch (error) {
        // 更新执行日志为失败
        const errorMessage = error instanceof Error ? error.message : String(error)
        this.updateExecutionLog(executionId, 'failed', undefined, errorMessage)

        console.error(`Task execution failed: ${task.name} (${taskId}):`, error)
      }
    } catch (error) {
      console.error(`Failed to execute task ${taskId}:`, error)
    }
  }

  /**
   * 创建任务执行日志
   * @param taskId 任务ID
   * @param status 执行状态
   * @returns 执行日志ID
   */
  private createExecutionLog(taskId: number, status: string): number {
    const result = dbHelper.execute(
      `INSERT INTO task_execution_logs (task_id, execution_status, start_time) VALUES (?, ?, ?)`,
      [taskId, status, new Date().toISOString()]
    )

    return result.lastID || 0
  }

  /**
   * 更新任务执行日志
   * @param executionId 执行日志ID
   * @param status 执行状态
   * @param result 执行结果
   * @param errorMessage 错误消息
   */
  private updateExecutionLog(
    executionId: number,
    status: string,
    result?: Record<string, any>,
    errorMessage?: string
  ): void {
    dbHelper.execute(
      `UPDATE task_execution_logs SET execution_status = ?, end_time = ?, result = ?, error_message = ? WHERE id = ?`,
      [
        status,
        new Date().toISOString(),
        result ? JSON.stringify(result) : null,
        errorMessage || null,
        executionId
      ]
    )
  }

  /**
   * 计算下次执行时间
   * @param cronExpression cron表达式
   * @returns 下次执行时间
   */
  private calculateNextRunTime(cronExpression: string): Date {
    // 这里可以使用cron-parser等库来精确计算下次执行时间
    // 为简化，这里使用一个简单的实现
    const now = new Date()
    const nextRun = new Date(now.getTime() + 60000) // 默认1分钟后
    return nextRun
  }

  /**
   * 重新加载所有任务
   * 取消当前所有任务调度，然后重新加载并调度所有激活的任务
   */
  public async reloadAllTasks(): Promise<void> {
    // 停止所有当前任务
    for (const [taskId] of this.scheduledTasks) {
      this.unscheduleTask(taskId)
    }

    // 重新初始化
    this.isInitialized = false
    await this.initialize()
  }

  /**
   * 获取所有已调度任务的状态
   * @returns 任务状态列表
   */
  public getScheduledTasksStatus(): Array<{
    taskId: number
    taskName: string
    isRunning: boolean
  }> {
    const status: Array<{ taskId: number; taskName: string; isRunning: boolean }> = []

    for (const [taskId, cronTask] of this.scheduledTasks) {
      const task = scheduledTasksService.getTaskById(taskId)
      if (task) {
        status.push({
          taskId,
          taskName: task.name,
          isRunning: cronTask.running || false
        })
      }
    }

    return status
  }
}

// 导出单例实例
export const taskScheduler = new TaskScheduler()
