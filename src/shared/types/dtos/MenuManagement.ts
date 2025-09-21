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

export const mockFlatRoutes: Omit<RouteRecord, 'id'>[] = [
  {
    parentId: null,
    path: 'dashboard',
    name: 'Dashboard',
    componentPath: 'Dashboard',
    meta: { title: '仪表盘', keepAlive: '1' },
    hide: '0',
    menuOrder: 0,
    menuIcon: 'DashboardOutlined'
  },
  {
    parentId: null,
    path: 'scan',
    name: 'Scan',
    componentPath: 'BasicSettings',
    meta: { title: '开始扫描', keepAlive: '0' },
    hide: '0',
    menuOrder: 10,
    menuIcon: 'ScanOutlined'
  },
  {
    parentId: null,
    path: 'scanHistory',
    name: 'ScanHistory',
    componentPath: 'ScanHistory',
    meta: { title: '扫描记录', keepAlive: '1' },
    hide: '0',
    menuOrder: 20,
    menuIcon: 'HistoryOutlined'
  },
  {
    parentId: null,
    path: 'branches',
    name: 'Branches',
    componentPath: 'BranchesView',
    meta: { title: '分支管理', keepAlive: '1' },
    hide: '0',
    menuOrder: 40,
    menuIcon: 'BranchesOutlined'
  },
  {
    parentId: null,
    path: 'analysis',
    name: 'Analysis',
    componentPath: 'CodeAnalysis',
    meta: { title: '代码分析', keepAlive: '1' },
    hide: '0',
    menuOrder: 50,
    menuIcon: 'CodeOutlined'
  },
  {
    parentId: null,
    path: 'reports',
    name: 'Reports',
    componentPath: 'Reports',
    meta: { title: '报告生成', keepAlive: '1' },
    hide: '0',
    menuOrder: 60,
    menuIcon: 'FileTextOutlined'
  },
  {
    parentId: null,
    path: 'aiChat',
    name: 'AiChat',
    componentPath: 'AiChat',
    meta: { title: 'AI Chat', keepAlive: '0' },
    hide: '0',
    menuOrder: 70,
    menuIcon: 'RobotOutlined'
  },
  {
    parentId: null,
    path: 'stock',
    name: 'Stock',
    componentPath: 'Stock',
    meta: { title: '股票分析', keepAlive: '1' },
    hide: '0',
    menuOrder: 80,
    menuIcon: 'StockOutlined'
  },
  {
    parentId: null,
    path: 'settings',
    name: 'Settings',
    componentPath: 'Settings',
    meta: { title: '设置', keepAlive: '0' },
    hide: '0',
    menuOrder: 1000,
    menuIcon: 'SettingOutlined' // 设置页面通常有个图标，即使不在主菜单
  },
  {
    parentId: null,
    path: 'chat',
    name: 'Chat',
    componentPath: 'RealTimeCommunication',
    meta: { title: 'WebSocket', keepAlive: '1' },
    hide: '0',
    menuOrder: 10000,
    menuIcon: 'CommentOutlined'
  },
  {
    parentId: null,
    path: 'systemTools',
    name: 'SystemTools',
    componentPath: 'SystemTools',
    meta: { title: 'SystemTool', keepAlive: '1' },
    hide: '0',
    menuOrder: 1001,
    menuIcon: 'CommentOutlined'
  }
]

export const menuIconArray = [
  'HomeOutlined',
  'DashboardOutlined',
  'SettingOutlined',
  'UserOutlined',
  'TeamOutlined',
  'AppstoreOutlined',
  'BlockOutlined',
  'AreaChartOutlined',
  'PieChartOutlined',
  'TableOutlined',
  'ProfileOutlined',
  'FileTextOutlined',
  'FolderOpenOutlined',
  'DatabaseOutlined',
  'LockOutlined',
  'KeyOutlined',
  'SafetyCertificateOutlined',
  'MessageOutlined',
  'NotificationOutlined',
  'ToolOutlined',
  'ControlOutlined',
  'PlusOutlined',
  'EditOutlined',
  'DeleteOutlined',
  'SearchOutlined',
  'ReloadOutlined',
  'CommentOutlined',
  'ContainerOutlined',
  'CodeOutlined',
  'AccountBookOutlined',
  'LineChartOutlined'
]
