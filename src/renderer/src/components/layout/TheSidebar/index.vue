<template>
  <div class="sidebar">
    <a-layout-sider v-model:collapsed="isExpanded" :trigger="null" collapsible>
      <div class="logo">
        <img :src="CognitoOcean" alt="" :style="logoStyle" />
      </div>

      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="light"
        mode="inline"
        @click="handleMenuClick"
        class="menu-content"
        :style="menuContentStyle"
      >
        <MenuItem :menus="menuItems"></MenuItem>
      </a-menu>
    </a-layout-sider>
  </div>
</template>

<script setup lang="ts">
import CognitoOcean from '@/assets/img/logo/CognitoOcean.png'
import { computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useRoutesStore } from '@/stores/routesStore'
import * as iconMap from '@ant-design/icons-vue' // 引入所有图标
import type { MenuProps } from 'ant-design-vue'
import MenuItem from './MenuItem.vue'
import { formatPathsAndFilter } from '@/utils'

const isExpanded = defineModel<boolean>()

const routesStore = useRoutesStore()
const { routes } = storeToRefs(routesStore)
const route = useRoute()
const router = useRouter()

const selectedKeys = ref<string[]>([route.path])

watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath]
  },
  { immediate: true }
)

const loadRouteArray = (array: any[]) => {
  array.map((item) => {
    item.path = `/${item.path}`
    if (item && item.children && item.children.length) {
      item.children.map((child) => {
        child.path = `${item.path}/${child.path}`
      })
      loadRouteArray(item.children)
    }
  })
}

// Dynamically generate menu items from the routes store
const menuItems = computed(() => {
  console.log(formatPathsAndFilter(routes.value))

  return formatPathsAndFilter(routes.value)
})

const logoStyle = computed(() => {
  return isExpanded.value ? { height: '60px' } : { height: '100px' }
})
const menuContentStyle = computed(() => {
  return { height: `calc( 100% - ( ${logoStyle.value.height} + 20px ) ) ` }
})

const handleMenuClick: MenuProps['onClick'] = ({ item, key, keyPath }) => {
  router.push(key as string)
}
</script>

<style scoped lang="scss">
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-container);
  transition: width 0.3s ease;
  :deep(.ant-layout-sider) {
    height: 100%;
  }
  :deep(.ant-layout-sider-children) {
    height: 100%;
  }
  :deep(.ant-menu) {
    border: none;
  }
  .logo {
    padding: 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      padding: 10px 0;
      height: 100px;

      &.fold {
        height: 60px;
      }
    }
  }
  .menu-content {
    overflow-y: auto;
  }
}
</style>
