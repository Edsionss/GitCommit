<template>
  <a-card class="setting-card">
    <template #title>
      <div class="card-header">
        <span>系统</span>
        <SettingOutlined />
      </div>
    </template>
    <div class="setting-section">
      <div class="setting-item">
        <div class="setting-label">
          <RocketOutlined />
          <span>开机自启</span>
        </div>
        <div class="setting-control">
          <a-switch v-model:checked="SystemConfig.startWithSystem" />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <NotificationOutlined />
          <span>启用通知</span>
        </div>
        <div class="setting-control">
          <a-switch v-model:checked="SystemConfig.notifications" />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <CloudSyncOutlined />
          <span>自动检查更新</span>
        </div>
        <div class="setting-control">
          <a-switch v-model:checked="SystemConfig.autoUpdate" />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <CodeOutlined />
          <span>发送匿名使用数据</span>
        </div>
        <div class="setting-control">
          <a-switch v-model:checked="SystemConfig.telemetry" />
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import {
  SettingOutlined,
  RocketOutlined,
  NotificationOutlined,
  CloudSyncOutlined,
  CodeOutlined
} from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settingsStore'
const settingStore = useSettingsStore()
const { SystemConfig } = storeToRefs(settingStore)
</script>

<style scoped>
.setting-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
}

.setting-section {
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
  font-weight: 500;
}

.setting-control {
  min-width: 200px;
  justify-content: flex-end;
}
</style>
