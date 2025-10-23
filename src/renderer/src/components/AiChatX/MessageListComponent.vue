<template>
  <div class="flex flex-1 h-full flex-col">
    <template v-if="props.messages.length === 0">
      <PlaceholderComponent class="!mx-auto w-[70%]" />
    </template>
    <template v-else>
      <Bubble.List :autoScroll="true" :items="items" :roles="roles" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, onBeforeUnmount, ref } from 'vue' // 引入 vue 的 ref 和生命周期钩子
import { Bubble } from 'ant-design-x-vue'
import type { BubbleListProps, BubbleProps } from 'ant-design-x-vue'
import PlaceholderComponent from './PlaceholderComponent.vue'
import aiAvatar from '@/assets/img/fmt.png'
import userAvatar from '@/assets/img/logo/CognitoOcean.png'
import MarkdownRenderer from '@components/MarkdownRenderer/index.vue'
interface Props {
  messages: Array<{ id: string; message: string; status: string }>
}

const props = defineProps<Props>()
const renderMarkdown: BubbleProps['messageRender'] = (content) => h(MarkdownRenderer, { content })

// roles 和 items 的定义保持不变
const roles: BubbleListProps['roles'] = {
  ai: {
    placement: 'start',
    typing: { step: 5, interval: 20 },
    avatar: { src: aiAvatar, shape: 'circle' },
    messageRender: renderMarkdown, // 使用新的 renderMarkdown 函数
    styles: {
      content: {
        borderRadius: '16px',
        maxWidth: '100%',
        width: '100%',
        overflow: 'hidden'
      }
    }
  },
  local: {
    placement: 'end',
    variant: 'shadow',
    avatar: { src: userAvatar, shape: 'circle' },
    styles: {
      content: {
        maxWidth: '100%',
        width: '100%',
        overflow: 'hidden'
      }
    }
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
<style scoped lang="scss">
:deep(.ant-bubble .ant-bubble-content-filled) {
  flex: 1;
  max-width: 100%;
  overflow: hidden;
}

/* 确保 Bubble.List 组件本身不会超出容器宽度 */
:deep(.ant-bubble-list) {
  width: 100%;
  max-width: 100%;
}

/* 确保每个气泡项不会超出容器宽度 */
:deep(.ant-bubble) {
  max-width: 100%;
  width: 100%;
}

/* 确保消息内容区域不会超出容器宽度 */
:deep(.ant-bubble-content) {
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}
</style>
