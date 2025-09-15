// 定义菜单项的数据结构

export interface RouteRecord {
  id: string // 菜单ID
  parentId: string | null // 父菜单ID
  path: string // 路由路径 (如：/system)
  name: string // 路由名称 (如：System)，必须唯一
  componentPath: string // 组件路径 (如：layouts/BasicLayout)
  meta: {
    title: string // 菜单标题 (如：系统管理)
    keepAlive?: '0' | '1' // 是否缓存该路由
  }
  children?: RouteRecord[] // 子菜单
  menuOrder: number // 菜单顺序
  menuIcon?: string // 菜单图标
  hide: string
}
