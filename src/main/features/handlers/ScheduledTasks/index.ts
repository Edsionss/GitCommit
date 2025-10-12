import { ipcMain } from 'electron'
import { scheduledTasksService } from '@services/ScheduledTasks'
import { taskScheduler } from '@services/ScheduledTasks/scheduler'
import { ScheduledTaskDto } from '@sharedType/scheduledTasks'

/**
 * 注册与定时任务相关的 IPC 处理程序
 */
export function registerScheduledTasksHandlers(): void {
  // 处理创建新任务的请求
  ipcMain.handle('scheduled-tasks:create', async (_event, task: ScheduledTaskDto) => {
    try {
      const taskId = scheduledTasksService.createTask(task)

      // 如果任务创建成功且是激活状态，更新调度器
      if (taskId > 0 && task.isActive) {
        const createdTask = scheduledTasksService.getTaskById(taskId)
        if (createdTask) {
          taskScheduler.scheduleTask(createdTask)
        }
      }

      return { success: true, taskId }
    } catch (error) {
      console.error('Failed to create scheduled task:', error)
      return Promise.reject(error instanceof Error ? error.message : String(error))
    }
  })

  // 处理更新任务的请求
  ipcMain.handle(
    'scheduled-tasks:update',
    async (_event, id: number, task: Partial<ScheduledTaskDto>) => {
      try {
        const success = scheduledTasksService.updateTask(id, task)

        // 如果任务更新成功，更新调度器
        if (success) {
          const updatedTask = scheduledTasksService.getTaskById(id)
          if (updatedTask) {
            taskScheduler.scheduleTask(updatedTask)
          }
        }

        return { success }
      } catch (error) {
        console.error('Failed to update scheduled task:', error)
        return Promise.reject(error instanceof Error ? error.message : String(error))
      }
    }
  )

  // 处理删除任务的请求
  ipcMain.handle('scheduled-tasks:delete', async (_event, id: number) => {
    try {
      // 先取消调度
      taskScheduler.unscheduleTask(id)

      // 然后删除任务
      const success = scheduledTasksService.deleteTask(id)

      return { success }
    } catch (error) {
      console.error('Failed to delete scheduled task:', error)
      return Promise.reject(error instanceof Error ? error.message : String(error))
    }
  })

  // 处理获取所有任务的请求
  ipcMain.handle('scheduled-tasks:get-all', async () => {
    try {
      const tasks = scheduledTasksService.getAllTasks()
      return { tasks }
    } catch (error) {
      console.error('Failed to get all scheduled tasks:', error)
      return Promise.reject(error instanceof Error ? error.message : String(error))
    }
  })

  // 处理根据ID获取任务的请求
  ipcMain.handle('scheduled-tasks:get-by-id', async (_event, id: number) => {
    try {
      const task = scheduledTasksService.getTaskById(id)
      return { task }
    } catch (error) {
      console.error('Failed to get scheduled task by ID:', error)
      return Promise.reject(error instanceof Error ? error.message : String(error))
    }
  })

  // 处理切换任务激活状态的请求
  ipcMain.handle('scheduled-tasks:toggle-status', async (_event, id: number) => {
    try {
      const success = scheduledTasksService.toggleTaskStatus(id)

      // 如果切换成功，更新调度器
      if (success) {
        const updatedTask = scheduledTasksService.getTaskById(id)
        if (updatedTask) {
          taskScheduler.scheduleTask(updatedTask)
        }
      }

      return { success }
    } catch (error) {
      console.error('Failed to toggle task status:', error)
      return Promise.reject(error instanceof Error ? error.message : String(error))
    }
  })

  // 处理立即执行任务的请求
  ipcMain.handle('scheduled-tasks:run-now', async (_event, id: number) => {
    try {
      await taskScheduler.executeTask(id)
      return { success: true }
    } catch (error) {
      console.error('Failed to run task now:', error)
      return Promise.reject(error instanceof Error ? error.message : String(error))
    }
  })

  // 处理获取任务执行日志的请求
  ipcMain.handle(
    'scheduled-tasks:get-execution-logs',
    async (_event, taskId: number, page: number, pageSize: number) => {
      try {
        const { logs, total } = scheduledTasksService.getTaskExecutionLogs(taskId, page, pageSize)
        return { logs, total }
      } catch (error) {
        console.error('Failed to get task execution logs:', error)
        return Promise.reject(error instanceof Error ? error.message : String(error))
      }
    }
  )

  // 处理获取下次执行时间的请求
  ipcMain.handle('scheduled-tasks:get-next-run-time', async (_event, cronExpression: string) => {
    try {
      const validation = scheduledTasksService.validateCronExpression(cronExpression)
      return {
        isValid: validation.isValid,
        nextRunTime: validation.nextRunTime,
        errorMessage: validation.errorMessage
      }
    } catch (error) {
      console.error('Failed to get next run time:', error)
      return Promise.reject(error instanceof Error ? error.message : String(error))
    }
  })

  // 处理获取常用cron表达式描述的请求
  ipcMain.handle('scheduled-tasks:get-cron-descriptions', async () => {
    try {
      const descriptions = scheduledTasksService.getCronDescriptions()
      return { descriptions }
    } catch (error) {
      console.error('Failed to get cron descriptions:', error)
      return Promise.reject(error instanceof Error ? error.message : String(error))
    }
  })

  // 处理验证cron表达式的请求
  ipcMain.handle('scheduled-tasks:validate-cron', async (_event, cronExpression: string) => {
    try {
      const validation = scheduledTasksService.validateCronExpression(cronExpression)
      return validation
    } catch (error) {
      console.error('Failed to validate cron expression:', error)
      return Promise.reject(error instanceof Error ? error.message : String(error))
    }
  })

  // 处理获取调度器状态的请求
  ipcMain.handle('scheduled-tasks:get-scheduler-status', async () => {
    try {
      const status = taskScheduler.getScheduledTasksStatus()
      return { status }
    } catch (error) {
      console.error('Failed to get scheduler status:', error)
      return Promise.reject(error instanceof Error ? error.message : String(error))
    }
  })

  // 处理重新加载所有任务的请求
  ipcMain.handle('scheduled-tasks:reload-all', async () => {
    try {
      await taskScheduler.reloadAllTasks()
      return { success: true }
    } catch (error) {
      console.error('Failed to reload all tasks:', error)
      return Promise.reject(error instanceof Error ? error.message : String(error))
    }
  })
}
