export default `
CREATE TABLE IF NOT EXISTS audit_logs (
    -- 日志ID, 主键, 自动增长
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,

    -- 发生时间: 记录操作发生的时间戳, 默认为当前时间
    timestamp          TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),

    -- 操作类型: 'INSERT', 'UPDATE', 'DELETE'
    action_type        TEXT    NOT NULL CHECK(action_type IN ('INSERT', 'UPDATE', 'DELETE')),

    -- 目标表名: 记录被操作的表是哪一个, 例如 'routes'
    table_name         TEXT    NOT NULL,

    -- 目标记录ID: 被操作的记录的主键ID。对于 TEXT 类型的 ID 也适用
    record_id          TEXT,

    -- 操作者ID (可选但强烈推荐): 记录执行此操作的用户ID或系统标识符
    -- 如果你的应用有用户系统, 这里就存用户ID。如果没有, 可以存一个固定的字符串如 'SYSTEM'
    user_id            TEXT,

    -- 旧数据: 存储操作前的数据, JSON 格式。
    -- 对于 INSERT, 此字段为 NULL。
    -- 对于 UPDATE, 存储更新前的完整行数据。
    -- 对于 DELETE, 存储被删除的完整行数据。
    old_data           TEXT,

    -- 新数据: 存储操作后的数据, JSON 格式。
    -- 对于 INSERT, 存储新插入的完整行数据。
    -- 对于 UPDATE, 存储更新后的完整行数据。
    -- 对于 DELETE, 此字段为 NULL。
    new_data           TEXT,

    -- 备注 (可选): 用于存储额外信息, 例如 "用户通过后台管理界面删除"
    remarks            TEXT
);

-- 为常用查询字段创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
`
