<template>
  <div class="flex h-14 !px-[10px] box-border w-full">
    <div class="flex flex-1 items-center justify-center gap-2">
      <img :src="logoSrc" draggable="false" alt="logo" class="w-6 h-6 inline-block" />
      <span
        class="inline-block mx-2 !font-bold justify-center"
        :style="{ color: token.colorText, fontSize: '16px' }"
        >{{ title }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { theme } from 'ant-design-vue'
import logoSrc from '@/assets/img/logo/CognitoOcean.png'

const title = ref('Cognito Ocean AI')
const { token } = theme.useToken()
</script>
<style scoped lang="scss"></style>
