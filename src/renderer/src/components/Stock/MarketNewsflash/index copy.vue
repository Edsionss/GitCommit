<template>
  <div class="market-newsflash-container">
    <Tabs v-model="activeTab" :tabs="tabItems">
      <template #default="{ activeTab }">
        <div v-show="activeTab === 'Telegraph'" class="content-panel">
          <Timeline></Timeline>
        </div>
        <div v-show="activeTab === 'jinShi'" class="content-panel">
          <p>这里是快讯内容区。</p>
        </div>
      </template>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Timeline from '@components/Common/Timeline.vue'
import Tabs from '@components/Common/Tabs.vue'

const activeTab = ref('Telegraph')
const tabItems = ref([
  { key: 'Telegraph', title: '财联社' },
  { key: 'jinShi', title: '金十数据' }
])
</script>

<style scoped lang="scss">
.market-newsflash-container {
  height: 100%;
  width: 100%;
}

.content-panel {
  height: 100%;
}
</style>
