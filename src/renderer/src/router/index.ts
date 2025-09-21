import { createRouter, createWebHashHistory, RouteRecordRaw, Router } from 'vue-router'
import MainLayout from '@components/layout/MainLayout.vue'
import NotFound from '@views/404NotFound.vue'
import { useRoutesStore } from '@/stores/routesStore'
import { type RouteRecord } from '@sharedType/MenuManagement'
import PageLoading from '@components/Common/PageLoading.vue'

// 1. 简化组件加载逻辑
// 使用更具体的 glob 模式，让路径更清晰
const views = import.meta.glob('@views/**/*.vue')
const components = import.meta.glob('@components/**/*.vue')

const resolveComponent = (path: string) => {
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

// 2. 将动态路由添加逻辑封装
async function addDynamicRoutes(routerInstance: Router) {
  const routesStore = useRoutesStore()

  // 让 store 内部处理初始化逻辑，更符合单一职责原则
  await routesStore.initRoutes()

  // 如果 store 是空的，可以填充 mock 数据 (这个逻辑最好放在 store 内部)
  if (!routesStore.routes.length) {
    await routesStore.restRoutes()
  }

  const mainLayoutRoute: RouteRecordRaw = {
    path: '/',
    component: MainLayout,
    // redirect: '/dashboard', // 最好有一个默认的重定向
    children: routesStore.routes.map(
      (route: RouteRecord): RouteRecordRaw => ({
        path: route.path,
        name: route.name,
        component: resolveComponent(route.componentPath),
        meta: route.meta
      })
    )
  }

  mainLayoutRoute.children.push({
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  })
  routerInstance.addRoute(mainLayoutRoute)
}

// 3. 导出创建和设置路由的主函数
export async function createAndSetupRouter(): Promise<Router> {
  const router = createRouter({
    history: createWebHashHistory(),
    // 初始路由可以只包含一些公共路由，如登录页
    routes: [
      {
        path: '/pageLoading',
        name: 'PageLoading',
        component: PageLoading,
        meta: { title: 'Waiting', keepAlive: false }
      }
      // { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') }
    ]
  })

  // 在这里等待动态路由添加完成
  try {
    await addDynamicRoutes(router)
  } catch (error) {
    console.error('Failed to add dynamic routes:', error)
    // 这里可以处理路由加载失败的逻辑，比如重定向到一个错误页面
    // router.push('/error');
  }

  // 移除复杂的 beforeEach 守卫，可以替换为简单的权限守卫
  router.beforeEach((to, from, next) => {
    // 例如：检查 token
    // const hasToken = getToken();
    // if (to.path !== '/login' && !hasToken) {
    //   next({ path: '/login' });
    // } else {
    //   next();
    // }
    console.log(`Navigating to ${to.path}`)
    next()
  })

  return router
}
