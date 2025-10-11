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

-- 创建触发器 更新创建时间和更新时间
CREATE TRIGGER IF NOT EXISTS trg_chat_sessions_updated_at
AFTER UPDATE ON chat_sessions
FOR EACH ROW
BEGIN
    UPDATE chat_sessions 
    SET updated_at = (datetime('now', 'localtime')) 
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_chat_messages_updated_at
AFTER UPDATE ON chat_messages
FOR EACH ROW
BEGIN
    UPDATE chat_messages 
    SET created_at = (datetime('now', 'localtime')) 
    WHERE id = NEW.id;
END;

-- 创建 INSERT 触发器
CREATE TRIGGER IF NOT EXISTS trg_chat_sessions_after_insert
AFTER INSERT ON chat_sessions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, new_data, user_id)
    VALUES (
        'INSERT',
        'chat_sessions',
        NEW.id,
        json_object(
            'id', NEW.id,
            'name', NEW.name,
            'startTime', NEW.start_time,
            'createdAt', NEW.created_at,
            'updatedAt', NEW.updated_at
        ),
        'SYSTEM'
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_chat_messages_after_insert
AFTER INSERT ON chat_messages
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, new_data, user_id)
    VALUES (
        'INSERT',
        'chat_messages',
        NEW.id,
        json_object(
            'id', NEW.id,
            'sessionId', NEW.session_id,
            'sender', NEW.sender,
            'text', NEW.text,
            'isLoading', NEW.is_loading,
            'createdAt', NEW.created_at
        ),
        'SYSTEM'
    );
END;

-- 创建 DELETE 触发器
CREATE TRIGGER IF NOT EXISTS trg_chat_sessions_after_delete
AFTER DELETE ON chat_sessions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data)
    VALUES (
        'DELETE',
        'chat_sessions',
        OLD.id,
        json_object(
            'id', OLD.id,
            'name', OLD.name,
            'startTime', OLD.start_time,
            'createdAt', OLD.created_at,
            'updatedAt', OLD.updated_at
        )
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_chat_messages_after_delete
AFTER DELETE ON chat_messages
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data)
    VALUES (
        'DELETE',
        'chat_messages',
        OLD.id,
        json_object(
            'id', OLD.id,
            'sessionId', OLD.session_id,
            'sender', OLD.sender,
            'text', OLD.text,
            'isLoading', OLD.is_loading,
            'createdAt', OLD.created_at
        )
    );
END;

-- 创建 UPDATE 触发器
CREATE TRIGGER IF NOT EXISTS trg_chat_sessions_after_update
AFTER UPDATE ON chat_sessions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data, new_data)
    VALUES (
        'UPDATE',
        'chat_sessions',
        NEW.id,
        json_object(
            'id', OLD.id,
            'name', OLD.name,
            'startTime', OLD.start_time,
            'createdAt', OLD.created_at,
            'updatedAt', OLD.updated_at
        ),
        json_object(
            'id', NEW.id,
            'name', NEW.name,
            'startTime', NEW.start_time,
            'createdAt', NEW.created_at,
            'updatedAt', NEW.updated_at
        )
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_chat_messages_after_update
AFTER UPDATE ON chat_messages
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data, new_data)
    VALUES (
        'UPDATE',
        'chat_messages',
        NEW.id,
        json_object(
            'id', OLD.id,
            'sessionId', OLD.session_id,
            'sender', OLD.sender,
            'text', OLD.text,
            'isLoading', OLD.is_loading,
            'createdAt', OLD.created_at
        ),
        json_object(
            'id', NEW.id,
            'sessionId', NEW.session_id,
            'sender', NEW.sender,
            'text', NEW.text,
            'isLoading', NEW.is_loading,
            'createdAt', NEW.created_at
        )
    );
END;
`