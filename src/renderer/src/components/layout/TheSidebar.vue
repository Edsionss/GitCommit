<template>
  <div class="sidebar">
    <a-layout-sider v-model:collapsed="isExpanded" :trigger="null" collapsible>
      <div class="logo">
        <img :src="CognitoOcean" alt="" :class="{ fold: isExpanded }" />
      </div>

      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="light"
        mode="inline"
        @click="handleMenuClick"
      >
        <div v-for="item in menuItems" :key="item.path">
          <a-sub-menu :key="item.path" v-if="item.children && item.children.length">
            <template #title>
              <span>
                <component :is="item.icon" />
                <span>{{ item.label }}</span>
              </span>
            </template>
            <a-menu-item v-for="menu in item.children" :key="menu.path">
              <template #icon>
                <component :is="menu.icon" />
              </template>
              <span>{{ menu.label }}</span>
            </a-menu-item>
          </a-sub-menu>
          <div v-else>
            <a-menu-item :key="item.path">
              <template #icon>
                <component :is="item.icon" />
              </template>
              <span>{{ item.label }}</span>
            </a-menu-item>
          </div>
        </div>
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
import { buildTree } from '@utils/index'

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

// Dynamically generate menu items from the routes store
const menuItems = computed(() => {
  return buildTree(
    routes.value.map((r) => ({
      ...r,
      path: r.path === '' ? '/' : `/${r.path}`,
      label: r.meta.title,
      icon: iconMap[r.menuIcon || 'FileTextOutlined']
    }))
  )
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
  background-color: var(--bg-content);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s ease;
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
}
</style>
