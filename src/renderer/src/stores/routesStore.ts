import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface RouteRecord {
  path: string
  name: string
  componentPath: string
  meta: {
    title: string
    keepAlive?: boolean
  }
  isMenu: boolean
  menuOrder: number
  children?: RouteRecord[]
}

const defaultRoutes: RouteRecord[] = [
  {
    path: '',
    name: 'Dashboard',
    componentPath: '../views/Dashboard.vue',
    meta: { title: '仪表盘', keepAlive: true },
    isMenu: true,
    menuOrder: 0
  },
  {
    path: 'scan',
    name: 'Scan',
    componentPath: '../views/BasicSettings.vue',
    meta: { title: '开始扫描', keepAlive: false },
    isMenu: true,
    menuOrder: 10
  },
  {
    path: 'scanHistory',
    name: 'ScanHistory',
    componentPath: '@views/ScanHistory.vue',
    meta: { title: '扫描记录', keepAlive: true },
    isMenu: true,
    menuOrder: 20
  },
  {
    path: 'commits',
    name: 'Commits',
    componentPath: '../views/CommitsView.vue',
    meta: { title: '提交记录', keepAlive: true },
    isMenu: true,
    menuOrder: 30
  },
  {
    path: 'branches',
    name: 'BranchesView',
    componentPath: '../views/BranchesView.vue',
    meta: { title: '分支管理', keepAlive: true },
    isMenu: true,
    menuOrder: 40
  },
  {
    path: 'analysis',
    name: 'CodeAnalysis',
    componentPath: '../views/CodeAnalysis.vue',
    meta: { title: '代码分析', keepAlive: true },
    isMenu: true,
    menuOrder: 50
  },
  {
    path: 'reports',
    name: 'Reports',
    componentPath: '../views/Reports.vue',
    meta: { title: '报告生成', keepAlive: true },
    isMenu: true,
    menuOrder: 60
  },
  {
    path: 'ai-chat',
    name: 'AiChat',
    componentPath: '../views/AiChat.vue',
    meta: { title: 'AI Chat', keepAlive: false },
    isMenu: true,
    menuOrder: 70
  },
  {
    path: 'tableView',
    name: 'TableView',
    componentPath: '@views/TableView.vue',
    meta: { title: '提交详情', keepAlive: true },
    isMenu: false,
    menuOrder: 998
  },
  {
    path: 'routes',
    name: 'RoutesView',
    componentPath: '../views/RoutesView.vue',
    meta: { title: '路由管理', keepAlive: false },
    isMenu: false,
    menuOrder: 999
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

  initRoutes()

  return {
    routes,
    initRoutes,
    updateRoute,
    deleteRoute
  }
})
