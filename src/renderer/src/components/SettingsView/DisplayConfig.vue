<template>
  <a-card class="setting-card">
    <template #title>
      <div class="card-header">
        <span>外观</span>
        <EyeOutlined />
      </div>
    </template>
    <div class="setting-section">
      <div class="setting-item">
        <div class="setting-label">
          <SkinOutlined />
          <span>主题模式</span>
        </div>
        <div class="setting-control">
          <a-radio-group v-model:value="DisplayConfig.theme" button-style="solid">
            <a-radio-button value="light">明亮</a-radio-button>
            <a-radio-button value="dark">暗黑</a-radio-button>
            <a-radio-button value="system">跟随系统</a-radio-button>
          </a-radio-group>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <LayoutOutlined />
          <span>侧边栏位置</span>
        </div>
        <div class="setting-control">
          <a-radio-group v-model:value="DisplayConfig.sidebarPosition">
            <a-radio-button value="left">左侧</a-radio-button>
            <a-radio-button value="right">右侧</a-radio-button>
          </a-radio-group>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <ZoomInOutlined />
          <span>界面缩放</span>
        </div>
        <div class="setting-control">
          <a-slider
            v-model:value="DisplayConfig.zoom"
            :min="0.8"
            :max="1.5"
            :step="0.1"
            style="width: 150px"
          />
          <span>{{ Math.round(Number(DisplayConfig.zoom) * 100) }}%</span>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <PlaySquareOutlined />
          <span>启用动画</span>
        </div>
        <div class="setting-control">
          <a-switch v-model:checked="DisplayConfig.animations" />
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import {
  EyeOutlined,
  SkinOutlined,
  LayoutOutlined,
  ZoomInOutlined,
  PlaySquareOutlined
} from '@ant-design/icons-vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { storeToRefs } from 'pinia'
const settingStore = useSettingsStore()
const { DisplayConfig } = storeToRefs(settingStore)
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
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  justify-content: flex-end;
}
</style>
