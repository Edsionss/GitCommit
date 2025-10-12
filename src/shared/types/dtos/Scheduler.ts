
export interface ScheduledTask {
  id: string
  name: string
  cronExpression: string
  actionType: 'notification' | 'run_script' // Example action types
  actionPayload?: string // JSON string
  isEnabled: 0 | 1
  createdAt?: string
  updatedAt?: string
}

export type CreateScheduledTaskDto = Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt'>

export type UpdateScheduledTaskDto = Partial<Omit<ScheduledTask, 'id'>>
