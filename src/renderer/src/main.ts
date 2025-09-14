import './assets/styles/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router, { addDynamicRoutes } from './router'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css' // Use reset.css for a cleaner start
import ContextMenu from '@imengyu/vue3-context-menu'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue全局错误:', err)
  console.info('组件:', vm)
  console.info('错误信息:', info)
}

// 1. Install Pinia
app.use(createPinia())

// 2. Add dynamic routes AFTER Pinia is initialized
addDynamicRoutes(router)

// 3. Install the router
app.use(router)

app.use(Antd)
app.use(ContextMenu)

app.mount('#app')
