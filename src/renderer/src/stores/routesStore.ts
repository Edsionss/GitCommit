import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MergeArray } from '@/utils'
import { storeApi } from '@/api/store'
import type { RouteRecord } from '@sharedType/MenuManagement'

export const mockFlatRoutes: RouteRecord[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
    id: '5',
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
    id: '6',
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
    id: '7',
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
    id: '8',
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
    id: '10',
    parentId: null,
    path: 'settings',
    name: 'Settings',
    componentPath: 'Settings',
    meta: { title: '设置', keepAlive: '0' },
    hide: '0',
    menuOrder: 1000,
    menuIcon: 'SettingOutlined' // 设置页面通常有个图标，即使不在主菜单
  }
]

const storeLoadAppRoutes = (success: (settings: RouteRecord[]) => void = () => {}) => {
  storeApi.get('AppRoutes').then((AppRoutes) => {
    success(AppRoutes || mockFlatRoutes)
  })
}

export const useRoutesStore = defineStore('routes', () => {
  const routes = ref<RouteRecord[]>([])

  function initRoutes() {
    // storeLoadAppRoutes((AppRoutes) => {
    //   if (AppRoutes) {
    //     routes.value = MergeArray(defaultRoutes, AppRoutes, true, 'path')
    //   } else {
    //     routes.value = defaultRoutes
    //     // storeApi.set('AppRoutes', JSON.parse(JSON.stringify(defaultRoutes)))
    //     saveRoutes()
    //   }
    // })
    // storeApi.get('AppRoutes').then((AppRoutes) => {
    //   if (AppRoutes) {
    //     routes.value = MergeArray(defaultRoutes, AppRoutes, true, 'path')
    //   } else {
    //     routes.value = defaultRoutes
    //     // storeApi.set('AppRoutes', JSON.parse(JSON.stringify(defaultRoutes)))
    //     saveRoutes()
    //   }
    // })
    const savedRoutes = localStorage.getItem('AppRoutes')
    if (savedRoutes) {
      const currentRoutes = JSON.parse(savedRoutes)
      routes.value = MergeArray(mockFlatRoutes, currentRoutes, true, 'path')
    } else {
      routes.value = mockFlatRoutes
      // localStorage.setItem('AppRoutes', JSON.stringify(mockFlatRoutes))
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

  function saveRoutes(AppRoutes?: RouteRecord) {
    // localStorage.setItem('AppRoutes', JSON.stringify(routes.value))
    storeApi.set('AppRoutes', JSON.parse(JSON.stringify(AppRoutes || routes.value)))
  }

  initRoutes()

  return {
    routes,
    initRoutes,
    updateRoute,
    deleteRoute
  }
})
