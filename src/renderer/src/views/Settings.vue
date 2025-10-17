<template>
  <div class="settings-container">
    <div class="settings-header">
      <div class="tab-container">
        <SegmentedControl
          backgroundColor="var(--bg-container)"
          v-model="activeTab"
          :options="tabOptions"
          :border-radius="20"
          :padding="5"
          borderColor="var(--border-primary)"
          activeBackgroundColor="var(--bg-hover)"
        />
      </div>
    </div>

    <!-- Tab 内容 -->
    <div class="tab-content">
      <!-- 基础设置 Tab -->
      <div v-if="activeTab === 'basic'" class="tab-panel">
        <DisplayConfig />
        <Preferences />
      </div>

      <!-- 系统设置 Tab -->
      <div v-if="activeTab === 'system'" class="tab-panel">
        <SystemConfig />
        <GitConfig />
      </div>

      <!-- AI设置 Tab -->
      <div v-if="activeTab === 'ai'" class="tab-panel">
        <AiConfig />
      </div>

      <!-- 高级设置 Tab -->
      <div v-if="activeTab === 'advanced'" class="tab-panel">
        <a-card title="菜单与路由管理">
          <MenuManagement />
        </a-card>
      </div>
    </div>

    <!-- 浮动操作按钮 -->
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
import { reactive, ref } from 'vue'
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
import SegmentedControl from '@/components/LH-components/SegmentedControl.vue'

const routesStore = useRoutesStore()
const settingsStore = useSettingsStore()

// 当前激活的 tab
const activeTab = ref('basic')

// Tab 选项
const tabOptions = reactive([
  { value: 'basic', label: '基础设置' },
  { value: 'system', label: '系统设置' },
  { value: 'ai', label: 'AI设置' },
  { value: 'advanced', label: '高级设置' }
])

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

<style scoped lang="scss">
.settings-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow: hidden;
  height: 100%;
  .settings-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    height: 40px;
    .tab-container {
      position: fixed;
      display: flex;
      justify-content: center;
    }
  }
  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
    height: 100%;
  }
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 768px) {
  .settings-header {
    gap: 16px;
  }

  .tab-container {
    overflow-x: auto;
    justify-content: flex-start;
  }
}
</style>
