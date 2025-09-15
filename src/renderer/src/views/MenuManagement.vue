<template>
  <div class="menu-management-container">
    <a-button type="primary" @click="handleAddTopLevel" size="small" style="margin-bottom: 16px">
      <template #icon><PlusOutlined /></template>
      新增菜单目录
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
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import MenuList from '@components/MenuManagement/MenuList.vue'
import MenuModal from '@components/MenuManagement/MenuModal.vue'
import { type RouteRecord } from '@type/MenuManagement'
import { buildTree } from '@utils/index'
import { v4 as uuidv4 } from 'uuid' // 使用 uuid 生成唯一ID
import { useRoutesStore } from '@/stores/routesStore'
const routesStore = useRoutesStore()
const { routes } = storeToRefs(routesStore)
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
menuTreeData.value = buildTree(routes.value)
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
  Modal.confirm({
    title: '确认删除',
    content: '此操作将永久删除该菜单及其所有子菜单，是否继续？',
    onOk: async () => {
      // 模拟API删除
      const idsToDelete = new Set<string>([id])
      const findChildren = (parentId: string) => {
        routes.value.forEach((item) => {
          if (item.parentId === parentId) {
            idsToDelete.add(item.id)
            findChildren(item.id)
          }
        })
      }
      findChildren(id)

      routes.value = routes.value.filter((item) => !idsToDelete.has(item.id))
      message.success('删除成功')
    }
  })
}

// 弹窗确认
const handleModalOk = async (formData: Omit<RouteRecord, 'id' | 'children'>) => {
  if (modalState.isEdit && modalState.currentItem) {
    // 编辑逻辑
    const index = routes.value.findIndex((item) => item.id === modalState.currentItem!.id)
    if (index !== -1) {
      routes.value[index] = { ...routes.value[index], ...formData }
      message.success('更新成功')
    }
  } else {
    // 新增逻辑
    const newMenuItem: RouteRecord = {
      ...formData,
      id: uuidv4() // 生成唯一ID
    }
    routes.value.push(newMenuItem)
    message.success('新增成功')
  }
  resetModalState()
}

// 弹窗取消
const handleModalCancel = () => {
  resetModalState()
}
</script>

<style scoped></style>
