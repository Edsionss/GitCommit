<template>
  <div class="mode-selection">
    <a-typography-title :level="3">选择聊天模式</a-typography-title>
    <a-space direction="vertical" :size="20">
      <a-button type="primary" size="large" @click="$emit('start-hosting')">
        创建房间 (作为主机)
      </a-button>
      <a-divider>或</a-divider>
      <div class="join-section">
        <a-input
          :value="hostIp"
          @update:value="$emit('update:hostIp', $event)"
          placeholder="输入主机的IP地址"
          size="large"
        />
        <a-button size="large" @click="$emit('show-join-modal')" :disabled="!hostIp">
          加入房间
        </a-button>
        <a-button size="large" @click="$emit('scan-network')" :loading="isScanning">
          扫描网络
        </a-button>
      </div>
    </a-space>
  </div>
</template>

<script setup lang="ts">
defineProps<{ hostIp: string; isScanning: boolean }>()
defineEmits(['start-hosting', 'show-join-modal', 'scan-network', 'update:hostIp'])
</script>

<style scoped>
.mode-selection {
  text-align: center;
  width: 100%;
}
.join-section {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
