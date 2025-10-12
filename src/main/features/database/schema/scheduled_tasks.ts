export default `
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

-- 为常用查询字段创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_next_run ON scheduled_tasks (next_run_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_active ON scheduled_tasks (is_active);

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
`