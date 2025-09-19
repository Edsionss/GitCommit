<template>
  <div class="mode-selection-placeholder">
    <a-empty description="欢迎使用实时通信功能">
      <template #default>
        <a-typography-text type="secondary">
          请使用左侧的“网络工具”创建或加入一个房间。
        </a-typography-text>
      </template>
    </a-empty>
  </div>
</template>

<script setup lang="ts">
// No props or emits needed anymore for this simplified component
</script>

<style scoped>
.mode-selection-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}
</style>
