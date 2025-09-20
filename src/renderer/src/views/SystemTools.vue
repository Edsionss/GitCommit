<template>
  <div class="system-tools-container">
    <ShutdownTool />
    <EnvVarTool />
  </div>
</template>

<script setup lang="ts">
import ShutdownTool from '@/components/SystemTools/ShutdownTool.vue'
import EnvVarTool from '@/components/SystemTools/EnvVarTool.vue'
</script>

<style scoped>
.system-tools-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>