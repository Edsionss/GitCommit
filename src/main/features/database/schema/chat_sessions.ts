export default `
CREATE TABLE IF NOT EXISTS chat_sessions (
    -- 会话ID, 主键
    id                 TEXT    PRIMARY KEY,

    -- 会话名称
    name               TEXT    NOT NULL,

    -- 开始时间
    start_time         TEXT    NOT NULL,

    -- 创建时间
    created_at         TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),

    -- 更新时间
    updated_at         TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
    -- 消息ID, 主键, 自动增长
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,

    -- 会话ID, 外键关联到chat_sessions表
    session_id         TEXT    NOT NULL,

    -- 发送者: 'user' 或 'ai'
    sender             TEXT    NOT NULL CHECK(sender IN ('user', 'ai')),

    -- 消息内容
    text               TEXT    NOT NULL,

    -- 是否正在加载 (仅用于AI回复)
    is_loading         INTEGER NOT NULL DEFAULT 0,

    -- 创建时间
    created_at         TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),

    -- 外键约束
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- 为常用查询字段创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_chat_sessions_start_time ON chat_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
`