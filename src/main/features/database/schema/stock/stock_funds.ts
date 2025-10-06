export default `
-- =============================================================================
-- stock_funds 表的结构定义
-- =============================================================================

-- 在开发过程中，为了干净地重置数据库结构，按照创建顺序的反向来删除触发器和表可能很有用。
-- (如果您需要完全重置表结构，请取消以下行的注释)
-- DROP TRIGGER IF EXISTS log_stock_funds_delete;
-- DROP TRIGGER IF EXISTS log_stock_funds_update;
-- DROP TRIGGER IF EXISTS log_stock_funds_insert;
-- DROP TABLE IF EXISTS stock_funds;

-- 1. 创建主数据表: stock_funds
-- 该表用于存储个股的每日资金流数据。
CREATE TABLE IF NOT EXISTS stock_funds (
    -- 基于所提供图片的核心业务字段
    stock_code              TEXT    NOT NULL, -- 股票代码 (例如: '600519')
    stock_name              TEXT    NOT NULL, -- 股票简称 (例如: '贵州茅台')
    latest_price            REAL,             -- 最新价
    price_change_percentage REAL,             -- 涨跌幅 (%)
    turnover_rate           REAL,             -- 换手率 (%)
    inflow_funds_wan        REAL,             -- 流入资金(万)
    outflow_funds_wan       REAL,             -- 流出资金(万)
    net_amount_wan          REAL,             -- 净额(万)
    transaction_amount_wan  REAL,             -- 成交额(万)

    -- 额外的跟踪和上下文信息字段
    trade_date              TEXT    NOT NULL, -- 交易日期 (格式: 'YYYY-MM-DD')
    data_source             TEXT,             -- 数据来源 (例如: '东方财富', '新浪财经')
    created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 记录插入到数据库时的时间戳

    -- 定义复合主键以确保数据完整性。
    -- 这可以防止同一支股票在同一天出现重复记录。
    PRIMARY KEY (stock_code, trade_date)
);


-- =============================================================================
-- 审计日志触发器 (新版)
-- 功能: 记录 stock_funds 表的数据变更，并将详细信息以 JSON 格式存入 audit_logs 表。
-- 假设 audit_logs 表结构为: timestamp, action_type, table_name, record_id, user_id, new_data, old_data, remarks
-- =============================================================================

-- 为确保脚本可重复执行，先删除可能存在的旧版和新版触发器
DROP TRIGGER IF EXISTS log_stock_funds_insert;
DROP TRIGGER IF EXISTS log_stock_funds_update;
DROP TRIGGER IF EXISTS log_stock_funds_delete;
DROP TRIGGER IF EXISTS trg_stock_funds_audit_insert;
DROP TRIGGER IF EXISTS trg_stock_funds_audit_update;
DROP TRIGGER IF EXISTS trg_stock_funds_audit_delete;


-- 1. INSERT (插入) 操作的触发器
-- 当有新数据插入 stock_funds 表时，记录完整的行数据到 new_data 字段。
CREATE TRIGGER IF NOT EXISTS trg_stock_funds_audit_insert
AFTER INSERT ON stock_funds
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        timestamp, action_type, table_name, record_id, user_id, new_data, old_data, remarks
    )
    VALUES (
        datetime('now', 'localtime'),
        'INSERT',
        'stock_funds',
        NEW.stock_code || '|' || NEW.trade_date, -- 使用复合主键作为记录ID
        NULL,
        json_object(
            'stock_code',              NEW.stock_code,
            'stock_name',              NEW.stock_name,
            'latest_price',            NEW.latest_price,
            'price_change_percentage', NEW.price_change_percentage,
            'turnover_rate',           NEW.turnover_rate,
            'inflow_funds_wan',        NEW.inflow_funds_wan,
            'outflow_funds_wan',       NEW.outflow_funds_wan,
            'net_amount_wan',          NEW.net_amount_wan,
            'transaction_amount_wan',  NEW.transaction_amount_wan,
            'trade_date',              NEW.trade_date,
            'data_source',             NEW.data_source,
            'created_at',              NEW.created_at
        ),
        NULL,
        '由触发器生成的日志'
    );
END;


-- 2. UPDATE (更新) 操作的触发器
-- 当 stock_funds 表的数据被更新时，同时记录更新前 (old_data) 和更新后 (new_data) 的完整行数据。
CREATE TRIGGER IF NOT EXISTS trg_stock_funds_audit_update
AFTER UPDATE ON stock_funds
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        timestamp, action_type, table_name, record_id, user_id, new_data, old_data, remarks
    )
    VALUES (
        datetime('now', 'localtime'),
        'UPDATE',
        'stock_funds',
        NEW.stock_code || '|' || NEW.trade_date, -- 使用复合主键作为记录ID
        NULL,
        json_object(
            'stock_code',              NEW.stock_code,
            'stock_name',              NEW.stock_name,
            'latest_price',            NEW.latest_price,
            'price_change_percentage', NEW.price_change_percentage,
            'turnover_rate',           NEW.turnover_rate,
            'inflow_funds_wan',        NEW.inflow_funds_wan,
            'outflow_funds_wan',       NEW.outflow_funds_wan,
            'net_amount_wan',          NEW.net_amount_wan,
            'transaction_amount_wan',  NEW.transaction_amount_wan,
            'trade_date',              NEW.trade_date,
            'data_source',             NEW.data_source,
            'created_at',              NEW.created_at
        ),
        json_object(
            'stock_code',              OLD.stock_code,
            'stock_name',              OLD.stock_name,
            'latest_price',            OLD.latest_price,
            'price_change_percentage', OLD.price_change_percentage,
            'turnover_rate',           OLD.turnover_rate,
            'inflow_funds_wan',        OLD.inflow_funds_wan,
            'outflow_funds_wan',       OLD.outflow_funds_wan,
            'net_amount_wan',          OLD.net_amount_wan,
            'transaction_amount_wan',  OLD.transaction_amount_wan,
            'trade_date',              OLD.trade_date,
            'data_source',             OLD.data_source,
            'created_at',              OLD.created_at
        ),
        '由触发器生成的日志'
    );
END;


-- 3. DELETE (删除) 操作的触发器
-- 当 stock_funds 表的数据被删除时，记录被删除行的完整数据到 old_data 字段。
CREATE TRIGGER IF NOT EXISTS trg_stock_funds_audit_delete
AFTER DELETE ON stock_funds
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        timestamp, action_type, table_name, record_id, user_id, new_data, old_data, remarks
    )
    VALUES (
        datetime('now', 'localtime'),
        'DELETE',
        'stock_funds',
        OLD.stock_code || '|' || OLD.trade_date, -- 使用复合主键作为记录ID
        NULL,
        NULL,
        json_object(
            'stock_code',              OLD.stock_code,
            'stock_name',              OLD.stock_name,
            'latest_price',            OLD.latest_price,
            'price_change_percentage', OLD.price_change_percentage,
            'turnover_rate',           OLD.turnover_rate,
            'inflow_funds_wan',        OLD.inflow_funds_wan,
            'outflow_funds_wan',       OLD.outflow_funds_wan,
            'net_amount_wan',          OLD.net_amount_wan,
            'transaction_amount_wan',  OLD.transaction_amount_wan,
            'trade_date',              OLD.trade_date,
            'data_source',             OLD.data_source,
            'created_at',              OLD.created_at
        ),
        '由触发器生成的日志'
    );
END;

`
