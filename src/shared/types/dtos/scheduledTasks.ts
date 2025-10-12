export interface ScheduledTaskDto {
  id?: number;
  name: string;
  description?: string;
  cronExpression: string;
  taskType: 'system_notification' | 'data_backup' | 'data_cleanup' | 'custom_script';
  taskConfig: Record<string, any>;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastRunAt?: Date;
  nextRunAt?: Date;
}

export interface TaskExecutionLogDto {
  id?: number;
  taskId: number;
  executionStatus: 'success' | 'failed' | 'running';
  startTime: Date;
  endTime?: Date;
  result?: Record<string, any>;
  errorMessage?: string;
}

export interface CronDescriptionDto {
  expression: string;
  description: string;
  example: string;
}

export interface TaskValidationResult {
  isValid: boolean;
  errorMessage?: string;
  nextRunTime?: Date;
}

export interface TaskExecutionResult {
  success: boolean;
  result?: Record<string, any>;
  errorMessage?: string;
  executionTime: number;
}

// 任务配置类型
export interface SystemNotificationConfig {
  title: string;
  message: string;
  icon?: string;
  urgency?: 'low' | 'normal' | 'critical';
}

export interface DataBackupConfig {
  backupPath: string;
  includeTables?: string[];
  excludeTables?: string[];
  compress?: boolean;
}

export interface DataCleanupConfig {
  targetTable: string;
  retentionDays: number;
  condition?: string;
}

export interface CustomScriptConfig {
  scriptCode: string;
  timeout?: number; // 超时时间（毫秒）
  context?: Record<string, any>; // 脚本执行上下文
}

// 任务执行上下文
export interface TaskExecutionContext {
  taskId: number;
  taskName: string;
  taskType: string;
  executionId: number;
  scheduledTime: Date;
  actualStartTime: Date;
}