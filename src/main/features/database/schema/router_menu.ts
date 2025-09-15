export default `
-- 为路由记录创建一个名为 'routes_menu' 的表
CREATE TABLE IF NOT EXISTS routes_menu (
    -- 菜单ID, 主键
    id            TEXT PRIMARY KEY NOT NULL,

    -- 父菜单ID, 外键自引用, 允许为 NULL (表示顶级菜单)
    parent_id     TEXT,

    -- 路由路径, 不能为空
    path          TEXT NOT NULL,

    -- 路由名称, 必须唯一, 用于程序内部识别
    name          TEXT NOT NULL UNIQUE,

    -- Vue 组件的路径, 不能为空
    component_path TEXT NOT NULL,

    -- 元数据 (meta), 存储为 JSON 字符串
    -- 例如: '{"title": "系统管理", "keepAlive": "1"}'
    meta          TEXT NOT NULL,

    -- 菜单排序, 不能为空, 默认值为 0
    menu_order    INTEGER NOT NULL DEFAULT 0,

    -- 菜单图标, 允许为 NULL
    menu_icon     TEXT,

    -- 是否在菜单中隐藏 ('0': 显示, '1': 隐藏), 不能为空,默认值为 '0'
    hide          TEXT NOT NULL DEFAULT '0' CHECK(hide IN ('0', '1')),

    -- 创建时间，默认是当前时间
    created_at    TEXT DEFAULT (datetime('now', 'localtime')), 

    -- 更新时间，默认也是当前时间
    updated_at    TEXT DEFAULT (datetime('now', 'localtime')), 

    -- 外键约束, 确保 parent_id 引用的是一个存在的 id
    -- ON DELETE CASCADE 表示当父菜单被删除时, 其所有子菜单也会被级联删除
    FOREIGN KEY (parent_id) REFERENCES routes(id) ON DELETE CASCADE ON UPDATE CASCADE
);

--为常用查询字段创建索引以提高性能
CREATE INDEX IF NOT EXISTS idx_routes_parent_id ON routes_menu(parent_id);
CREATE INDEX IF NOT EXISTS idx_routes_menu_order ON routes_menu(menu_order);

-- 创建触发器  更新创建时间和更新时间
  CREATE TRIGGER IF NOT EXISTS trg_routes_menu_updated_at
  AFTER UPDATE ON routes_menu
  FOR EACH ROW
  BEGIN
      UPDATE routes_menu 
      SET updated_at = (datetime('now', 'localtime')) 
      WHERE id = NEW.id;
  END;


--SQLite 提供了 json_object() 函数，可以非常方便地将行数据转换为 JSON。
-- 创建  INSERT 触发器  
CREATE TRIGGER IF NOT EXISTS trg_routes_after_insert
AFTER INSERT ON routes
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, new_data, user_id)
    VALUES (
        'INSERT',
        'routes',
        NEW.id,
        json_object(
            'id', NEW.id,
            'parentId', NEW.parent_id,
            'path', NEW.path,
            'name', NEW.name,
            'componentPath', NEW.component_path,
            'meta', NEW.meta,
            'menuOrder', NEW.menu_order,
            'menuIcon', NEW.menu_icon,
            'hide', NEW.hide
        ),
        'SYSTEM' -- 这里可以动态传入真实 user_id, 但触发器内较难实现, 通常在应用层处理或设为默认值
    );
END;



--DELETE 触发器
CREATE TRIGGER IF NOT EXISTS trg_routes_after_delete
AFTER DELETE ON routes
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data)
    VALUES (
        'DELETE',
        'routes',
        OLD.id,
        json_object(
            'id', OLD.id,
            'parentId', OLD.parent_id,
            'path', OLD.path,
            'name', OLD.name,
            'componentPath', OLD.component_path,
            'meta', OLD.meta,
            'menuOrder', OLD.menu_order,
            'menuIcon', OLD.menu_icon,
            'hide', OLD.hide
        )
    );
END;


--UPDATE 触发器
CREATE TRIGGER IF NOT EXISTS trg_routes_after_update
AFTER UPDATE ON routes
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, old_data, new_data)
    VALUES (
        'UPDATE',
        'routes',
        NEW.id,
        json_object( -- 旧数据
            'id', OLD.id,
            'parentId', OLD.parent_id,
            'path', OLD.path,
            'name', OLD.name,
            'componentPath', OLD.component_path,
            'meta', OLD.meta,
            'menuOrder', OLD.menu_order,
            'menuIcon', OLD.menu_icon,
            'hide', OLD.hide
        ),
        json_object( -- 新数据
            'id', NEW.id,
            'parentId', NEW.parent_id,
            'path', NEW.path,
            'name', NEW.name,
            'componentPath', NEW.component_path,
            'meta', NEW.meta,
            'menuOrder', NEW.menu_order,
            'menuIcon', NEW.menu_icon,
            'hide', NEW.hide
        )
    );
END;
`
