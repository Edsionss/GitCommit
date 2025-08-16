<template>
  <el-card class="settings-card">
    <template #header>
      <div class="card-header">
        <span>语言和地区</span>
      </div>
    </template>

    <div class="settings-section">
      <div class="setting-item">
        <div class="setting-label">
          <el-icon><ChatLineRound /></el-icon>
          <span>界面语言</span>
        </div>
        <div class="setting-control">
          <el-select :model-value="settings.language" @update:modelValue="$emit('update:language', $event)">
            <el-option label="简体中文" value="zh-CN" />
            <el-option label="English" value="en-US" />
            <el-option label="日本語" value="ja-JP" />
            <el-option label="한국어" value="ko-KR" />
          </el-select>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <el-icon><Calendar /></el-icon>
          <span>日期格式</span>
        </div>
        <div class="setting-control">
          <el-select :model-value="settings.dateFormat" @update:modelValue="$emit('update:dateFormat', $event)">
            <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
            <el-option label="MM/DD/YYYY" value="MM/DD/YYYY" />
            <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
            <el-option label="YYYY年MM月DD日" value="YYYY年MM月DD日" />
          </el-select>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <el-icon><Timer /></el-icon>
          <span>时间格式</span>
        </div>
        <div class="setting-control">
          <el-radio-group :model-value="settings.timeFormat" @update:modelValue="$emit('update:timeFormat', $event)">
            <el-radio-button value="24">24小时制</el-radio-button>
            <el-radio-button value="12">12小时制</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ChatLineRound, Calendar, Timer } from '@element-plus/icons-vue';

defineProps({
  settings: { type: Object, required: true }
});

defineEmits(['update:language', 'update:dateFormat', 'update:timeFormat']);
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
