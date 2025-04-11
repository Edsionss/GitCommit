<template>
  <router-view />
</template>

<script setup lang="ts">
// 空的script块，App.vue只负责渲染路由，不包含其他逻辑
</script>

<style>
/* 全局样式重置，确保根元素占满视口 */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
  transition:
    background-color 0.3s,
    color 0.3s;
}

/* 添加全局页面容器样式 */
.page-container {
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}
</style>
