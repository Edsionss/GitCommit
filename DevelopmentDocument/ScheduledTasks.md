# 定时任务功能开发设计文档

## 功能概述

定时任务功能允许用户创建、管理和执行预定的自动化任务。该功能将提供任务调度、执行监控和结果记录等核心能力，解决用户需要定期执行重复性操作的需求。

## 技术方案

### 核心技术栈
- **任务调度**: 使用node-cron库实现基于时间的任务调度
- **数据持久化**: 使用SQLite数据库存储任务配置和执行历史
- **进程通信**: 使用Electron IPC机制实现前后端通信
- **UI框架**: 使用Ant Design Vue构建用户界面

### 架构设计
- **后端服务**: 在主进程中实现任务调度引擎和执行逻辑
- **前端界面**: 在渲染进程中提供任务管理界面
- **数据层**: 设计专门的表结构存储任务信息和执行记录

## 依赖项

需要安装的NPM包:
- `node-cron`: 用于任务调度

项目中已有的依赖包:
- `dayjs`: 用于日期时间处理（项目中已安装版本1.11.10，完全满足定时任务功能的所有日期处理需求）

## 数据库设计

### 1. scheduled_tasks 表
存储定时任务的基本信息和配置
```sql
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  cron_expression TEXT NOT NULL,
  task_type TEXT NOT NULL,
  task_config TEXT NOT NULL, -- JSON格式存储任务特定配置
  is_active INTEGER DEFAULT 1, -- 1: 激活, 0: 停用
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_run_at DATETIME,
  next_run_at DATETIME
);
```

### 2. task_execution_logs 表
存储任务执行历史和结果
```sql
CREATE TABLE IF NOT EXISTS task_execution_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  execution_status TEXT NOT NULL, -- 'success', 'failed', 'running'
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  result TEXT, -- JSON格式存储执行结果
  error_message TEXT,
  FOREIGN KEY (task_id) REFERENCES scheduled_tasks (id) ON DELETE CASCADE
);
```

### 索引设计
```sql
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_next_run ON scheduled_tasks (next_run_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_active ON scheduled_tasks (is_active);
CREATE INDEX IF NOT EXISTS idx_task_execution_logs_task_id ON task_execution_logs (task_id);
CREATE INDEX IF NOT EXISTS idx_task_execution_logs_start_time ON task_execution_logs (start_time);
```

### 审计日志触发器设计

根据项目规范，需要为scheduled_tasks表和task_execution_logs表创建审计日志触发器，记录所有数据变更操作。

#### scheduled_tasks表触发器
```sql
-- scheduled_tasks表插入触发器
CREATE TRIGGER IF NOT EXISTS trg_scheduled_tasks_after_insert
AFTER INSERT ON scheduled_tasks
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data, new_data, user_id, remarks)
    VALUES (
        'INSERT',
        'scheduled_tasks',
        NEW.id,
        NULL,
        json_object(
            'id', NEW.id,
            'name', NEW.name,
            'description', NEW.description,
            'cronExpression', NEW.cron_expression,
            'taskType', NEW.task_type,
            'taskConfig', NEW.task_config,
            'isActive', NEW.is_active,
            'createdAt', NEW.created_at,
            'updatedAt', NEW.updated_at,
            'lastRunAt', NEW.last_run_at,
            'nextRunAt', NEW.next_run_at
        ),
        'SYSTEM',
        '创建定时任务'
    );
END;

-- scheduled_tasks表更新触发器
CREATE TRIGGER IF NOT EXISTS trg_scheduled_tasks_after_update
AFTER UPDATE ON scheduled_tasks
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data, new_data, user_id, remarks)
    VALUES (
        'UPDATE',
        'scheduled_tasks',
        NEW.id,
        json_object(
            'id', OLD.id,
            'name', OLD.name,
            'description', OLD.description,
            'cronExpression', OLD.cron_expression,
            'taskType', OLD.task_type,
            'taskConfig', OLD.task_config,
            'isActive', OLD.is_active,
            'createdAt', OLD.created_at,
            'updatedAt', OLD.updated_at,
            'lastRunAt', OLD.last_run_at,
            'nextRunAt', OLD.next_run_at
        ),
        json_object(
            'id', NEW.id,
            'name', NEW.name,
            'description', NEW.description,
            'cronExpression', NEW.cron_expression,
            'taskType', NEW.task_type,
            'taskConfig', NEW.task_config,
            'isActive', NEW.is_active,
            'createdAt', NEW.created_at,
            'updatedAt', NEW.updated_at,
            'lastRunAt', NEW.last_run_at,
            'nextRunAt', NEW.next_run_at
        ),
        'SYSTEM',
        '更新定时任务'
    );
END;

-- scheduled_tasks表删除触发器
CREATE TRIGGER IF NOT EXISTS trg_scheduled_tasks_after_delete
AFTER DELETE ON scheduled_tasks
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data, new_data, user_id, remarks)
    VALUES (
        'DELETE',
        'scheduled_tasks',
        OLD.id,
        json_object(
            'id', OLD.id,
            'name', OLD.name,
            'description', OLD.description,
            'cronExpression', OLD.cron_expression,
            'taskType', OLD.task_type,
            'taskConfig', OLD.task_config,
            'isActive', OLD.is_active,
            'createdAt', OLD.created_at,
            'updatedAt', OLD.updated_at,
            'lastRunAt', OLD.last_run_at,
            'nextRunAt', OLD.next_run_at
        ),
        NULL,
        'SYSTEM',
        '删除定时任务'
    );
END;
```

#### task_execution_logs表触发器
```sql
-- task_execution_logs表插入触发器
CREATE TRIGGER IF NOT EXISTS trg_task_execution_logs_after_insert
AFTER INSERT ON task_execution_logs
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data, new_data, user_id, remarks)
    VALUES (
        'INSERT',
        'task_execution_logs',
        NEW.id,
        NULL,
        json_object(
            'id', NEW.id,
            'taskId', NEW.task_id,
            'executionStatus', NEW.execution_status,
            'startTime', NEW.start_time,
            'endTime', NEW.end_time,
            'result', NEW.result,
            'errorMessage', NEW.error_message
        ),
        'SYSTEM',
        '创建任务执行日志'
    );
END;

-- task_execution_logs表更新触发器
CREATE TRIGGER IF NOT EXISTS trg_task_execution_logs_after_update
AFTER UPDATE ON task_execution_logs
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data, new_data, user_id, remarks)
    VALUES (
        'UPDATE',
        'task_execution_logs',
        NEW.id,
        json_object(
            'id', OLD.id,
            'taskId', OLD.task_id,
            'executionStatus', OLD.execution_status,
            'startTime', OLD.start_time,
            'endTime', OLD.end_time,
            'result', OLD.result,
            'errorMessage', OLD.error_message
        ),
        json_object(
            'id', NEW.id,
            'taskId', NEW.task_id,
            'executionStatus', NEW.execution_status,
            'startTime', NEW.start_time,
            'endTime', NEW.end_time,
            'result', NEW.result,
            'errorMessage', NEW.error_message
        ),
        'SYSTEM',
        '更新任务执行日志'
    );
END;

-- task_execution_logs表删除触发器
CREATE TRIGGER IF NOT EXISTS trg_task_execution_logs_after_delete
AFTER DELETE ON task_execution_logs
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data, new_data, user_id, remarks)
    VALUES (
        'DELETE',
        'task_execution_logs',
        OLD.id,
        json_object(
            'id', OLD.id,
            'taskId', OLD.task_id,
            'executionStatus', OLD.execution_status,
            'startTime', OLD.start_time,
            'endTime', OLD.end_time,
            'result', OLD.result,
            'errorMessage', OLD.error_message
        ),
        NULL,
        'SYSTEM',
        '删除任务执行日志'
    );
END;
```

## API设计

### IPC通道定义

1. **任务管理相关通道**
   - `scheduled-tasks:create` - 创建新任务
   - `scheduled-tasks:update` - 更新任务
   - `scheduled-tasks:delete` - 删除任务
   - `scheduled-tasks:get-all` - 获取所有任务
   - `scheduled-tasks:get-by-id` - 根据ID获取任务
   - `scheduled-tasks:toggle-status` - 切换任务激活状态

2. **任务执行相关通道**
   - `scheduled-tasks:run-now` - 立即执行指定任务
   - `scheduled-tasks:get-execution-logs` - 获取任务执行日志
   - `scheduled-tasks:get-next-run-time` - 获取任务下次执行时间

3. **系统相关通道**
   - `scheduled-tasks:get-cron-descriptions` - 获取常用cron表达式描述
   - `scheduled-tasks:validate-cron` - 验证cron表达式有效性

### 数据传输对象(DTO)

1. **ScheduledTaskDto**
```typescript
interface ScheduledTaskDto {
  id?: number;
  name: string;
  description?: string;
  cronExpression: string;
  taskType: string;
  taskConfig: Record<string, any>;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastRunAt?: Date;
  nextRunAt?: Date;
}
```

2. **TaskExecutionLogDto**
```typescript
interface TaskExecutionLogDto {
  id?: number;
  taskId: number;
  executionStatus: 'success' | 'failed' | 'running';
  startTime: Date;
  endTime?: Date;
  result?: Record<string, any>;
  errorMessage?: string;
}
```

## 模块划分

### 后端模块

1. **数据库模块** (`/src/main/features/database/schema/`)
   - `scheduled_tasks.ts` - 任务表结构定义
   - `task_execution_logs.ts` - 执行日志表结构定义

2. **服务层** (`/src/main/features/services/ScheduledTasks/`)
   - `index.ts` - 任务管理核心业务逻辑
   - `scheduler.ts` - 任务调度器实现
   - `executor.ts` - 任务执行器实现

3. **处理器层** (`/src/main/features/handlers/ScheduledTasks/`)
   - `index.ts` - IPC处理器实现

### 前端模块

1. **API封装** (`/src/renderer/src/api/`)
   - `scheduledTasks.ts` - 前端API封装

2. **组件** (`/src/renderer/src/components/`)
   - `TaskForm/` - 任务创建/编辑表单组件
   - `TaskList/` - 任务列表组件
   - `ExecutionLog/` - 执行日志展示组件
   - `CronBuilder/` - Cron表达式构建组件

3. **页面** (`/src/renderer/src/views/`)
   - `ScheduledTasks.vue` - 定时任务主页面

## 任务类型设计

系统将支持以下类型的定时任务:

1. **系统通知任务**: 在指定时间显示系统通知
2. **数据备份任务**: 定期备份应用数据
3. **数据清理任务**: 定期清理过期数据
4. **自定义脚本任务**: 执行用户自定义的JavaScript代码

每种任务类型将有对应的配置参数和执行逻辑。