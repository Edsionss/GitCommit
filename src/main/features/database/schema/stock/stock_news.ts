export default `

--  创建市场快讯表 (stock_news)
CREATE TABLE IF NOT EXISTS stock_news (
    id           TEXT PRIMARY KEY ,
    news_time    TEXT NOT NULL,                           -- 快讯时间
    news_date    TEXT NOT NULL,                           -- 快讯日期
    is_important INTEGER NOT NULL DEFAULT 0,              -- 是否重要 (0: 否, 1: 是)
    title        TEXT NOT NULL,                           -- 标题
    content      TEXT,                                    -- 内容
    source       TEXT,                                    -- 来源
    trade_date   TEXT,                                    -- 所属交易日 (yyyy-MM-dd)  
    created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP  -- 记录创建时间
);

--  为市场快讯表创建 INSERT 触发器
CREATE TRIGGER IF NOT EXISTS log_stock_news_insert
AFTER INSERT ON stock_news
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, user_id, old_date, new_date)
    VALUES (
        'INSERT',
        'stock_news',
        NEW.id,
        'SYSTEM', -- 实际应用中可以替换为当前应用用户名或获取当前用户ID的函数
        NULL,
        json_object(
            'id', NEW.id,
            'news_time', NEW.news_time,
            'news_date', NEW.news_date,
            'is_important', NEW.is_important,
            'title', NEW.title,
            'content', NEW.content,
            'source', NEW.source,
            'trade_date', NEW.trade_date,
            'created_at', NEW.created_at
        )
    );
END;

--  为市场快讯表创建 UPDATE 触发器
CREATE TRIGGER IF NOT EXISTS log_stock_news_update
AFTER UPDATE ON stock_news
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, user_id, old_date, new_date)
    VALUES (
        'UPDATE',
        'stock_news',
        NEW.id,
        'SYSTEM', -- 实际应用中可以替换为当前应用用户名或获取当前用户ID的函数
        json_object(
            'id', OLD.id,
            'news_time', OLD.news_time,
            'news_date', NEW.news_date,
            'is_important', OLD.is_important,
            'title', OLD.title,
            'content', OLD.content,
            'source', OLD.source,
            'trade_date', NEW.trade_date,
            'created_at', OLD.created_at
        ),
        json_object(
            'id', NEW.id,
            'news_time', NEW.news_time,
            'news_date', NEW.news_date,
            'is_important', NEW.is_important,
            'title', NEW.title,
            'content', NEW.content,
            'source', NEW.source,
            'trade_date', NEW.trade_date,
            'created_at', NEW.created_at
        )
    );
END;

-- 5. 为市场快讯表创建 DELETE 触发器
CREATE TRIGGER IF NOT EXISTS log_stock_news_delete
AFTER DELETE ON stock_news
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, user_id, old_date, new_date)
    VALUES (
        'DELETE',
        'stock_news',
        OLD.id,
        'SYSTEM', -- 实际应用中可以替换为当前应用用户名或获取当前用户ID的函数
        json_object(
            'id', OLD.id,
            'news_time', OLD.news_time,
            'news_date', NEW.news_date,
            'is_important', OLD.is_important,
            'title', OLD.title,
            'content', OLD.content,
            'source', OLD.source,
            'trade_date', NEW.trade_date,
            'created_at', OLD.created_at
        ),
        NULL
    );
END;


`
