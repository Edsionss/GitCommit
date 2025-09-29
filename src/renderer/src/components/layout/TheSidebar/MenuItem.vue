<template>
  <template v-for="item in menus">
    <a-sub-menu v-if="item.children && item.children.length" :key="item.path">
      <template #title>
        <span>
          <component :is="iconMap[item.menuIcon]" />
          <span>{{ item.meta.title }}</span>
        </span>
      </template>
      <MenuItem :menus="item.children"></MenuItem>
    </a-sub-menu>
    <template v-else>
      <a-menu-item :key="item.path">
        <template #icon>
          <component :is="iconMap[item.menuIcon]" />
        </template>
        <span>{{ item.meta.title }}</span>
      </a-menu-item>
    </template>
  </template>
</template>

<script setup lang="ts">
import * as iconMap from '@ant-design/icons-vue' // 引入所有图标

defineOptions({
  name: 'MenuItem'
})

// 2. 使用 withDefaults 为 props 提供默认值
const props = withDefaults(
  defineProps<{
    menus: any[]
    parentPath?: string // 设为可选
  }>(),
  {
    menus: () => [],
    parentPath: '' // 默认值为空字符串
  }
)
</script>

<style scoped></style>
