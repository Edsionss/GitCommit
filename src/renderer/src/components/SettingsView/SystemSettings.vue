<template>
  <el-card class="settings-card">
    <template #header>
      <div class="card-header">
        <span>系统设置</span>
      </div>
    </template>

    <div class="settings-section">
      <div class="setting-item">
        <div class="setting-label">
          <el-icon><Switch /></el-icon>
          <span>开机自启</span>
        </div>
        <div class="setting-control">
          <el-switch
            :model-value="settings.startWithSystem"
            @update:modelValue="$emit('update:startWithSystem', $event)"
            active-text="启用"
            inactive-text="禁用"
          />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <el-icon><Bell /></el-icon>
          <span>通知提醒</span>
        </div>
        <div class="setting-control">
          <el-switch
            :model-value="settings.notifications"
            @update:modelValue="$emit('update:notifications', $event)"
            active-text="启用"
            inactive-text="禁用"
          />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <el-icon><Download /></el-icon>
          <span>自动更新</span>
        </div>
        <div class="setting-control">
          <el-switch
            :model-value="settings.autoUpdate"
            @update:modelValue="$emit('update:autoUpdate', $event)"
            active-text="启用"
            inactive-text="禁用"
          />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <el-icon><DataLine /></el-icon>
          <span>数据统计</span>
        </div>
        <div class="setting-control">
          <el-switch
            :model-value="settings.telemetry"
            @update:modelValue="$emit('update:telemetry', $event)"
            active-text="允许收集匿名统计数据"
            inactive-text="禁用"
          />
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Switch, Bell, Download, DataLine } from '@element-plus/icons-vue';

defineProps({
  settings: { type: Object, required: true }
});

defineEmits(['update:startWithSystem', 'update:notifications', 'update:autoUpdate', 'update:telemetry']);
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
  color: var(--color-text);
  font-weight: 500;
}

.setting-control {
  min-width: 200px;
}
</style>
