<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :loading="loading"
    row-key="id"
    :pagination="false"
    :scroll="{ x: 'max-content' }"
  >
    <template #bodyCell="{ column, record }">
      <!-- 渲染图标 -->
      <template v-if="column.key === 'menuIcon'">
        <component :is="Icons[record.menuIcon]" v-if="record.menuIcon" />
      </template>
      <!-- 菜单名称 -->
      <template v-if="column.key === 'title'">
        {{ record.meta.title }}
      </template>
      <!-- 菜单隐藏 -->
      <template v-if="column.key === 'hide'">
        <a-tag :color="record.hide == 0 ? 'green' : ''">{{
          record.hide == '0' ? '否' : '是'
        }}</a-tag>
      </template>
      <!-- 菜单缓存 -->
      <template v-if="column.key === 'keepAlive'">
        <a-tag :color="record.meta.keepAlive == 0 ? '' : 'green'">{{
          record.meta.keepAlive == '0' ? '否' : '是'
        }}</a-tag>
      </template>
      <!-- 操作列 -->
      <template v-if="column.key === 'action'">
        <a-space>
          <a-button @click="$emit('edit', record)" type="dashed" size="small">编辑</a-button>
          <a-button
            size="small"
            type="primary"
            @click="$emit('addChild', record)"
            :disabled="!!record.componentPath"
            >新增</a-button
          >
          <a-popconfirm
            title="确定要删除此菜单及其所有子菜单吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="$emit('delete', record.id)"
          >
            <a-button type="primary" danger size="small">删除</a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { RouteRecord } from '@sharedType/MenuManagement'
import * as Icons from '@ant-design/icons-vue' // 引入所有图标

interface Emits {
  (e: 'edit', record: RouteRecord): void
  (e: 'addChild', record: RouteRecord): void
  (e: 'delete', id: string): void
}

defineProps({
  data: {
    type: Array as PropType<RouteRecord[]>,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits<Emits>()

const columns = [
  { title: '菜单名称', dataIndex: ['meta', 'title'], key: 'title' },
  {
    title: '图标',
    dataIndex: 'menuIcon',
    key: 'menuIcon',
    width: '70px',
    align: 'center'
  },
  {
    title: '排序',
    dataIndex: 'menuOrder',
    key: 'menuOrder',
    width: '60px',
    align: 'center'
  },
  {
    title: '隐藏',
    dataIndex: 'hide',
    key: 'hide',
    ellipsis: true,
    width: '60px'
  },
  { title: '缓存', dataIndex: ['meta', 'keepAlive'], key: 'keepAlive', ellipsis: true },
  { title: '路由名称', dataIndex: 'name', key: 'name', ellipsis: true },
  {
    title: '组件路径',
    dataIndex: 'componentPath',
    key: 'componentPath',
    ellipsis: true
  },
  { title: '操作', key: 'action', width: '150px', align: 'center' }
]
</script>
