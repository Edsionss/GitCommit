import './assets/styles/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createAndSetupRouter } from './router'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import ContextMenu from '@imengyu/vue3-context-menu'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn') // 👈 全局设置一次即可
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

  // 1. 创建并异步设置好路由
  const router = await createAndSetupRouter()

  // 2. 将完全配置好的路由实例提供给应用
  app.use(router)

  // 3. Install Antd 和 ContextMenu
  app.use(Antd)
  app.use(ContextMenu)

  // 4. Mount app
  app.mount('#app')
}
// 启动应用
bootstrap()
