import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MergeArray, buildTree } from '@/utils'
import { routesMenuApi } from '@api/routesMenu'
import { type RouteRecord, RouteRecordWithOptionalId } from '@sharedType/MenuManagement'
import { message as AntMessage } from 'ant-design-vue'
import { DEFAULT_MENU_MAP } from '@config/index'

export const useRoutesStore = defineStore('routes', () => {
  const routes = ref<RouteRecord[]>([])

  async function initRoutes() {
    try {
      const backendRoutes = await routesMenuApi.getAll()
      // 如果 store 是空的，可以填充 mock 数据
      if (backendRoutes.length === 0) {
        await restRoutes()
      }
      routes.value = buildTree(backendRoutes)
    } catch (error) {
      console.error('Failed to initialize routes:', error)
      routes.value = [] // or set to some default/error state
    }
  }

  async function restRoutes() {
    try {
      await routesMenuApi.clean()
      await routesMenuApi.addMany(DEFAULT_MENU_MAP)
      await initRoutes()
      // 刷新路由
      location.reload()
      AntMessage.success('重置成功')
    } catch (error) {
      console.error('Failed to clean and add routes:', error)
    }
  }

  async function addRoute(menu: Omit<RouteRecord, 'id'>) {
    try {
      await routesMenuApi.add(menu)
      await initRoutes() // Re-fetch all routes to reflect the new state
      AntMessage.success('添加成功')
    } catch (error) {
      console.error('Failed to add route:', error)
      throw error
    }
  }

  async function addRoutes(menus: RouteRecordWithOptionalId[]) {
    try {
      await routesMenuApi.addMany(menus)
      await initRoutes() // Re-fetch all routes to reflect the new state
      AntMessage.success('添加成功')
    } catch (error) {
      console.error('Failed to add route:', error)
      throw error
    }
  }

  async function updateRoute(menu: Partial<RouteRecord>) {
    try {
      await routesMenuApi.update(menu)
      await initRoutes() // Re-fetch to get the updated tree structure
      AntMessage.success('更新成功')
    } catch (error) {
      console.error('Failed to update route:', error)
      throw error
    }
  }

  async function deleteRoute(id: string) {
    try {
      await routesMenuApi.delete(id)
      AntMessage.success('删除成功')
      await initRoutes() // Re-fetch all routes
    } catch (error) {
      console.error('Failed to delete route:', error)
      throw error
    }
  }

  // initRoutes() // It's better to call this from the root component, e.g., App.vue

  return {
    routes,
    initRoutes,
    restRoutes,
    addRoute,
    addRoutes,
    updateRoute,
    deleteRoute
  }
})
