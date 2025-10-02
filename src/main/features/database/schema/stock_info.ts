export default `
-- 建议：如果存在 industries 和 sectors 表，可以先创建它们
-- CREATE TABLE industries (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
-- CREATE TABLE sectors (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);

-- 创建股票基本信息表 (stock_info)
CREATE TABLE stock_info (
    -- 股票代码, 作为主键
    stock_code TEXT PRIMARY KEY NOT NULL,

    --股票名称
    stock_name TEXT NOT NULL,
    

    -- 公司名称
    company_name TEXT NOT NULL,

    -- 市场代码
    market TEXT NOT NULL,

    -- 公司简介
    company_profile TEXT,

    -- 所属行业ID, 建议添加外键约束
    industry_id INTEGER,
    -- REFERENCES industries(id) ON DELETE SET NULL,

    -- 所属板块ID, 建议添加外键约束
    sector_id INTEGER,
    -- REFERENCES sectors(id) ON DELETE SET NULL,

    -- 上市日期, 建议使用 'YYYY-MM-DD' 格式
    list_date TEXT,

    -- 创建时间: 在插入数据时自动设置为当前时间戳
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 更新时间: 插入时自动设置, 建议在应用层代码的 UPDATE 语句中手动更新
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 为常用查询字段创建索引
CREATE INDEX idx_industry_id ON stock_info (industry_id);
CREATE INDEX idx_sector_id ON stock_info (sector_id);
CREATE INDEX idx_market ON stock_info (market);


-- [已删除] 更新 updated_at 的触发器因语法错误已被移除。
-- 推荐在您的应用程序中执行 UPDATE 语句时，手动更新 updated_at 字段。
-- 例如: UPDATE stock_info SET ..., updated_at = CURRENT_TIMESTAMP WHERE ...;


-- 创建 INSERT 审计触发器 (已完善)
CREATE TRIGGER IF NOT EXISTS trg_stock_info_audit_insert
AFTER INSERT ON stock_info
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        timestamp, action_type, table_name, record_id, user_id, 
        new_data, old_data, remarks
    )
    VALUES (
        datetime('now', 'localtime'),
        'INSERT',
        'stock_info',
        NEW.stock_code,
        NULL,
        json_object(
            'stock_code',      NEW.stock_code,
            'company_name',    NEW.company_name,
            'stock_name',      NEW.stock_name,
            'market',          NEW.market,
            'company_profile', NEW.company_profile,
            'industry_id',     NEW.industry_id,
            'sector_id',       NEW.sector_id,
            'list_date',       NEW.list_date,
            'created_at',      NEW.created_at, -- 补全字段
            'updated_at',      NEW.updated_at  -- 补全字段
        ),
        NULL,
        'Trigger-generated log'
    );
END;


-- 创建 DELETE 审计触发器 (已完善)
CREATE TRIGGER IF NOT EXISTS trg_stock_info_audit_delete
AFTER DELETE ON stock_info
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        timestamp, action_type, table_name, record_id, user_id, 
        old_data, new_data, remarks
    )
    VALUES (
        datetime('now', 'localtime'),
        'DELETE',
        'stock_info',
        OLD.stock_code,
        NULL,
        json_object(
            'stock_code',      OLD.stock_code,
            'company_name',    OLD.company_name,
            'stock_name',      NEW.stock_name,

            'market',          OLD.market,
            'company_profile', OLD.company_profile,
            'industry_id',     OLD.industry_id,
            'sector_id',       OLD.sector_id,
            'list_date',       OLD.list_date,
            'created_at',      OLD.created_at, -- 补全字段
            'updated_at',      OLD.updated_at  -- 补全字段
        ),
        NULL,
        'Trigger-generated log'
    );
END;


-- 创建 UPDATE 审计触发器 (已完善)
CREATE TRIGGER IF NOT EXISTS trg_stock_info_audit_update
AFTER UPDATE ON stock_info
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        timestamp, action_type, table_name, record_id, user_id, 
        old_data, new_data, remarks
    )
    VALUES (
        datetime('now', 'localtime'),
        'UPDATE',
        'stock_info',
        NEW.stock_code,
        NULL,
        json_object(
            'stock_code',      OLD.stock_code,
            'company_name',    OLD.company_name,
            'stock_name',      NEW.stock_name,

            'market',          OLD.market,
            'company_profile', OLD.company_profile,
            'industry_id',     OLD.industry_id,
            'sector_id',       OLD.sector_id,
            'list_date',       OLD.list_date,
            'created_at',      OLD.created_at, -- 补全字段
            'updated_at',      OLD.updated_at  -- 补全字段
        ),
        json_object(
            'stock_code',      NEW.stock_code,
            'company_name',    NEW.company_name,
            'stock_name',      NEW.stock_name,

            'market',          NEW.market,
            'company_profile', NEW.company_profile,
            'industry_id',     NEW.industry_id,
            'sector_id',       NEW.sector_id,
            'list_date',       NEW.list_date,
            'created_at',      NEW.created_at, -- 补全字段
            'updated_at',      NEW.updated_at  -- 补全字段
        ),
        'Trigger-generated log'
    );
END;

`
