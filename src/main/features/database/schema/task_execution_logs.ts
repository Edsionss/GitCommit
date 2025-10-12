export default `
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

-- 为常用查询字段创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_task_execution_logs_task_id ON task_execution_logs (task_id);
CREATE INDEX IF NOT EXISTS idx_task_execution_logs_start_time ON task_execution_logs (start_time);

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
`