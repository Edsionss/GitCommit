<template>
  <div class="settings-container page-container">
    <DisplayConfig />

    <Preferences />

    <GitConfig />

    <SystemConfig />

    <AiConfig />

    <a-card title="菜单与路由管理">
      <RouterSetting />
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
import RouterSetting from '@/components/SettingsView/RouterSetting.vue'
import { SaveOutlined, RedoOutlined } from '@ant-design/icons-vue'

// 使用 Pinia Store
const settingsStore = useSettingsStore()

// 保存设置到 Store
const saveSettings = () => {
  settingsStore.saveSettings()
  message.success('设置已保存')
  setTimeout(() => {
    location.reload() // 保留重载以应用某些全局设置
  }, 500)
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
</script>

<style scoped>
.settings-container {
  width: 100%;
  padding-bottom: 30px;
  padding-top: 20px; /* 添加顶部内边距 */
}

.page-title {
  margin: 0 0 20px 0;
  font-size: var(--font-size-xl);
  color: var(--color-text); /* 修改为正确的CSS变量 */
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
  color: var(--color-text); /* 修改为正确的CSS变量 */
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
