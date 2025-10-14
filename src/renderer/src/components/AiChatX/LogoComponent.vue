<template>
  <div :style="styles.logo">
    <img :src="logoSrc" draggable="false" alt="logo" :style="styles['logo-img']" />
    <span :style="styles['logo-span']">{{ title }}</span>
    <a-tag :style="styles['model-tag']">{{ model }}</a-tag>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const styles = computed(() => {
  return {
    logo: {
      display: 'flex',
      height: '72px',
      'align-items': 'center',
      'justify-content': 'start',
      padding: '0 17px',
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
    },
    'model-tag': {
      'margin-left': '8px',
      'font-size': '12px',
      'border-radius': '10px',
      background: '#f0f0f0',
      'border-color': '#d9d9d9',
      color: '#595959'
    }
  } as const
})
</script>
