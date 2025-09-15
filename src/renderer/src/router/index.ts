import { createRouter, createWebHashHistory, RouteRecordRaw, Router } from 'vue-router'
import MainLayout from '@components/layout/MainLayout.vue'
import NotFound from '@views/404NotFound.vue'
import { useRoutesStore } from '@/stores/routesStore'
import type { RouteRecord } from '@sharedType/MenuManagement'

const views = import.meta.glob('@views/**/*.vue')
const components = import.meta.glob('@components/**/*.vue')

const router = createRouter({
  history: createWebHashHistory(),
  routes: [] // Initialize with no routes
})
const calculatePath = (path: string) => {
  let pathMap = views,
    replaceString = 'views',
    pathPrefix = '@' + replaceString,
    pathSuffix = '/'
  if (path.includes('@')) {
    pathPrefix = ''
    pathSuffix = ''
    if (path.includes('@components')) {
      pathMap = components
      replaceString = 'components'
    }
  }
  path = pathPrefix + path
  return (
    pathMap[path.replace('@' + replaceString, '/src/' + replaceString + pathSuffix) + '.vue'] ||
    NotFound
  )
}

export function addDynamicRoutes(routerInstance: Router) {
  const routesStore = useRoutesStore() // This is now safe to call

  const mainLayoutRoute: RouteRecordRaw = {
    path: '/',
    component: MainLayout,
    children: routesStore.routes.map((route: RouteRecord): RouteRecordRaw => {
      return {
        path: route.path,
        name: route.name,
        // component: views[route.componentPath.replace('@views', '/src/views')] || NotFound,
        component: calculatePath(route.componentPath),
        meta: route.meta
      } as RouteRecordRaw
    })
  }
  mainLayoutRoute.children.push({
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '404 Not Found',
      keepAlive: '0'
    }
  })
  routerInstance.addRoute(mainLayoutRoute)
}

export default router
