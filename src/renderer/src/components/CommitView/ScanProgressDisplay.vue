<template>
  <div>
    <div class="progress-header">
      <span>扫描进度</span>
      <div class="progress-actions">
        <a-tag :color="scanning ? 'blue' : 'default'">{{ scanning ? scanStatus : '未开始' }}</a-tag>
        <a-button
          type="primary"
          danger
          size="small"
          @click="$emit('stopScanning')"
          :disabled="!scanning"
          style="margin-left: 8px"
        >
          停止扫描
        </a-button>
      </div>
    </div>
    <a-progress
      :percent="scanProgress"
      :format="progressFormat"
      :status="scanning ? 'active' : 'normal'"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  scanning: boolean
  scanStatus: string
  scanProgress: number
}>()

defineEmits(['stopScanning'])

const progressFormat = (percentage: number | undefined) => {
  if (percentage === undefined) return '0%'
  return percentage === 100 ? '完成' : `${percentage}%`
}
</script>

<style scoped>
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.progress-actions {
  display: flex;
  align-items: center;
}
</style>
