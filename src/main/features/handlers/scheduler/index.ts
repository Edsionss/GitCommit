import { ipcMain } from 'electron'
import { schedulerService } from '@services/scheduler'
import type { CreateScheduledTaskDto, UpdateScheduledTaskDto } from '@shared/types/dtos/Scheduler'

export function registerSchedulerHandlers() {
  ipcMain.handle('scheduler:get-tasks', async () => {
    try {
      return await schedulerService.getTasks()
    } catch (error) {
      console.error('Failed to get scheduled tasks:', error)
      throw error
    }
  })

  ipcMain.handle('scheduler:create-task', async (_, dto: CreateScheduledTaskDto) => {
    try {
      return await schedulerService.createTask(dto)
    } catch (error) {
      console.error('Failed to create scheduled task:', error)
      throw error
    }
  })

  ipcMain.handle('scheduler:update-task', async (_, id: number, dto: UpdateScheduledTaskDto) => {
    try {
      return await schedulerService.updateTask(id, dto)
    } catch (error) {
      console.error(`Failed to update scheduled task ${id}:`, error)
      throw error
    }
  })

  ipcMain.handle('scheduler:delete-task', async (_, id: number) => {
    try {
      await schedulerService.deleteTask(id)
      return { success: true }
    } catch (error) {
      console.error(`Failed to delete scheduled task ${id}:`, error)
      throw error
    }
  })

  ipcMain.handle('scheduler:toggle-task', async (_, id: number, is_enabled: 0 | 1) => {
    try {
      return await schedulerService.toggleTask(id, is_enabled)
    } catch (error) {
      console.error(`Failed to toggle scheduled task ${id}:`, error)
      throw error
    }
  })
}
