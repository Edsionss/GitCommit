<template>
  <el-card class="settings-card">
    <template #header>
      <div class="card-header">
        <span>外观设置</span>
      </div>
    </template>

    <div class="settings-section">
      <div class="setting-item">
        <div class="setting-label">
          <el-icon><Brush /></el-icon>
          <span>主题设置</span>
        </div>
        <div class="setting-control">
          <el-radio-group :model-value="settings.theme" @update:modelValue="$emit('update:theme', $event)">
            <el-radio-button value="light">浅色</el-radio-button>
            <el-radio-button value="dark">深色</el-radio-button>
            <el-radio-button value="system">跟随系统</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <el-icon><Menu /></el-icon>
          <span>侧边栏位置</span>
        </div>
        <div class="setting-control">
          <el-radio-group :model-value="settings.sidebarPosition" @update:modelValue="$emit('update:sidebarPosition', $event)">
            <el-radio-button value="left">左侧</el-radio-button>
            <el-radio-button value="right">右侧</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <el-icon><ZoomIn /></el-icon>
          <span>界面缩放</span>
        </div>
        <div class="setting-control">
          <el-select :model-value="settings.zoom" @update:modelValue="$emit('update:zoom', $event)">
            <el-option label="80%" value="0.8" />
            <el-option label="90%" value="0.9" />
            <el-option label="100%" value="1" />
            <el-option label="110%" value="1.1" />
            <el-option label="120%" value="1.2" />
          </el-select>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <el-icon><Operation /></el-icon>
          <span>动画效果</span>
        </div>
        <div class="setting-control">
          <el-switch
            :model-value="settings.animations"
            @update:modelValue="$emit('update:animations', $event)"
            active-text="启用"
            inactive-text="禁用"
          />
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Brush, Menu, ZoomIn, Operation } from '@element-plus/icons-vue';

defineProps({
  settings: { type: Object, required: true }
});

defineEmits(['update:theme', 'update:sidebarPosition', 'update:zoom', 'update:animations']);
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
