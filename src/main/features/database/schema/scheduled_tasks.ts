
export default `
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cron_expression TEXT NOT NULL,
    action_type TEXT NOT NULL, -- e.g., 'notification', 'run_script'
    action_payload TEXT, -- JSON string with action details
    is_enabled INTEGER NOT NULL DEFAULT 1, -- 1 for true, 0 for false
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update 'updated_at' timestamp
CREATE TRIGGER IF NOT EXISTS trg_scheduled_tasks_updated_at
AFTER UPDATE ON scheduled_tasks FOR EACH ROW
BEGIN
    UPDATE scheduled_tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Audit log for INSERT
CREATE TRIGGER IF NOT EXISTS trg_scheduled_tasks_after_insert
AFTER INSERT ON scheduled_tasks
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, new_data)
    VALUES ('INSERT', 'scheduled_tasks', NEW.id, json_object(
        'id', NEW.id, 'name', NEW.name, 'cron_expression', NEW.cron_expression, 'action_type', NEW.action_type, 'action_payload', NEW.action_payload, 'is_enabled', NEW.is_enabled
    ));
END;

-- Audit log for UPDATE
CREATE TRIGGER IF NOT EXISTS trg_scheduled_tasks_after_update
AFTER UPDATE ON scheduled_tasks FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data, new_data)
    VALUES ('UPDATE', 'scheduled_tasks', OLD.id, json_object(
        'name', OLD.name, 'cron_expression', OLD.cron_expression, 'action_type', OLD.action_type, 'action_payload', OLD.action_payload, 'is_enabled', OLD.is_enabled
    ), json_object(
        'name', NEW.name, 'cron_expression', NEW.cron_expression, 'action_type', NEW.action_type, 'action_payload', NEW.action_payload, 'is_enabled', NEW.is_enabled
    ));
END;

-- Audit log for DELETE
CREATE TRIGGER IF NOT EXISTS trg_scheduled_tasks_after_delete
AFTER DELETE ON scheduled_tasks FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data)
    VALUES ('DELETE', 'scheduled_tasks', OLD.id, json_object(
        'id', OLD.id, 'name', OLD.name, 'cron_expression', OLD.cron_expression, 'action_type', OLD.action_type, 'action_payload', OLD.action_payload, 'is_enabled', OLD.is_enabled
    ));
END;
`;
