<template>
  <a-card class="settings-card">
    <template #title>
      <div class="card-header">
        <span>区域与语言</span>
        <GlobalOutlined />
      </div>
    </template>
    <div class="settings-section">
      <div class="setting-item">
        <div class="setting-label">
          <TranslationOutlined />
          <span>语言</span>
        </div>
        <div class="setting-control">
          <a-select
            :value="settings.language"
            @change="(value) => $emit('update:language', value)"
            style="width: 120px"
          >
            <a-select-option value="zh-CN">简体中文</a-select-option>
            <a-select-option value="en-US">English</a-select-option>
          </a-select>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <CalendarOutlined />
          <span>日期格式</span>
        </div>
        <div class="setting-control">
          <a-select
            :value="settings.dateFormat"
            @change="(value) => $emit('update:dateFormat', value)"
            style="width: 150px"
          >
            <a-select-option value="YYYY-MM-DD">YYYY-MM-DD</a-select-option>
            <a-select-option value="DD/MM/YYYY">DD/MM/YYYY</a-select-option>
            <a-select-option value="MM/DD/YYYY">MM/DD/YYYY</a-select-option>
          </a-select>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <ClockCircleOutlined />
          <span>时间格式</span>
        </div>
        <div class="setting-control">
          <a-radio-group
            :value="settings.timeFormat"
            @change="(e) => $emit('update:timeFormat', e.target.value)"
          >
            <a-radio-button value="24">24 小时</a-radio-button>
            <a-radio-button value="12">12 小时</a-radio-button>
          </a-radio-group>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import {
  GlobalOutlined,
  TranslationOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'

defineProps({
  settings: { type: Object, required: true }
})

defineEmits(['update:language', 'update:dateFormat', 'update:timeFormat'])
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
