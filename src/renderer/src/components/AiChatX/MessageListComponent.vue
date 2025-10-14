<template>
  <div :style="styles.messages">
    <template v-if="props.messages.length === 0">
      <PlaceholderComponent />
    </template>
    <template v-else>
      <Bubble.List :items="items" :roles="roles" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bubble } from 'ant-design-x-vue'
import type { BubbleListProps } from 'ant-design-x-vue'
import PlaceholderComponent from './PlaceholderComponent.vue'

interface Props {
  messages: Array<{ id: string; message: string; status: string }>
}

const props = defineProps<Props>()

const styles = computed(() => {
  return {
    messages: {
      flex: 1
    }
  } as const
})

const roles: BubbleListProps['roles'] = {
  ai: {
    placement: 'start',
    typing: { step: 5, interval: 20 },
    styles: {
      content: {
        borderRadius: '16px'
      }
    }
  },
  local: {
    placement: 'end',
    variant: 'shadow'
  }
}

const items = computed<BubbleListProps['items']>(() => {
  return props.messages.map(({ id, message, status }) => ({
    key: id,
    loading: status === 'loading',
    role: status === 'local' ? 'local' : 'ai',
    content: message
  }))
})
</script>
