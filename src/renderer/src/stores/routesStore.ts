import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MergeArray, buildTree } from '@/utils'
import { routesMenuApi } from '@api/routesMenu'
import { type RouteRecord, RouteRecordWithOptionalId } from '@sharedType/MenuManagement'
import { message as AntMessage } from 'ant-design-vue'
import { DEFAULT_MENU_MAP } from '@config/index'

export const useRoutesStore = defineStore('routes', () => {
  const routes = ref<RouteRecord[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)

  async function initRoutes() {
    // 如果已经初始化过，直接返回
    if (isInitialized.value) {
      return
    }

    try {
      isLoading.value = true
      const backendRoutes = await routesMenuApi.getAll()
      // 如果 store 是空的，可以填充 mock 数据
      if (backendRoutes.length === 0) {
        await restRoutes()
      } else {
        routes.value = buildTree(backendRoutes)
        isInitialized.value = true
      }
    } catch (error) {
      console.error('Failed to initialize routes:', error)
      routes.value = [] // or set to some default/error state
    } finally {
      isLoading.value = false
    }
  }

  async function restRoutes() {
    try {
      isLoading.value = true
      await routesMenuApi.clean()
      await routesMenuApi.addMany(DEFAULT_MENU_MAP)
      const backendRoutes = await routesMenuApi.getAll()
      routes.value = buildTree(backendRoutes)
      isInitialized.value = true
      // 刷新路由
      location.reload()
      AntMessage.success('重置成功')
    } catch (error) {
      console.error('Failed to clean and add routes:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function addRoute(menu: Omit<RouteRecord, 'id'>) {
    try {
      await routesMenuApi.add(menu)
      await refreshRoutes() // 使用新的刷新方法
      AntMessage.success('添加成功')
    } catch (error) {
      console.error('Failed to add route:', error)
      throw error
    }
  }

  async function addRoutes(menus: RouteRecordWithOptionalId[]) {
    try {
      await routesMenuApi.addMany(menus)
      await refreshRoutes() // 使用新的刷新方法
      AntMessage.success('添加成功')
    } catch (error) {
      console.error('Failed to add route:', error)
      throw error
    }
  }

  async function updateRoute(menu: Partial<RouteRecord>) {
    try {
      await routesMenuApi.update(menu)
      await refreshRoutes() // 使用新的刷新方法
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
      await refreshRoutes() // 使用新的刷新方法
    } catch (error) {
      console.error('Failed to delete route:', error)
      throw error
    }
  }

  // 新增：专门用于刷新路由数据的方法
  async function refreshRoutes() {
    try {
      const backendRoutes = await routesMenuApi.getAll()
      routes.value = buildTree(backendRoutes)
    } catch (error) {
      console.error('Failed to refresh routes:', error)
    }
  }

  // 新增：强制重新初始化路由
  async function forceInitRoutes() {
    isInitialized.value = false
    await initRoutes()
  }

  return {
    routes,
    isLoading,
    isInitialized,
    initRoutes,
    forceInitRoutes,
    restRoutes,
    addRoute,
    addRoutes,
    updateRoute,
    deleteRoute,
    refreshRoutes
  }
})
