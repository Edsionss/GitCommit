export interface ScheduledTask {
  id: string
  name: string
  cronExpression: string
  actionType: 'run_script' | 'built_in' // Example action types
  actionPayload?: string // JSON string
  actionParams?: string // JSON string for task parameters
  isEnabled: 0 | 1
  createdAt?: string
  updatedAt?: string
}

export type CreateScheduledTaskDto = Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt'>
export type TaskFormState = Omit<CreateScheduledTaskDto, 'isEnabled' | 'actionParams'> & {
  isEnabled: boolean
  actionParams: Record<string, any>
}

export type UpdateScheduledTaskDto = Partial<Omit<ScheduledTask, 'id'>>
