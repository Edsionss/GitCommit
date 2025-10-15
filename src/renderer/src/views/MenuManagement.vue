<template>
  <div class="menu-management-container">
    <a-button type="primary" @click="handleAddTopLevel" size="small" style="margin-bottom: 16px">
      <template #icon><PlusOutlined /></template>
      新增菜单目录
    </a-button>
    <a-button type="default" @click="handleSetAsDefault" size="small" style="margin-bottom: 16px; margin-left: 8px">
      <template #icon><SettingOutlined /></template>
      设置当前为默认菜单
    </a-button>

    <MenuList
      :data="menuTreeData"
      :loading="loading"
      @edit="handleEdit"
      @add-child="handleAddChild"
      @delete="handleDelete"
    />

    <MenuModal
      :visible="modalState.visible"
      :is-edit="modalState.isEdit"
      :initial-data="modalState.currentItem"
      :parent-data="modalState.parentItem"
      :isDirectory="modalState.isDirectory"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { PlusOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { message as AntMessage } from 'ant-design-vue'
import MenuList from '@components/MenuManagement/MenuList.vue'
import MenuModal from '@components/MenuManagement/MenuModal.vue'
import type { RouteRecord } from '@sharedType/MenuManagement'
import { useRoutesStore } from '@/stores/routesStore'
const routesStore = useRoutesStore()
const { routes } = storeToRefs(routesStore)
const { addRoute, deleteRoute, updateRoute } = routesStore
import { copyNormalize } from '@utils/index'
import { routesMenuApi } from '@api/routesMenu'
// --- 状态管理 ---
const loading = ref(false)
const menuTreeData = ref<RouteRecord[]>([])
const modalState = reactive({
  visible: false,
  isEdit: false,
  currentItem: null as RouteRecord | null, // 当前操作（编辑）的项
  parentItem: null as RouteRecord | null, // 新增子项时的父项
  isDirectory: false
})
menuTreeData.value = routes.value
const resetModalState = () => {
  modalState.visible = false
  modalState.isEdit = false
  modalState.currentItem = null
  modalState.parentItem = null
}

// 新增顶级菜单
const handleAddTopLevel = () => {
  modalState.isEdit = false
  modalState.currentItem = null
  modalState.parentItem = null
  modalState.visible = true
  modalState.isDirectory = true
}

// 新增子菜单
const handleAddChild = (parent: RouteRecord) => {
  modalState.isEdit = false
  modalState.currentItem = null
  modalState.parentItem = parent
  modalState.visible = true
  modalState.isDirectory = false
}

// 编辑菜单
const handleEdit = (record: RouteRecord) => {
  modalState.isEdit = true
  modalState.currentItem = { ...record } // 传入副本，避免直接修改源数据
  // 找到父节点
  modalState.parentItem = record.parentId
    ? routes.value.find((item) => item.id === record.parentId) || null
    : null
  modalState.visible = true
}

// 删除菜单
const handleDelete = (id: string) => {
  deleteRoute(id)
}

// 弹窗确认
const handleModalOk = async (formData: Omit<RouteRecord, 'id' | 'children'>) => {
  const record = copyNormalize(formData)
  if (modalState.isEdit && modalState.currentItem) {
    // 编辑逻辑
    await updateRoute(record)
  } else {
    // 新增逻辑 计算完整路由路径
    if (record.parentId && modalState.parentItem) {
      record.path = `${modalState.parentItem.path}/${record.path}`
    }
    await addRoute(record)
  }
  modalState.visible = true
  resetModalState()
}

// 弹窗取消
const handleModalCancel = () => {
  resetModalState()
}

// 设置当前菜单为默认菜单
const handleSetAsDefault = async () => {
  try {
    const { success, error } = await routesMenuApi.setAsDefault()
    if (success) {
      AntMessage.success('设置默认菜单成功')
    } else {
      AntMessage.error(`设置默认菜单失败: ${error || '未知错误'}`)
    }
  } catch (error) {
    console.error('Failed to set as default menu:', error)
    AntMessage.error('设置默认菜单失败')
  }
}
</script>

<style scoped></style>
