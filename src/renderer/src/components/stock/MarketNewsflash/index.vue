<template>
  <a-tabs v-model:activeKey="newsKey" tab-position="left" animated>
    <a-tab-pane key="telegraph" tab="财联社">
      <TimePanel :data="telegraphData"></TimePanel>
    </a-tab-pane>
    <a-tab-pane key="jinShi" tab="金十数据"></a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
import TimePanel from '@components/Common/Timeline.vue'
import { ref, reactive, onMounted } from 'vue'
const newsKey = ref('telegraph')

const telegraphData = reactive([])
</script>

<style scoped></style>
