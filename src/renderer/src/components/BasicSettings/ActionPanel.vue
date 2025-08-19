<template>
  <div class="action-buttons">
    <a-button type="primary" @click="$emit('start-scan')" :loading="scanning">
      <template #icon><CaretRightOutlined /></template>开始扫描
    </a-button>
    <!-- <a-button @click="$emit('scan-authors')">
      <template #icon><UserOutlined /></template>扫描作者
    </a-button> -->
    <a-button @click="$emit('reset-config')">
      <template #icon><ClearOutlined /></template>重置配置
    </a-button>
    <a-button @click="$emit('save-results')" :disabled="!hasResults">
      <template #icon><DownloadOutlined /></template>保存结果
    </a-button>
  </div>
</template>

<script setup lang="ts">
import {
  CaretRightOutlined,
  DownloadOutlined,
  UserOutlined,
  ClearOutlined
} from '@ant-design/icons-vue'

defineProps({
  scanning: {
    type: Boolean,
    required: true
  },
  hasResults: {
    type: Boolean,
    required: true
  }
})

defineEmits(['start-scan', 'save-results', 'scan-authors', 'reset-config'])
</script>

<style scoped>
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}
</style>
