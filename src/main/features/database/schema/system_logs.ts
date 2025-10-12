export default `
CREATE TABLE IF NOT EXISTS system_logs (
    -- 日志ID, 主键, 自动增长
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,

    -- 日志内容: 记录日志的具体内容
    content            TEXT    NOT NULL,

    -- 日志时间戳: 记录日志产生的时间, 默认为当前时间
    timestamp          TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),

    -- 日志级别: 'log', 'warn', 'error'
    level              TEXT    NOT NULL CHECK(level IN ('log', 'warn', 'error'))
);

-- 为常用查询字段创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
`