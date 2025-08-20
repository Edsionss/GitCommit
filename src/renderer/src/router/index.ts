import { createRouter, createWebHashHistory, RouteRecordRaw, Router } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import { useRoutesStore, RouteRecord } from '@/stores/routesStore'

// A map to resolve component paths to actual dynamic imports
const componentMap = {
  '../views/Dashboard.vue': () => import('../views/Dashboard.vue'),
  '../views/CommitsView.vue': () => import('../views/CommitsView.vue'),
  '../views/CodeAnalysis.vue': () => import('../views/CodeAnalysis.vue'),
  '../views/Reports.vue': () => import('../views/Reports.vue'),
  '../views/BranchesView.vue': () => import('../views/BranchesView.vue'),
  '../views/AiChat.vue': () => import('../views/AiChat.vue'),
  '../views/Settings.vue': () => import('../views/Settings.vue'),
  '../views/BasicSettings.vue': () => import('../views/BasicSettings.vue'),
  '@views/TableView.vue': () => import('@views/TableView.vue'),
  '@views/ScanHistory.vue': () => import('@views/ScanHistory.vue'),
  '../views/RoutesView.vue': () => import('../views/RoutesView.vue')
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [] // Initialize with no routes
})

export function addDynamicRoutes(routerInstance: Router) {
  const routesStore = useRoutesStore() // This is now safe to call

  const mainLayoutRoute: RouteRecordRaw = {
    path: '/',
    component: MainLayout,
    children: routesStore.routes.map((route: RouteRecord): RouteRecordRaw => {
      return {
        path: route.path,
        name: route.name,
        component: componentMap[route.componentPath],
        meta: route.meta
      } as RouteRecordRaw
    })
  }

  routerInstance.addRoute(mainLayoutRoute)
}

export default router
