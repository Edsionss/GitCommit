import { sysLogger } from '@nodeUtils/sysLogger'

import { dbHelper } from '@features/database'
import * as cron from 'node-cron'
import type {
  ScheduledTask,
  CreateScheduledTaskDto,
  UpdateScheduledTaskDto
} from '@shared/types/dtos/Scheduler'
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
      case 'run_script':
        sysLogger.log(`Running script for task ${task.name}. Payload: ${task.actionPayload}`)
        // Placeholder for script execution logic
        break
      case 'built_in':
        sysLogger.log(`Executing built-in task: ${task.actionPayload}`)
        const builtInTask = getBuiltInTaskById(task.actionPayload || '')
        if (builtInTask) {
          try {
            // 解析参数
            let params = {}
            if (task.actionParams) {
              try {
                params = JSON.parse(task.actionParams)
              } catch (e) {
                sysLogger.error(`Failed to parse action params: ${task.actionParams}`, e)
                params = {}
              }
            }
            
            await builtInTask.execute(params)
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
    const tasks = dbHelper.find<ScheduledTask>(this.tableName, filters)
    
    // 解析 actionParams JSON 字符串为对象
    return tasks.map(task => ({
      ...task,
      actionParams: task.actionParams ? JSON.parse(task.actionParams) : undefined
    }))
  }

  async createTask(dto: CreateScheduledTaskDto): Promise<ScheduledTask> {
    // 确保 actionParams 被序列化为 JSON 字符串
    const taskToInsert = { 
      id: nanoid(), 
      ...dto,
      actionParams: dto.actionParams ? JSON.stringify(dto.actionParams) : undefined
    }
    dbHelper.insert(this.tableName, taskToInsert)
    const newTask = await dbHelper.findOne<ScheduledTask>(this.tableName, { id: taskToInsert.id })
    
    // 解析 actionParams JSON 字符串为对象
    const parsedTask = newTask ? {
      ...newTask,
      actionParams: newTask.actionParams ? JSON.parse(newTask.actionParams) : undefined
    } : null
    
    if (parsedTask && parsedTask.isEnabled) {
      this.startJob(parsedTask)
    }
    return parsedTask!
  }

  async updateTask(id: string, dto: UpdateScheduledTaskDto): Promise<ScheduledTask | null> {
    // 确保 actionParams 被序列化为 JSON 字符串
    const updateData = {
      ...dto,
      actionParams: dto.actionParams ? JSON.stringify(dto.actionParams) : undefined
    }
    
    dbHelper.update<ScheduledTask>(this.tableName, updateData, { id })

    const updatedTask = await dbHelper.findOne<ScheduledTask>(this.tableName, { id })
    
    // 解析 actionParams JSON 字符串为对象
    const parsedTask = updatedTask ? {
      ...updatedTask,
      actionParams: updatedTask.actionParams ? JSON.parse(updatedTask.actionParams) : undefined
    } : null
    
    if (parsedTask) {
      this.startJob(parsedTask)
    }
    return parsedTask
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
