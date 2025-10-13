
export default `
  CREATE TABLE IF NOT EXISTS scripts (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Trigger to update 'updated_at' timestamp
  CREATE TRIGGER IF NOT EXISTS trg_scripts_updated_at
  AFTER UPDATE ON scripts FOR EACH ROW
  BEGIN
      UPDATE scripts SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
  END;

  -- Audit log for INSERT
  CREATE TRIGGER IF NOT EXISTS trg_scripts_after_insert
  AFTER INSERT ON scripts
  BEGIN
      INSERT INTO audit_logs (action_type, table_name, record_id, new_data)
      VALUES ('INSERT', 'scripts', NEW.id, json_object(
          'id', NEW.id, 'name', NEW.name, 'description', NEW.description, 'content', NEW.content
      ));
  END;

  -- Audit log for UPDATE
  CREATE TRIGGER IF NOT EXISTS trg_scripts_after_update
  AFTER UPDATE ON scripts FOR EACH ROW
  BEGIN
      INSERT INTO audit_logs (action_type, table_name, record_id, old_data, new_data)
      VALUES ('UPDATE', 'scripts', OLD.id, json_object(
          'name', OLD.name, 'description', OLD.description, 'content', OLD.content
      ), json_object(
          'name', NEW.name, 'description', NEW.description, 'content', NEW.content
      ));
  END;

  -- Audit log for DELETE
  CREATE TRIGGER IF NOT EXISTS trg_scripts_after_delete
  AFTER DELETE ON scripts FOR EACH ROW
  BEGIN
      INSERT INTO audit_logs (action_type, table_name, record_id, old_data)
      VALUES ('DELETE', 'scripts', OLD.id, json_object(
          'id', OLD.id, 'name', OLD.name, 'description', OLD.description
      ));
  END;
`;
