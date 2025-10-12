export interface SystemLog {
  id: number
  content: string
  timestamp: string
  level: 'log' | 'warn' | 'error'
}

export interface AddSystemLogRequest {
  content: string
  level: 'log' | 'warn' | 'error'
}

export interface GetSystemLogsRequest {
  page: number
  pageSize: number
}

export interface GetSystemLogsResponse {
  records: SystemLog[]
  total: number
}