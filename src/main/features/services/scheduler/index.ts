import { sysLogger } from '@nodeUtils/sysLogger'

import { dbHelper } from '@features/database'
import * as cron from 'node-cron'
import type {
  ScheduledTask,
  CreateScheduledTaskDto,
  UpdateScheduledTaskDto
} from '@shared/types/dtos/Scheduler'
import { BrowserWindow } from 'electron'
import { getBuiltInTaskById } from './builtInTasks'

import { nanoid } from 'nanoid'

class SchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map()
  private readonly tableName = 'scheduled_tasks'

  constructor() {
    this.initializeSchedulers()
  }

  private async initializeSchedulers() {
    sysLogger.log('Initializing schedulers...')
    const tasks = await this.getTasks({ isEnabled: 1 })
    for (const task of tasks) {
      this.startJob(task)
    }
    sysLogger.log(`Initialized ${this.jobs.size} scheduled tasks.`)
  }

  private async executeAction(task: ScheduledTask) {
    sysLogger.log(`Executing action for task: ${task.name} (ID: ${task.id})`)
    switch (task.actionType) {
      case 'notification':
        const mainWindow = BrowserWindow.getAllWindows()[0]
        if (mainWindow) {
          sysLogger.log(`Notification Payload: ${task.actionPayload}`)
          mainWindow.webContents.send('show-notification', {
            title: 'Scheduled Task',
            body: task.actionPayload || `Task "${task.name}" has run.`
          })
        }
        break
      case 'run_script':
        sysLogger.log(`Running script for task ${task.name}. Payload: ${task.actionPayload}`)
        // Placeholder for script execution logic
        break
      case 'built_in':
        sysLogger.log(`Executing built-in task: ${task.actionPayload}`)
        const builtInTask = getBuiltInTaskById(task.actionPayload || '')
        if (builtInTask) {
          try {
            await builtInTask.execute()
            sysLogger.log(`Built-in task "${builtInTask.name}" executed successfully.`)
          } catch (error) {
            sysLogger.error(`Error executing built-in task "${builtInTask.name}":`, error)
          }
        } else {
          sysLogger.error(`Built-in task with ID "${task.actionPayload}" not found.`)
        }
        break
      default:
        sysLogger.warn(`Unknown action type: ${task.actionType}`)
    }
  }

  private startJob(task: ScheduledTask) {
    if (!task.id) return

    if (this.jobs.has(task.id)) {
      this.stopJob(task.id)
    }

    if (task.isEnabled && cron.validate(task.cronExpression)) {
      const job = cron.schedule(task.cronExpression, () => {
        this.executeAction(task)
      })
      this.jobs.set(task.id, job)
      sysLogger.log(`Scheduled task "${task.name}" (ID: ${task.id})`)
    }
  }

  private stopJob(taskId: string) {
    if (this.jobs.has(taskId)) {
      this.jobs.get(taskId)!.stop()
      this.jobs.delete(taskId)
      sysLogger.log(`Stopped scheduled task (ID: ${taskId})`)
    }
  }

  async getTasks(filters: Partial<ScheduledTask> = {}): Promise<ScheduledTask[]> {
    return dbHelper.find<ScheduledTask>(this.tableName, filters)
  }

  async createTask(dto: CreateScheduledTaskDto): Promise<ScheduledTask> {
    const taskToInsert = { id: nanoid(), ...dto }
    dbHelper.insert(this.tableName, taskToInsert)
    const newTask = await dbHelper.findOne<ScheduledTask>(this.tableName, { id: taskToInsert.id })
    if (newTask && newTask.isEnabled) {
      this.startJob(newTask)
    }
    return newTask!
  }

  async updateTask(id: string, dto: UpdateScheduledTaskDto): Promise<ScheduledTask | null> {
    dbHelper.update<ScheduledTask>(this.tableName, dto, { id })

    const updatedTask = await dbHelper.findOne<ScheduledTask>(this.tableName, { id })
    if (updatedTask) {
      this.startJob(updatedTask)
    }
    return updatedTask
  }

  async deleteTask(id: string): Promise<void> {
    this.stopJob(id)
    dbHelper.delete(this.tableName, { id })
  }

  async toggleTask(id: string, isEnabled: 0 | 1): Promise<ScheduledTask | null> {
    return this.updateTask(id, { isEnabled })
  }
}

export const schedulerService = new SchedulerService()
