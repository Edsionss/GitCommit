export default `
-- 步骤 1: 创建核心数据表
CREATE TABLE IF NOT EXISTS scan_histories (
    -- 本次扫描历史记录的唯一ID
    id               TEXT    PRIMARY KEY NOT NULL,

    -- 扫描的状态，例如 'RUNNING' (运行中), 'COMPLETED' (已完成), 'FAILED' (失败)
    status           TEXT    NOT NULL,

    -- 扫描开始的时间 (ISO 8601 标准格式的字符串)
    scan_time        TEXT    NOT NULL,

    -- 被扫描的仓库或文件夹的根路径
    repo_path        TEXT    NOT NULL,

    -- 本次扫描发现的总提交数
    total_commits    INTEGER NOT NULL DEFAULT 0,

    -- 最终的 AI 分析结果 (可能是大段文本)
    analysis_result  TEXT,

    -- 将 GitScanOptions 对象序列化为 JSON 字符串进行存储
    scan_options     TEXT    NOT NULL,

    -- 将 log (字符串数组) 序列化为 JSON 数组字符串进行存储
    log              TEXT    NOT NULL,
    
    -- 最佳实践：记录创建和更新时间戳
    created_at       TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at       TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);




    

CREATE TABLE IF NOT EXISTS git_commits (
    -- 一个简单的、用于内部查询的自增主键，速度快
    id               INTEGER PRIMARY KEY AUTOINCREMENT,

    -- 外键: 将这条提交记录关联到某一次具体的扫描历史
    scan_history_id  TEXT    NOT NULL,

    -- 完整的 commit hash 值
    commit_id        TEXT    NOT NULL,
    
    -- 简短的 commit hash 值
    short_hash       TEXT    NOT NULL,

    -- 提交作者的名字
    author           TEXT    NOT NULL,
    
    -- 提交作者的邮箱
    email            TEXT    NOT NULL,
    
    -- 提交日期 (ISO 8601 标准格式的字符串)
    date             TEXT    NOT NULL,

    -- 提交信息的主题行
    message          TEXT    NOT NULL,

    -- 完整的提交信息正文 (可选)
    body             TEXT,
    
    -- 本次提交的统计数据
    files_changed    INTEGER NOT NULL, -- 修改的文件数
    insertions       INTEGER NOT NULL, -- 增加的行数
    deletions        INTEGER NOT NULL, -- 删除的行数
    
    -- 本次提交所在的分支 (可选)
    branch           TEXT,

    -- 仓库名称或路径 (如果一次扫描多个仓库会很有用)
    repository       TEXT    NOT NULL,
    repo_path        TEXT    NOT NULL,

    -- 至关重要的外键约束，并设置了级联删除 (ON DELETE CASCADE)
    FOREIGN KEY (scan_history_id) REFERENCES scan_histories(id) ON DELETE CASCADE
);



-- 步骤 2: 创建索引
-- 为 'scan_histories' 表创建索引
CREATE INDEX IF NOT EXISTS idx_histories_status ON scan_histories(status); -- 按状态筛选
CREATE INDEX IF NOT EXISTS idx_histories_scan_time ON scan_histories(scan_time); -- 按时间排序和筛选
CREATE INDEX IF NOT EXISTS idx_histories_repo_path ON scan_histories(repo_path); -- 按路径筛选

-- 为 'git_commits' 表创建索引
-- 关键索引：极大地加速“查找某次扫描的所有提交记录”
CREATE INDEX IF NOT EXISTS idx_commits_scan_history_id ON git_commits(scan_history_id); 
-- 加速“在所有扫描中查找某个作者的所有提交”
CREATE INDEX IF NOT EXISTS idx_commits_author ON git_commits(author);
-- 加速“在所有扫描中查找某个特定的 commit hash”
CREATE INDEX IF NOT EXISTS idx_commits_commit_id ON git_commits(commit_id);




-- 步骤 3: 创建视图
CREATE VIEW IF NOT EXISTS v_scan_summary AS
SELECT
    sh.id, sh.status, sh.scan_time, sh.repo_path, sh.total_commits,
    COUNT(c.id) AS result_commit_count,
    SUM(c.insertions) AS total_insertions,
    SUM(c.deletions) AS total_deletions,
    GROUP_CONCAT(DISTINCT c.author) AS authors
FROM scan_histories sh
LEFT JOIN git_commits c ON sh.id = c.scan_history_id
GROUP BY sh.id;

-- 步骤 4: 创建触发器

-- 触发器1: 自动更新 'scan_histories' 表的 'updated_at' 时间戳
CREATE TRIGGER IF NOT EXISTS trg_scan_histories_updated_at
AFTER UPDATE ON scan_histories FOR EACH ROW
BEGIN
    UPDATE scan_histories SET updated_at = (datetime('now', 'localtime')) WHERE id = NEW.id;
END;

-- 触发器2: 记录对 'scan_histories' 表的 INSERT (插入) 操作
CREATE TRIGGER IF NOT EXISTS trg_scan_histories_after_insert
AFTER INSERT ON scan_histories FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, new_data) VALUES ('INSERT', 'scan_histories', NEW.id, json_object('id', NEW.id, 'status', NEW.status));
END;

-- 触发器3: 记录对 'scan_histories' 表的 DELETE (删除) 操作
CREATE TRIGGER IF NOT EXISTS trg_scan_histories_after_delete
AFTER DELETE ON scan_histories FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data) VALUES ('DELETE', 'scan_histories', OLD.id, json_object('id', OLD.id, 'status', OLD.status));
END;

-- 触发器4: 记录对 'scan_histories' 表的 UPDATE (更新) 操作
CREATE TRIGGER IF NOT EXISTS trg_scan_histories_after_update
AFTER UPDATE ON scan_histories FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data, new_data) VALUES ('UPDATE', 'scan_histories', NEW.id, json_object('id', OLD.id, 'status', OLD.status), json_object('id', NEW.id, 'status', NEW.status));
END;
`
