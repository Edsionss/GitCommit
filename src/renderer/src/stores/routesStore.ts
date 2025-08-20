import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface RouteRecord {
  path: string
  name: string
  componentPath: string // Store component path as a string
  meta: {
    title: string
    keepAlive?: boolean
  }
  isMenu: boolean
  // Children routes if any, though we are keeping it flat for now
  children?: RouteRecord[]
}

// Default routes based on the original static configuration
const defaultRoutes: RouteRecord[] = [
  {
    path: '',
    name: 'Dashboard',
    componentPath: '../views/Dashboard.vue',
    meta: { title: '仪表盘', keepAlive: true },
    isMenu: true
  },
  {
    path: 'commits',
    name: 'Commits',
    componentPath: '../views/CommitsView.vue',
    meta: { title: '提交记录', keepAlive: true },
    isMenu: true
  },
  {
    path: 'analysis',
    name: 'CodeAnalysis',
    componentPath: '../views/CodeAnalysis.vue',
    meta: { title: '代码分析', keepAlive: true },
    isMenu: true
  },
  {
    path: 'reports',
    name: 'Reports',
    componentPath: '../views/Reports.vue',
    meta: { title: '报告生成', keepAlive: true },
    isMenu: true
  },
  {
    path: 'branches',
    name: 'BranchesView',
    componentPath: '../views/BranchesView.vue',
    meta: { title: '分支管理', keepAlive: true },
    isMenu: true
  },
  {
    path: 'ai-chat',
    name: 'AiChat',
    componentPath: '../views/AiChat.vue',
    meta: { title: 'AI Chat', keepAlive: false },
    isMenu: true
  },
  // {
  //   path: 'settings',
  //   name: 'Settings',
  //   componentPath: '../views/Settings.vue',
  //   meta: { title: '设置', keepAlive: false },
  //   isMenu: true
  // },
  {
    path: 'scan',
    name: 'Scan',
    componentPath: '../views/BasicSettings.vue',
    meta: { title: '开始扫描', keepAlive: false },
    isMenu: true
  },
  {
    path: 'tableView',
    name: 'TableView',
    componentPath: '@views/TableView.vue',
    meta: { title: '提交详情', keepAlive: true },
    isMenu: false // Not a main menu item
  },
  {
    path: 'scanHistory',
    name: 'ScanHistory',
    componentPath: '@views/ScanHistory.vue',
    meta: { title: '扫描记录', keepAlive: true },
    isMenu: true
  },
  {
    path: 'routes',
    name: 'RoutesView',
    componentPath: '../views/RoutesView.vue',
    meta: { title: '路由管理', keepAlive: false },
    isMenu: false // Not a main menu item, accessed from Settings
  }
]

export const useRoutesStore = defineStore('routes', () => {
  const routes = ref<RouteRecord[]>([])

  function initRoutes() {
    const savedRoutes = localStorage.getItem('appRoutes')
    if (savedRoutes) {
      routes.value = JSON.parse(savedRoutes)
    } else {
      routes.value = defaultRoutes
      localStorage.setItem('appRoutes', JSON.stringify(defaultRoutes))
    }
  }

  function updateRoute(routeName: string, newRouteData: Partial<RouteRecord>) {
    const routeIndex = routes.value.findIndex((r) => r.name === routeName)
    if (routeIndex !== -1) {
      // Deep merge for meta object
      const oldRoute = routes.value[routeIndex]
      const newMeta = { ...oldRoute.meta, ...newRouteData.meta }
      routes.value[routeIndex] = { ...oldRoute, ...newRouteData, meta: newMeta }
      saveRoutes()
    }
  }

  function deleteRoute(routeName: string) {
    routes.value = routes.value.filter((r) => r.name !== routeName)
    saveRoutes()
  }

  function saveRoutes() {
    localStorage.setItem('appRoutes', JSON.stringify(routes.value))
  }

  // Initialize on store creation
  initRoutes()

  return {
    routes,
    initRoutes,
    updateRoute,
    deleteRoute
  }
})
