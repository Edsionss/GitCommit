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
// 定义一个新类型，其中 id 是可选的
export type RouteRecordWithOptionalId = Omit<RouteRecord, 'id'> & Partial<Pick<RouteRecord, 'id'>>

export const mockFlatRoutes: RouteRecordWithOptionalId[] = [
  // 首页
  {
    id: 'IG1bzaXsigzD8gt1DwDNj',
    parentId: null,
    path: 'dashboard',
    name: 'Dashboard',
    componentPath: 'Dashboard',
    meta: {
      title: '仪表盘',
      keepAlive: '1'
    },
    menuOrder: 0,
    menuIcon: 'DashboardOutlined',
    hide: '0'
  },
  //  股票功能
  {
    id: 'AnusIQBdiS5ZbLx4E8ata',
    parentId: null,
    path: 'stock',
    name: 'Stock',
    componentPath: '',
    meta: {
      title: 'Stock',
      keepAlive: '0'
    },
    menuOrder: 0,
    menuIcon: 'AppstoreOutlined',
    hide: '0'
  },
  {
    id: 'VKhLEzgdxdRen-hvhXVNv',
    parentId: 'AnusIQBdiS5ZbLx4E8ata',
    path: 'marketNewsflash',
    name: 'MarketNewsflash',
    componentPath: 'components/Stock/MarketNewsflash/index',
    meta: {
      title: '市场资讯',
      keepAlive: '0'
    },
    menuOrder: 0,
    menuIcon: 'TeamOutlined',
    hide: '0'
  },
  {
    id: '0RFZKpv4szQ-BxhBQ-wpj',
    parentId: 'AnusIQBdiS5ZbLx4E8ata',
    path: 'stockList',
    name: 'StockList',
    componentPath: 'components/Stock/StockList/index',
    meta: {
      title: '股票自选',
      keepAlive: '1'
    },
    menuOrder: 0,
    menuIcon: 'SafetyCertificateOutlined',
    hide: '0'
  },
  {
    id: '_GpOkXJWmoxP-_cIhH-9F',
    parentId: 'AnusIQBdiS5ZbLx4E8ata',
    path: 'marketQuotation',
    name: 'MarketQuotation',
    componentPath: '',
    meta: {
      title: '市场行情',
      keepAlive: '0'
    },
    menuOrder: 0,
    menuIcon: 'SafetyCertificateOutlined',
    hide: '0'
  },
  {
    id: '',
    parentId: '_GpOkXJWmoxP-_cIhH-9F',
    path: 'industrySector',
    name: 'IndustrySector',
    componentPath: 'components/Stock/MarketQuotation/IndustrySector',
    meta: {
      title: '行业板块',
      keepAlive: '0'
    },
    menuOrder: 0,
    menuIcon: 'SafetyCertificateOutlined',
    hide: '0'
  },
  {
    id: '',
    parentId: '_GpOkXJWmoxP-_cIhH-9F',
    path: 'dragonTigerList',
    name: 'DragonTigerList',
    componentPath: 'components/Stock/MarketQuotation/DragonTigerList',
    meta: {
      title: '龙虎榜',
      keepAlive: '0'
    },
    menuOrder: 0,
    menuIcon: 'SafetyCertificateOutlined',
    hide: '0'
  },
  {
    id: '',
    parentId: '_GpOkXJWmoxP-_cIhH-9F',
    path: 'capitalFlow',
    name: 'CapitalFlow',
    componentPath: 'components/Stock/MarketQuotation/CapitalFlow',
    meta: {
      title: '资金流向',
      keepAlive: '0'
    },
    menuOrder: 0,
    menuIcon: 'SafetyCertificateOutlined',
    hide: '0'
  },
  {
    id: '',
    parentId: '_GpOkXJWmoxP-_cIhH-9F',
    path: 'globalMarkets',
    name: 'GlobalMarkets',
    componentPath: 'components/Stock/MarketQuotation/GlobalMarkets',
    meta: {
      title: '全球股市',
      keepAlive: '0'
    },
    menuOrder: 0,
    menuIcon: 'SafetyCertificateOutlined',
    hide: '0'
  },
  {
    id: '',
    parentId: '_GpOkXJWmoxP-_cIhH-9F',
    path: 'marketHotspots',
    name: 'MarketHotspots',
    componentPath: 'components/Stock/MarketQuotation/MarketHotspots',
    meta: {
      title: '市场热点',
      keepAlive: '0'
    },
    menuOrder: 0,
    menuIcon: 'SafetyCertificateOutlined',
    hide: '0'
  },
  {
    id: 'auPRcV_br3gMhu2tzRDPS',
    parentId: null,
    path: 'stockAll',
    name: 'stockAll',
    componentPath: 'Stock',
    meta: {
      title: '股票分析',
      keepAlive: '1'
    },
    menuOrder: 80,
    menuIcon: 'StockOutlined',
    hide: '1'
  },
  //  GitLab 功能
  {
    id: '9iMNgIHCV2gTG8D3_97-bi0z',
    parentId: null,
    path: 'git',
    name: 'Git',
    componentPath: '',
    meta: {
      title: 'GitLab',
      keepAlive: '0'
    },
    menuOrder: 10,
    menuIcon: 'ScanOutlined',
    hide: '0'
  },
  {
    id: 'bbsyp1V2agdfeTKGK8KoX',
    parentId: '9iMNgIHCV2gTG8D3_97-bi0z',
    path: 'scan',
    name: 'Scan',
    componentPath: 'BasicSettings',
    meta: {
      title: '开始扫描',
      keepAlive: '0'
    },
    menuOrder: 10,
    menuIcon: 'ScanOutlined',
    hide: '0'
  },
  {
    id: '3jzQig2z8gK6uJox576M5',
    parentId: '9iMNgIHCV2gTG8D3_97-bi0z',
    path: 'scanHistory',
    name: 'ScanHistory',
    componentPath: 'ScanHistory',
    meta: {
      title: '扫描记录',
      keepAlive: '1'
    },
    menuOrder: 20,
    menuIcon: 'HistoryOutlined',
    hide: '0'
  },
  {
    id: 'BBQYE5BPVVjr_7afMEDlg',
    parentId: '9iMNgIHCV2gTG8D3_97-bi0z',
    path: 'branches',
    name: 'Branches',
    componentPath: 'BranchesView',
    meta: {
      title: '分支管理',
      keepAlive: '1'
    },
    menuOrder: 40,
    menuIcon: 'BranchesOutlined',
    hide: '0'
  },
  {
    id: 'qoNsEEMsNGIijpYlb-LMP',
    parentId: '9iMNgIHCV2gTG8D3_97-bi0z',
    path: 'analysis',
    name: 'Analysis',
    componentPath: 'CodeAnalysis',
    meta: {
      title: '代码分析',
      keepAlive: '1'
    },
    menuOrder: 50,
    menuIcon: 'CodeOutlined',
    hide: '0'
  },
  {
    id: 'IIxcVfeNUGtEjYbIX_cdh',
    parentId: '9iMNgIHCV2gTG8D3_97-bi0z',
    path: 'reports',
    name: 'Reports',
    componentPath: 'Reports',
    meta: {
      title: '报告生成',
      keepAlive: '1'
    },
    menuOrder: 60,
    menuIcon: 'FileTextOutlined',
    hide: '0'
  },
  // AI功能
  {
    id: 'YWxboacI121N0X8aqTBOg',
    parentId: null,
    path: 'aiChat',
    name: 'AiChat',
    componentPath: 'AiChat',
    meta: {
      title: 'AI Chat',
      keepAlive: '0'
    },
    menuOrder: 70,
    menuIcon: 'RobotOutlined',
    hide: '0'
  },
  {
    id: 'XyZboacI121N0X8aqTBOg',
    parentId: null,
    path: 'aiChatX',
    name: 'AiChatX',
    componentPath: 'AiChatX',
    meta: {
      title: 'AI Chat X',
      keepAlive: '0'
    },
    menuOrder: 71,
    menuIcon: 'RobotOutlined',
    hide: '0'
  },

  // 应用系统功能
  {
    id: 'application_system',
    parentId: null,
    path: 'system',
    name: 'System',
    componentPath: '',
    meta: { title: 'ApplicationSystem', keepAlive: '0' },
    menuOrder: 2,
    menuIcon: 'SettingOutlined',
    hide: '0'
  },
  {
    id: '',
    parentId: 'application_system',
    path: 'auditLog',
    name: 'AuditLog',
    componentPath: 'AuditLog',
    meta: {
      title: '日志管理',
      keepAlive: '1'
    },
    menuOrder: 10000,
    menuIcon: 'CommentOutlined',
    hide: '0'
  },
  {
    id: '',
    parentId: 'application_system',
    path: 'systemLog',
    name: 'SystemLog',
    componentPath: 'SystemLog',
    meta: {
      title: '控制台日志',
      keepAlive: '1'
    },
    menuOrder: 10001,
    menuIcon: 'FileTextOutlined',
    hide: '0'
  },

  // 设置
  {
    id: 'QJJ0Crd8FRbsY-Q_fDT6p',
    parentId: null,
    path: 'settings',
    name: 'Settings',
    componentPath: 'Settings',
    meta: {
      title: '设置',
      keepAlive: '0'
    },
    menuOrder: 1000,
    menuIcon: 'SettingOutlined',
    hide: '1'
  },

  // 工作台功能
  {
    id: 'Workbench_task',
    parentId: null,
    path: 'workbench',
    name: 'Workbench',
    componentPath: 'AutoWriteWorkRepo',
    meta: {
      title: 'Workbench',
      keepAlive: '1'
    },
    menuOrder: 10000,
    menuIcon: 'CommentOutlined',
    hide: '0'
  },
  {
    id: '',
    parentId: 'Workbench_task',
    path: 'autoWriteWorkRepo',
    name: 'AutoWriteWorkRepo',
    componentPath: 'AutoWriteWorkRepo',
    meta: {
      title: '自动化工作',
      keepAlive: '1'
    },
    menuOrder: 10000,
    menuIcon: 'CommentOutlined',
    hide: '0'
  },
  {
    id: '',
    parentId: 'Workbench_task',
    path: 'scriptManagement',
    name: 'ScriptManagement',
    componentPath: 'ScriptManagement',
    meta: {
      title: '脚本管理',
      keepAlive: '1'
    },
    menuOrder: 95,
    menuIcon: 'CodeSandboxOutlined',
    hide: '0'
  },
  {
    id: '',
    parentId: 'Workbench_task',
    path: 'scheduler',
    name: 'Scheduler',
    componentPath: 'Scheduler',
    meta: {
      title: '定时任务',
      keepAlive: '1'
    },
    menuOrder: 90,
    menuIcon: 'ControlOutlined',
    hide: '0'
  },
  {
    id: '3xPTToKm4_uwjHAHGX1C7',
    parentId: 'Workbench_task',
    path: 'systemTools',
    name: 'SystemTools',
    componentPath: 'SystemTools',
    meta: {
      title: 'SystemTool',
      keepAlive: '1'
    },
    menuOrder: 1001,
    menuIcon: 'CommentOutlined',
    hide: '0'
  },
  // 通信 功能
  {
    id: 'Communication_chat',
    parentId: null,
    path: 'communication',
    name: 'Communication',
    componentPath: '',
    meta: {
      title: '通信',
      keepAlive: '1'
    },
    menuOrder: 85,
    menuIcon: 'NotificationOutlined',
    hide: '0'
  },
  {
    id: '',
    parentId: 'Communication_chat',
    path: 'ntfyNotification',
    name: 'NtfyNotification',
    componentPath: 'NtfyNotification',
    meta: {
      title: '消息推送',
      keepAlive: '1'
    },
    menuOrder: 85,
    menuIcon: 'NotificationOutlined',
    hide: '0'
  },
  {
    id: 'HJ-8kf2i6Zz-_jJArgq_Q',
    parentId: 'Communication_chat',
    path: 'chat',
    name: 'Chat',
    componentPath: 'RealTimeCommunication',
    meta: {
      title: 'WebSocket',
      keepAlive: '1'
    },
    menuOrder: 10000,
    menuIcon: 'CommentOutlined',
    hide: '0'
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
  'LineChartOutlined',
  'CodeSandboxOutlined'
]
