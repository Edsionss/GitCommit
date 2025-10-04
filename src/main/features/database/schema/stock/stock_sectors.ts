export default `
CREATE TABLE IF NOT EXISTS stock_sectors (
    -- ID, 主键
    id  TEXT PRIMARY KEY NOT NULL,

    -- 板块: Sector Name
    sector_name TEXT NOT NULL,

    -- 涨跌幅(%): Rise/Fall Percentage for the sector
    change_percentage REAL,

    -- 总成交量 (万手): Total Volume in 10,000 lots
    total_volume_lots REAL,

    -- 总成交额 (亿元): Total Turnover in 100 million Yuan
    total_turnover_yuan REAL,

    -- 净流入 (亿元): Net Inflow in 100 million Yuan
    net_inflow_yuan REAL,

    -- 上涨家数: Number of stocks that rose
    rising_stocks_count INTEGER,

    -- 下跌家数: Number of stocks that fell
    falling_stocks_count INTEGER,

    -- 均价: Average Price
    average_price REAL,

    -- 领涨股: Name of the leading gainer stock
    leading_stock_name TEXT,

    -- 最新价: Latest price of the leading gainer stock
    leading_stock_latest_price REAL,

    -- 涨跌幅(%): Rise/Fall Percentage of the leading gainer stock
    leading_stock_change_percentage REAL,

    -- 创建时间: 在插入数据时自动设置为当前时间戳
    --created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    -- 推荐：使用整数存储 Unix 时间戳
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))


);


--触发器 1: 记录插入 (INSERT) 操作
CREATE TRIGGER IF NOT EXISTS trg_stock_sectors_after_insert
AFTER INSERT ON stock_sectors
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, user_id, new_data)
    VALUES (
        'INSERT',
        'stock_sectors',
        NEW.id,  -- 关键改动：使用自增的 id 作为记录ID
        'TRIGGER',
        json_object(
            'id', NEW.id, -- 在JSON中也记录id
            'sector_name', NEW.sector_name,
            'change_percentage', NEW.change_percentage,
            'total_volume_lots', NEW.total_volume_lots,
            'total_turnover_yuan', NEW.total_turnover_yuan,
            'net_inflow_yuan', NEW.net_inflow_yuan,
            'rising_stocks_count', NEW.rising_stocks_count,
            'falling_stocks_count', NEW.falling_stocks_count,
            'average_price', NEW.average_price,
            'leading_stock_name', NEW.leading_stock_name,
            'leading_stock_latest_price', NEW.leading_stock_latest_price,
            'leading_stock_change_percentage', NEW.leading_stock_change_percentage,
            'created_at', NEW.created_at
        )
    );
END;




--触发器 2: 记录更新 (UPDATE) 操作
CREATE TRIGGER IF NOT EXISTS trg_stock_sectors_after_update
AFTER UPDATE ON stock_sectors
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, user_id, old_data, new_data)
    VALUES (
        'UPDATE',
        'stock_sectors',
        NEW.id, -- 关键改动：使用 id
        'TRIGGER',
        json_object(      -- 旧数据
            'id', OLD.id,
            'sector_name', OLD.sector_name,
            'change_percentage', OLD.change_percentage,
            'total_volume_lots', OLD.total_volume_lots,
            'total_turnover_yuan', OLD.total_turnover_yuan,
            'net_inflow_yuan', OLD.net_inflow_yuan,
            'rising_stocks_count', OLD.rising_stocks_count,
            'falling_stocks_count', OLD.falling_stocks_count,
            'average_price', OLD.average_price,
            'leading_stock_name', OLD.leading_stock_name,
            'leading_stock_latest_price', OLD.leading_stock_latest_price,
            'leading_stock_change_percentage', OLD.leading_stock_change_percentage,
            'created_at', OLD.created_at
        ),
        json_object(      -- 新数据
            'id', NEW.id,
            'sector_name', NEW.sector_name,
            'change_percentage', NEW.change_percentage,
            'total_volume_lots', NEW.total_volume_lots,
            'total_turnover_yuan', NEW.total_turnover_yuan,
            'net_inflow_yuan', NEW.net_inflow_yuan,
            'rising_stocks_count', NEW.rising_stocks_count,
            'falling_stocks_count', NEW.falling_stocks_count,
            'average_price', NEW.average_price,
            'leading_stock_name', NEW.leading_stock_name,
            'leading_stock_latest_price', NEW.leading_stock_latest_price,
            'leading_stock_change_percentage', NEW.leading_stock_change_percentage,
            'created_at', NEW.created_at
        )
    );
END;



--触发器 3: 记录删除 (DELETE) 操作
CREATE TRIGGER IF NOT EXISTS trg_stock_sectors_after_delete
AFTER DELETE ON stock_sectors
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, user_id, old_data)
    VALUES (
        'DELETE',
        'stock_sectors',
        OLD.id, -- 关键改动：使用 id
        'TRIGGER',
        json_object(
            'id', OLD.id,
            'sector_name', OLD.sector_name,
            'change_percentage', OLD.change_percentage,
            'total_volume_lots', OLD.total_volume_lots,
            'total_turnover_yuan', OLD.total_turnover_yuan,
            'net_inflow_yuan', OLD.net_inflow_yuan,
            'rising_stocks_count', OLD.rising_stocks_count,
            'falling_stocks_count', OLD.falling_stocks_count,
            'average_price', OLD.average_price,
            'leading_stock_name', OLD.leading_stock_name,
            'leading_stock_latest_price', OLD.leading_stock_latest_price,
            'leading_stock_change_percentage', OLD.leading_stock_change_percentage,
            'created_at', OLD.created_at
        )
    );
END;
`
