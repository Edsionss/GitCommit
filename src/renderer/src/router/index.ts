import { createRouter, createWebHashHistory, RouteRecordRaw, Router } from 'vue-router'
import MainLayout from '@components/layout/MainLayout.vue'
import NotFound from '@views/404NotFound.vue'
import { useRoutesStore } from '@/stores/routesStore'
import { mockFlatRoutes, type RouteRecord } from '@sharedType/MenuManagement'
import { storeToRefs } from 'pinia'
import PageLoading from '@components/Common/PageLoading.vue'

const views = import.meta.glob('@views/**/*.vue')
const components = import.meta.glob('@components/**/*.vue')

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/pageLoading',
      name: 'PageLoading',
      component: PageLoading,
      meta: { title: 'Waiting', keepAlive: false }
    }
  ] // Initialize with no routes
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

export async function addDynamicRoutes(routerInstance: Router) {
  const routesStore = useRoutesStore()
  await routesStore.initRoutes() // 等待数据库

  const { routes } = storeToRefs(routesStore)

  routes.value.length || (await routesStore.addRoutes(mockFlatRoutes))

  const mainLayoutRoute: RouteRecordRaw = {
    path: '/',
    component: MainLayout,
    children: routes.value.map((route: RouteRecord): RouteRecordRaw => {
      return {
        path: route.path,
        name: route.name,
        component: calculatePath(route.componentPath),
        meta: route.meta
      }
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

  // 🚀 动态路由加载完成后，跳转到第一个路由或者首页
  if (routes.value.length > 0) {
    routerInstance.replace(routes.value[1].path)
  }
}

export default router
