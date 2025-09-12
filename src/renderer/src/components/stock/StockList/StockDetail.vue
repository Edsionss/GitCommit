<template>
  <div class="detail-container">
    <a-tabs v-model:activeKey="detailPanneKey" centered>
      <a-tab-pane key="1" tab="Tab 1">Content of Tab Pane 1</a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const detailTabs = reactive([])
const detailPanneKey = ref('1')
</script>

<style scoped></style>
