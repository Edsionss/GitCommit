import type {
  ScheduledTask,
  CreateScheduledTaskDto,
  UpdateScheduledTaskDto
} from '@shared/types/dtos/Scheduler'
import type { BuiltInTask } from '@sharedType/parameterTypes'

const api = window.api

export const schedulerApi = {
  getTasks: (): Promise<ScheduledTask[]> => api.getScheduledTasks(),

  createTask: (dto: CreateScheduledTaskDto): Promise<ScheduledTask> => api.createScheduledTask(dto),

  updateTask: (id: string, dto: UpdateScheduledTaskDto): Promise<ScheduledTask | null> =>
    api.updateScheduledTask(id, dto),

  deleteTask: (id: string): Promise<{ success: boolean }> => api.deleteScheduledTask(id),

  toggleTask: (id: string, is_enabled: 0 | 1): Promise<ScheduledTask | null> =>
    api.toggleScheduledTask(id, is_enabled),

  getBuiltInTasks: (): Promise<BuiltInTask[]> => api.getBuiltInTasks()
}
