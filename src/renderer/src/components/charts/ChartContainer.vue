<template>
  <div class="chart-container">
    <h3 v-if="title" class="chart-title">{{ title }}</h3>
    <div class="chart-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.chart-container {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  background-color: var(--bg-content);
  display: flex;
  flex-direction: column;
  max-height: 400px; /* Or a suitable default height */
  height: 400px;
  width: 100%;
}

.chart-title {
  font-size: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
  text-align: center;
}

.chart-wrapper {
  position: relative;
  flex-grow: 1;
}
</style>
