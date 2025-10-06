export default `

-- =============================================================================
-- 1. 创建 stock_hot_rank 表
-- 功能: 存储不同类型的股票热榜排名数据。
-- 注意: 'id' 字段被定义为 TEXT 类型的主键，以确保它不会自增，调用方必须自行提供唯一的ID。
-- =============================================================================

CREATE TABLE IF NOT EXISTS stock_hot_rank (
    id                      TEXT    NOT NULL, -- 主键ID (非自增, 需手动提供)
    rank                    INTEGER NOT NULL, -- 排名
    stock_name              TEXT    NOT NULL, -- 名称
    tags                    TEXT,             -- 标签 (例如: '昨日涨停,创月新高')
    hotspot                 TEXT,             -- 热点/题材
    price_change_percentage REAL,             -- 涨幅 (%)
    hotness_score           INTEGER,          -- 热度值
    summary                 TEXT,             -- 简介/上榜理由
    stock_code              TEXT,             -- 股票代码
    rank_type               TEXT    NOT NULL, -- 热榜类型 (例如: '人气榜', '资金榜', '趋势榜')
    trade_date              TEXT    NOT NULL, -- 交易日期 (格式: 'YYYY-MM-DD')
    created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 记录创建时间

    PRIMARY KEY (id)
);


-- =============================================================================
-- 2. 为 stock_hot_rank 表创建审计日志触发器
-- 功能: 记录 stock_hot_rank 表的数据变更，并将详细信息以 JSON 格式存入 audit_logs 表。
-- =============================================================================

-- 为确保脚本可重复执行，先删除可能存在的同名触发器
DROP TRIGGER IF EXISTS trg_stock_hot_rank_audit_insert;
DROP TRIGGER IF EXISTS trg_stock_hot_rank_audit_update;
DROP TRIGGER IF EXISTS trg_stock_hot_rank_audit_delete;

-- 插入 (INSERT) 操作的触发器
CREATE TRIGGER IF NOT EXISTS trg_stock_hot_rank_audit_insert
AFTER INSERT ON stock_hot_rank
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        timestamp, action_type, table_name, record_id, user_id, new_data, old_data, remarks
    )
    VALUES (
        datetime('now', 'localtime'),
        'INSERT',
        'stock_hot_rank',
        NEW.id, -- 使用主键'id'作为记录ID
        NULL,
        json_object(
            'id',                      NEW.id,
            'rank',                    NEW.rank,
            'stock_name',              NEW.stock_name,
            'tags',                    NEW.tags,
            'hotspot',                 NEW.hotspot,
            'price_change_percentage', NEW.price_change_percentage,
            'hotness_score',           NEW.hotness_score,
            'summary',                 NEW.summary,
            'stock_code',              NEW.stock_code,
            'rank_type',               NEW.rank_type,
            'trade_date',              NEW.trade_date,
            'created_at',              NEW.created_at
        ),
        NULL,
        '由触发器生成的日志'
    );
END;

-- 更新 (UPDATE) 操作的触发器
CREATE TRIGGER IF NOT EXISTS trg_stock_hot_rank_audit_update
AFTER UPDATE ON stock_hot_rank
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        timestamp, action_type, table_name, record_id, user_id, new_data, old_data, remarks
    )
    VALUES (
        datetime('now', 'localtime'),
        'UPDATE',
        'stock_hot_rank',
        NEW.id, -- 使用主键'id'作为记录ID
        NULL,
        json_object(
            'id',                      NEW.id,
            'rank',                    NEW.rank,
            'stock_name',              NEW.stock_name,
            'tags',                    NEW.tags,
            'hotspot',                 NEW.hotspot,
            'price_change_percentage', NEW.price_change_percentage,
            'hotness_score',           NEW.hotness_score,
            'summary',                 NEW.summary,
            'stock_code',              NEW.stock_code,
            'rank_type',               NEW.rank_type,
            'trade_date',              NEW.trade_date,
            'created_at',              NEW.created_at
        ),
        json_object(
            'id',                      OLD.id,
            'rank',                    OLD.rank,
            'stock_name',              OLD.stock_name,
            'tags',                    OLD.tags,
            'hotspot',                 OLD.hotspot,
            'price_change_percentage', OLD.price_change_percentage,
            'hotness_score',           OLD.hotness_score,
            'summary',                 OLD.summary,
            'stock_code',              OLD.stock_code,
            'rank_type',               OLD.rank_type,
            'trade_date',              OLD.trade_date,
            'created_at',              OLD.created_at
        ),
        '由触发器生成的日志'
    );
END;

-- 删除 (DELETE) 操作的触发器
CREATE TRIGGER IF NOT EXISTS trg_stock_hot_rank_audit_delete
AFTER DELETE ON stock_hot_rank
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        timestamp, action_type, table_name, record_id, user_id, new_data, old_data, remarks
    )
    VALUES (
        datetime('now', 'localtime'),
        'DELETE',
        'stock_hot_rank',
        OLD.id, -- 使用主键'id'作为记录ID
        NULL,
        NULL,
        json_object(
            'id',                      OLD.id,
            'rank',                    OLD.rank,
            'stock_name',              OLD.stock_name,
            'tags',                    OLD.tags,
            'hotspot',                 OLD.hotspot,
            'price_change_percentage', OLD.price_change_percentage,
            'hotness_score',           OLD.hotness_score,
            'summary',                 OLD.summary,
            'stock_code',              OLD.stock_code,
            'rank_type',               OLD.rank_type,
            'trade_date',              OLD.trade_date,
            'created_at',              OLD.created_at
        ),
        '由触发器生成的日志'
    );
END;


`
