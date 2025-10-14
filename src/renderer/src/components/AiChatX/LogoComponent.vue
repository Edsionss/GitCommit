<template>
  <div :style="styles.logo">
    <img
      :src="'@/assets/images/logo.svg'"
      draggable="false"
      alt="logo"
      :style="styles['logo-img']"
    />
    <span :style="styles['logo-span']">{{ title }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { theme } from 'ant-design-vue'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Cognito Ocean X AI'
})

const { token } = theme.useToken()

const styles = computed(() => {
  return {
    logo: {
      display: 'flex',
      height: '72px',
      'align-items': 'center',
      'justify-content': 'start',
      padding: '0 24px',
      'box-sizing': 'border-box'
    },
    'logo-img': {
      width: '24px',
      height: '24px',
      display: 'inline-block'
    },
    'logo-span': {
      display: 'inline-block',
      margin: '0 8px',
      'font-weight': 'bold',
      color: token.value.colorText,
      'font-size': '16px'
    }
  } as const
})
</script>
