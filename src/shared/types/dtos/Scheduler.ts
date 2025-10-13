export interface ScheduledTask {
  id: string
  name: string
  cronExpression: string
  actionType: 'run_script' | 'built_in' // Example action types
  script_id?: string // Optional foreign key to scripts table
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
  script_id?: string
}

export type UpdateScheduledTaskDto = Partial<Omit<ScheduledTask, 'id'>>
