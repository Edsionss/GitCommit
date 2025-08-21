<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50">
    <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
    <p class="text-xl text-gray-600 mb-6">页面不存在</p>
    <router-link
      to="/"
      class="px-6 py-3 rounded-2xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 transition"
    >
      返回首页
    </router-link>
  </div>
</template>

<script setup lang="ts">
// 这里通常不需要写逻辑
</script>

<style scoped>
/* 你可以加点动画 */
</style>
