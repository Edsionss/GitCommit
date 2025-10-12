
export default `
CREATE TABLE IF NOT EXISTS scheduler_logs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  task_name TEXT NOT NULL,
  executed_at DATETIME NOT NULL,
  duration_ms INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE')),
  details TEXT,
  FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id) ON DELETE CASCADE
);
`
