export default `
CREATE TABLE IF NOT EXISTS notification_logs (
    -- 日志ID, 主键, 自动增长
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,

    -- 推送主题: ntfy.sh的主题名称
    topic              TEXT    NOT NULL,

    -- 推送消息内容
    message            TEXT    NOT NULL,

    -- 推送状态: 'success' 或 'failed'
    status             TEXT    NOT NULL CHECK(status IN ('success', 'failed')),

    -- 错误信息: 如果推送失败, 记录错误信息
    error_message      TEXT,

    -- 创建时间: 记录推送时间, 默认为当前时间
    created_at         TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 为常用查询字段创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_notification_logs_topic ON notification_logs(topic);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);
`
