import { createRouter, createWebHashHistory, RouteRecordRaw, Router } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import NotFound from '@views/404NotFound.vue'
import { useRoutesStore, RouteRecord } from '@/stores/routesStore'

const modules = import.meta.glob('@views/**/*.vue')

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
        component: modules[route.componentPath.replace('@views', '/src/views')] || NotFound,
        meta: route.meta
      } as RouteRecordRaw
    })
  }

  routerInstance.addRoute(mainLayoutRoute)
}

export default router
