<template>
  <a-card class="logs-component" id="logs-section">
    <ScanProgressDisplay
      :scanning="scanning"
      :scan-status="scanStatus"
      :scan-progress="scanProgress"
      @stop-scanning="stopScanning"
    />
    <LogDisplay
      :scan-logs="scanLogs"
      :formatted-logs="formattedLogs"
      @copy="copyLogs"
      @save="saveLogs"
      @clear="clearLogs"
    />
  </a-card>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';
import { useLogManager } from '../../composables/useLogManager';
import { useScanTracker } from '../../composables/useScanTracker';
import ScanProgressDisplay from './ScanProgressDisplay.vue';
import LogDisplay from './LogDisplay.vue';

const emit = defineEmits(['stopScanning']);

const { scanLogs, formattedLogs, addLog, clearLogs, copyLogs, saveLogs } = useLogManager();
const { scanProgress, scanStatus, scanning, setScanProgress, setScanStatus, setScanningState } = useScanTracker();

const stopScanning = () => {
  if (scanning.value) {
    emit('stopScanning');
  }
};

// Expose methods for the parent component
defineExpose({
  addLog,
  clearLogs,
  setScanningState,
  setScanStatus,
  setScanProgress,
});
</script>

<style scoped>
.logs-component {
  width: 100%;
}
</style>
