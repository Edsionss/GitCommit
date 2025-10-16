<template>
  <div class="error-page">
    <a-result
      status="500"
      title="Oops, something went wrong."
      sub-title="Sorry, the page you are visiting has encountered an error. Please try again later or return to the homepage."
    >
      <template #extra>
        <a-button type="primary" @click="goHome">Back to Home</a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background-color: var(--bg-container);
}
</style>
