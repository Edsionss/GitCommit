<template>
  <div class="routes-view-container">
    <h2 class="page-title">菜单与路由管理</h2>
    <a-table
      :columns="columns"
      :data-source="routes"
      :row-key="'name'"
      :pagination="false"
      bordered
    >
      <template #expandIcon="{ expanded, onExpand, record }">
        <a @click="(e) => onExpand(record, e)" style="margin-right: 8px">
          <DownOutlined v-if="expanded" :rotate="180" />
          <RightOutlined v-else />
        </a>
      </template>

      <template #expandedRowRender="{ record }">
        <a-descriptions bordered size="small">
          <a-descriptions-item label="路由名称 (Name)">{{ record.name }}</a-descriptions-item>
          <a-descriptions-item label="菜单名称 (Title)">{{
            record.meta.title
          }}</a-descriptions-item>
          <a-descriptions-item label="路由路径 (Path)">{{ record.path }}</a-descriptions-item>
          <a-descriptions-item label="组件路径 (Component)">{{
            record.componentPath
          }}</a-descriptions-item>
          <a-descriptions-item label="设为菜单 (isMenu)">
            <a-tag :color="record.isMenu ? 'green' : 'red'">{{ record.isMenu }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="缓存页面 (keepAlive)">
            <a-tag :color="record.meta.keepAlive ? 'green' : 'red'">{{
              record.meta.keepAlive
            }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'isMenu'">
          <a-switch
            :checked="record.isMenu"
            @change="(checked) => onFieldChange(record, 'isMenu', checked)"
          />
        </template>
        <template v-if="column.key === 'keepAlive'">
          <a-switch
            :checked="record.meta.keepAlive"
            @change="(checked) => onFieldChange(record, 'keepAlive', checked)"
          />
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="primary" size="small" @click="openEditModal(record)">编辑</a-button>
            <a-popconfirm title="确定删除此路由吗?" @confirm="handleDelete(record.name)">
              <a-button type="danger" size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <EditRouteDialog
      :open="isModalVisible"
      :route-data="editingRoute"
      @update:open="isModalVisible = false"
      @submit="handleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoutesStore, RouteRecord } from '@/stores/routesStore'
import EditRouteDialog from './EditRouteDialog.vue'
import { message } from 'ant-design-vue'
import { RightOutlined, DownOutlined } from '@ant-design/icons-vue'

const routesStore = useRoutesStore()
const { routes } = storeToRefs(routesStore)

const isModalVisible = ref(false)
const editingRoute = ref<RouteRecord | null>(null)

const columns = [
  { title: '菜单名称', dataIndex: ['meta', 'title'], key: 'title' },
  { title: '路由路径', dataIndex: 'path', key: 'path' },
  { title: '设为菜单', key: 'isMenu', width: 100 },
  { title: '缓存页面', key: 'keepAlive', width: 100 },
  { title: '操作', key: 'action', width: 150 }
]

const openEditModal = (route: RouteRecord) => {
  editingRoute.value = { ...route } // Use a copy for editing
  isModalVisible.value = true
}

const handleDelete = (routeName: string) => {
  routesStore.deleteRoute(routeName)
  message.success('路由已删除')
}

const handleUpdate = (updatedRoute: RouteRecord) => {
  routesStore.updateRoute(updatedRoute.name, updatedRoute)
  isModalVisible.value = false
  message.success('路由已更新')
}

const onFieldChange = (record: RouteRecord, field: string, value: boolean) => {
  const updatedRecord = { ...record }
  if (field === 'isMenu') {
    updatedRecord.isMenu = value
  } else if (field === 'keepAlive') {
    updatedRecord.meta = { ...updatedRecord.meta, keepAlive: value }
  }
  routesStore.updateRoute(record.name, updatedRecord)
  message.success('设置已更新')
}
</script>

<style scoped>
.routes-view-container {
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>
