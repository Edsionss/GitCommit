<template>
  <div class="stockList-container">
    <div class="stock-pool">
      <StockPool></StockPool>
    </div>
    <div class="stock-detail">
      <StockDetail></StockDetail>
    </div>
  </div>
</template>

<script setup lang="ts">
import StockPool from './StockPool.vue'
import StockDetail from './StockDetail.vue'
import { ref, reactive, onMounted } from 'vue'
</script>

<style scoped lang="scss">
.stockList-container {
  width: 100%;
  display: flex;
  height: 100%;
  .stock-pool {
    flex: 1;
  }
  .stock-detail {
    flex: 2.5;
  }
}
</style>
