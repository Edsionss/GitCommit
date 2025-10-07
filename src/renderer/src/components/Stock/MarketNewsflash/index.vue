<template>
  <div class="market-newsflash-container">
    <div class="header">
      <div class="hand-btns">
        <a-button type="primary" @click="stockApi.scrapeStockNews()">爬取咨询</a-button>
        <a-button danger @click="stockApi.cleanStockNews()">清空咨询</a-button>
      </div>
    </div>
    <div class="content-panel">
      <Timeline :data="stockNews"></Timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import Timeline from '@components/Common/Timeline.vue'
import { stockApi } from '@api/stock'
import { getYesterdayCN } from '@utils/index'

const stockNews = reactive([])
stockApi.getStockNews(getYesterdayCN()).then((res) => {
  console.log(res)

  Object.assign(stockNews, res)
})
</script>

<style scoped lang="scss">
.market-newsflash-container {
  height: 100%;
  width: 100%;
  background-color: var(--bg-container);
  padding: 10px;
  overflow: hidden;
  .header {
    .hand-btns {
      position: fixed;
      margin: 10px 0;
      display: flex;
      gap: 10px;
      justify-content: end;
      right: 30px;
    }
    height: 60px;
  }

  .content-panel {
    height: 100%;
    overflow-y: auto;
    margin-bottom: 30px;
  }
}
</style>
