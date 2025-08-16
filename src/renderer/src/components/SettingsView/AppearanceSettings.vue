<template>
  <a-card class="settings-card">
    <template #title>
      <div class="card-header">
        <span>外观</span>
        <EyeOutlined />
      </div>
    </template>
    <div class="settings-section">
      <div class="setting-item">
        <div class="setting-label">
          <SkinOutlined />
          <span>主题模式</span>
        </div>
        <div class="setting-control">
          <a-radio-group
            :value="settings.theme"
            @change="(e) => $emit('update:theme', e.target.value)"
            button-style="solid"
          >
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
          <a-radio-group
            :value="settings.sidebarPosition"
            @change="(e) => $emit('update:sidebarPosition', e.target.value)"
          >
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
            :value="Number(settings.zoom)"
            @change="(value) => $emit('update:zoom', String(value))"
            :min="0.8"
            :max="1.5"
            :step="0.1"
            style="width: 150px"
          />
          <span>{{ Math.round(Number(settings.zoom) * 100) }}%</span>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <PlaySquareOutlined />
          <span>启用动画</span>
        </div>
        <div class="setting-control">
          <a-switch
            :checked="settings.animations"
            @change="(checked) => $emit('update:animations', checked)"
          />
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

defineProps({
  settings: { type: Object, required: true }
})

defineEmits(['update:theme', 'update:sidebarPosition', 'update:zoom', 'update:animations'])
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
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  justify-content: flex-end;
}
</style>