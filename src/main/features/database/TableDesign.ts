export const createTableSQL: string = `
-- 为路由记录创建一个名为 'routes' 的表
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

    -- 是否在菜单中隐藏 ('0': 显示, '1': 隐藏), 不能为空
    hide          TEXT NOT NULL DEFAULT '0' CHECK(hide IN ('0', '1')),

    -- 外键约束, 确保 parent_id 引用的是一个存在的 id
    -- ON DELETE CASCADE 表示当父菜单被删除时, 其所有子菜单也会被级联删除
    FOREIGN KEY (parent_id) REFERENCES routes(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 为常用查询字段创建索引以提高性能
CREATE INDEX IF NOT EXISTS idx_routes_parent_id ON routes_menu(parent_id);
CREATE INDEX IF NOT EXISTS idx_routes_menu_order ON routes_menu(menu_order);

`
