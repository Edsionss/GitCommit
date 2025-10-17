<template>
  <div class="flex h-14 items-center justify-start !px-[13px] box-border gap-2">
    <img :src="logoSrc" draggable="false" alt="logo" class="w-6 h-6 inline-block" />
    <span
      class="inline-block mx-2 !font-bold justify-center"
      :style="{ color: token.colorText, fontSize: '16px' }"
      >{{ title }}</span
    >
    <a-tag class="model-tag">{{ model }}</a-tag>
  </div>
</template>

<script setup lang="ts">
import { theme } from 'ant-design-vue'
import logoSrc from '@/assets/img/logo/CognitoOcean.png'

interface Props {
  title?: string
  model?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Cognito Ocean AI',
  model: 'GPT-4'
})

const { token } = theme.useToken()
</script>
<style scoped lang="scss">
.model-tag {
  font-size: 12px;
  border-radius: 10px;
  background: #f0f0f0;
  border-color: #d9d9d9;
  color: #595959;
  justify-content: center;
  margin: 0;
}
</style>
