import './assets/styles/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router, { addDynamicRoutes } from './router'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css' // Use reset.css for a cleaner start
import ContextMenu from '@imengyu/vue3-context-menu'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

async function bootstrap() {
  const app = createApp(App)

  // 全局错误处理
  app.config.errorHandler = (err, vm, info) => {
    console.error('Vue全局错误:', err)
    console.info('组件:', vm)
    console.info('错误信息:', info)
  }

  // 1. Install Pinia
  app.use(createPinia())

  app.use(router)

  // router.replace('/pageLoading')

  // 2. Add dynamic routes (等待数据库查完)
  await addDynamicRoutes(router)

  // 3. Install the router

  app.use(Antd)
  app.use(ContextMenu)

  // 4. Mount after routes ready
  app.mount('#app')
}

bootstrap()
