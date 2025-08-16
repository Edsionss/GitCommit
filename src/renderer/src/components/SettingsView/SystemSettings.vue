<template>
  <a-card class="settings-card">
    <template #title>
      <div class="card-header">
        <span>系统</span>
        <SettingOutlined />
      </div>
    </template>
    <div class="settings-section">
      <div class="setting-item">
        <div class="setting-label">
          <RocketOutlined />
          <span>开机自启</span>
        </div>
        <div class="setting-control">
          <a-switch
            :checked="settings.startWithSystem"
            @change="(checked) => $emit('update:startWithSystem', checked)"
          />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <NotificationOutlined />
          <span>启用通知</span>
        </div>
        <div class="setting-control">
          <a-switch
            :checked="settings.notifications"
            @change="(checked) => $emit('update:notifications', checked)"
          />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <CloudSyncOutlined />
          <span>自动检查更新</span>
        </div>
        <div class="setting-control">
          <a-switch
            :checked="settings.autoUpdate"
            @change="(checked) => $emit('update:autoUpdate', checked)"
          />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <CodeOutlined />
          <span>发送匿名使用数据</span>
        </div>
        <div class="setting-control">
          <a-switch
            :checked="settings.telemetry"
            @change="(checked) => $emit('update:telemetry', checked)"
          />
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

defineProps({
  settings: { type: Object, required: true }
})

defineEmits(['update:startWithSystem', 'update:notifications', 'update:autoUpdate', 'update:telemetry'])
</script>

<style scoped>
.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
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
  font-weight: 500;
}

.setting-control {
  min-width: 200px;
  justify-content: flex-end;
}
</style>