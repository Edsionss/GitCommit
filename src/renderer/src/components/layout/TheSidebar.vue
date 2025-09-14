<template>
  <div class="sidebar">
    <a-layout-sider v-model:collapsed="isExpanded" :trigger="null" collapsible>
      <div class="logo">
        <img :src="logoFull" alt="" :class="{ fold: isExpanded }" />
      </div>

      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="light"
        mode="inline"
        @click="handleMenuClick"
      >
        <a-menu-item v-for="item in menuItems" :key="item.path">
          <template #icon>
            <component :is="item.icon" />
          </template>
          <span>{{ item.label }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
  </div>
</template>

<script setup lang="ts">
import logoFull from '@/assets/img/logo/LOGO1.png'
import { computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useRoutesStore } from '@/stores/routesStore'
import {
  HomeOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ShareAltOutlined,
  AreaChartOutlined,
  SettingOutlined,
  SearchOutlined,
  HistoryOutlined,
  RobotOutlined
} from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'

const isExpanded = defineModel<boolean>()

const routesStore = useRoutesStore()
const { routes } = storeToRefs(routesStore)
const route = useRoute()
const router = useRouter()

const selectedKeys = ref<string[]>([route.path])

// Map route names to icons
const iconMap = {
  Dashboard: HomeOutlined,
  Scan: SearchOutlined,
  ScanHistory: HistoryOutlined,
  Commits: FileTextOutlined,
  BranchesView: ShareAltOutlined,
  CodeAnalysis: BarChartOutlined,
  Reports: AreaChartOutlined,
  AiChat: RobotOutlined,
  Settings: SettingOutlined
}

watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath]
  },
  { immediate: true }
)

// Dynamically generate menu items from the routes store
const menuItems = computed(() => {
  return routes.value
    .filter((r) => r.isMenu)
    .sort((a, b) => a.menuOrder - b.menuOrder)
    .map((r) => ({
      path: r.path === '' ? '/' : `/${r.path}`,
      label: r.meta.title,
      icon: iconMap[r.name] || FileTextOutlined // Fallback icon
    }))
})

const handleMenuClick: MenuProps['onClick'] = (e) => {
  router.push(e.key as string)
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
    padding-top: 5px;
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
