export interface AuditLog {
  id: number
  timestamp: string
  actionType: 'INSERT' | 'UPDATE' | 'DELETE'
  tableName: string
  recordId?: string
  userId?: string
  oldData?: string
  newData?: string
  remarks?: string
}
