<template>
  <div class="settings-container">
    <DisplayConfig />

    <Preferences />

    <GitConfig />

    <SystemConfig />

    <AiConfig />

    <a-card title="菜单与路由管理">
      <!-- <RouterSetting /> -->
      <MenuManagement />
    </a-card>
    <a-float-button-group trigger="hover" type="primary" :right="'24px'">
      <template #tooltip>
        <div>操作</div>
      </template>
      <a-float-button @click="saveSettings">
        <template #icon><SaveOutlined /></template>
        <template #tooltip><div>保存设置</div></template>
      </a-float-button>
      <a-float-button @click="resetSettings">
        <template #icon><RedoOutlined /></template>
        <template #tooltip><div>重置设置</div></template>
      </a-float-button>
      <a-float-button @click="resetRouterMenu">
        <template #icon><UnorderedListOutlined /></template>
        <template #tooltip><div>重置路由</div></template>
      </a-float-button>
      <a-float-button @click="resetDatabase">
        <template #icon><DatabaseOutlined /></template>
        <template #tooltip><div>重置数据库</div></template>
      </a-float-button>
    </a-float-button-group>
  </div>
</template>

<script setup lang="ts">
import { message, Modal } from 'ant-design-vue'
import { useSettingsStore } from '@/stores/settingsStore'
import DisplayConfig from '@renderer/components/SettingsView/DisplayConfig.vue'
import Preferences from '@renderer/components/SettingsView/Preferences.vue'
import GitConfig from '@renderer/components/SettingsView/GitConfig.vue'
import SystemConfig from '@/components/SettingsView/SystemConfig.vue'
import AiConfig from '@renderer/components/SettingsView/AiConfig.vue'
import MenuManagement from './MenuManagement.vue'
import {
  SaveOutlined,
  RedoOutlined,
  UnorderedListOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue'
import { useRoutesStore } from '@/stores/routesStore'
import { applicationApi } from '@api/application'

const routesStore = useRoutesStore()

// 使用 Pinia Store
const settingsStore = useSettingsStore()

// 保存设置到 Store
const saveSettings = async () => {
  // 1. 先保存所有设置到 electron-store
  await settingsStore.saveSettings()
}

// 重置设置
const resetSettings = () => {
  Modal.confirm({
    title: '重置设置',
    content: '确定要重置所有设置到默认值吗？此操作不可撤销。',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      settingsStore.resetSettings()

      setTimeout(() => location.reload(), 500)
    }
  })
}

// 重置路由
const resetRouterMenu = () => {
  Modal.confirm({
    title: '重置路由',
    content: '确定要重置所有路由到默认值吗？此操作不可撤销。',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      routesStore.restRoutes()

      setTimeout(() => location.reload(), 500)
    }
  })
}

// 重置数据库
const resetDatabase = () => {
  Modal.confirm({
    title: '重置数据库',
    content:
      '确定要重置应用程序的数据库吗？所有本地存储的数据（如扫描历史、设置等）都将被永久删除。此操作不可撤销，应用程序将自动重启。',
    okText: '确定重置',
    cancelText: '取消',
    async onOk() {
      try {
        const result = await applicationApi.resetDatabase()
        if (result.success) {
          message.success('数据库已开始重置，应用程序即将重启。')
          // 后端会处理重启，前端不需要额外操作
        } else {
          message.error(`数据库重置失败: ${result.error}`)
        }
      } catch (error) {
        message.error(`发生未知错误: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  })
}
</script>

<style scoped>
.settings-container {
  width: 100%;
}

.page-title {
  margin: 0 0 20px 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary); /* 修改为正确的CSS变量 */
  font-weight: var(--font-weight-semibold);
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-md);
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary); /* 修改为正确的CSS变量 */
  font-weight: var(--font-weight-medium);
}

.setting-control {
  min-width: 200px;
}

.settings-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .setting-control {
    width: 100%;
  }
}
</style>
