import { createRouter, createWebHashHistory, RouteRecordRaw, Router } from 'vue-router'
import MainLayout from '@components/layout/MainLayout.vue'
import NotFound from '@views/404NotFound.vue'
import ErrorPage from '@views/ErrorPage.vue' // Import the error page
import { useRoutesStore } from '@/stores/routesStore'
import { type RouteRecord } from '@sharedType/MenuManagement'
import PageLoading from '@components/Common/PageLoading.vue'

// 1. 简化组件加载逻辑
const views = import.meta.glob('@views/**/*.vue')
const components = import.meta.glob('@components/**/*.vue')

const resolveComponent = (path: string) => {
  let pathMap = views,
    pathPrefix = 'views'
  if (path.includes('views')) {
    pathMap = views
  } else if (path.includes('components')) {
    pathMap = components
    pathPrefix = ''
  }
  const fullPath = `/src/${pathPrefix ? pathPrefix + '/' : ''}${path}.vue`

  return pathMap[fullPath] || NotFound
}

function loadDynamicRoutes(routes) {
  return routes.map((route: RouteRecord) => {
    const newRoute: Partial<RouteRecordRaw> = {
      path: route.path,
      name: route.name,
      meta: route.meta
    }
    if (route.componentPath) {
      newRoute.component = resolveComponent(route.componentPath)
    }
    if (route.children && route.children.length) {
      newRoute.children = loadDynamicRoutes(route.children)
    }
    return newRoute
  })
}

// 2. 将动态路由添加逻辑封装
async function addDynamicRoutes(routerInstance: Router) {
  const routesStore = useRoutesStore()

  await routesStore.initRoutes()

  const mainLayoutRoute: RouteRecordRaw = {
    path: '/',
    component: MainLayout,
    children: [
      ...loadDynamicRoutes(routesStore.routes),
      {
        path: '/error',
        name: 'Error',
        component: ErrorPage,
        meta: { title: 'Error', keepAlive: false }
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound
      }
    ]
  }

  routerInstance.addRoute(mainLayoutRoute)
}

// 3. 导出创建和设置路由的主函数
export async function createAndSetupRouter(): Promise<Router> {
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [
      {
        path: '/pageLoading',
        name: 'PageLoading',
        component: PageLoading,
        meta: { title: 'Waiting', keepAlive: false }
      }
    ]
  })

  // Add global error handler for navigation errors
  router.onError((error, to) => {
    console.error(`Error navigating to ${to.path}:`, error)
    // Redirect to a generic error page, preserving the layout
    router.push({ name: 'Error' })
  })

  try {
    await addDynamicRoutes(router)
  } catch (error) {
    console.error('Failed to add dynamic routes:', error)
    router.push({ name: 'Error' })
  }

  router.beforeEach((to, from, next) => {
    console.log(`Navigating to ${to.path}`)
    next()
  })

  return router
}
