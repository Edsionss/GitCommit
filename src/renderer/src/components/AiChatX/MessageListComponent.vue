<template>
  <div :style="styles.messages">
    <template v-if="props.messages.length === 0">
      <PlaceholderComponent class="!mx-auto w-[70%]" />
    </template>
    <template v-else>
      <Bubble.List
        :autoScroll="true"
        :items="items"
        :roles="roles"
        :messageRender="renderMarkdown"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { Bubble } from 'ant-design-x-vue'
import type { BubbleListProps } from 'ant-design-x-vue'
import PlaceholderComponent from './PlaceholderComponent.vue'
import aiAvatar from '@/assets/img/fmt.png'
import userAvatar from '@/assets/img/logo/CognitoOcean.png'
import type { BubbleProps } from 'ant-design-x-vue'
import { Typography } from 'ant-design-vue'
// import markdownit from 'markdown-it'
import { marked } from 'marked'

const renderer = new marked.Renderer()
renderer.link = ({ href, title, text }) => {
  // 如果 href 是空的，就当作“内部路由占位符”
  if (!href) {
    return `<a role="link" class="fake-link" data-router-link>${text}</a>`
  }
  return `<a href="${href}" target="_blank" rel="noopener">${text}</a>`
}
// const renderMarkdown = (text: string) => {
//   if (!text) {
//     return ''
//   }
//   return marked.parse(text, { gfm: true, breaks: true })
// }
marked.setOptions({ renderer })
interface Props {
  messages: Array<{ id: string; message: string; status: string }>
}

const props = defineProps<Props>()

const styles = computed(() => {
  return {
    messages: {
      flex: 1,
      height: '100%',
      display: 'flex',
      'flex-direction': 'column'
    }
  } as const
})
// const md = markdownit({ html: true, breaks: true })
const renderMarkdown: BubbleProps['messageRender'] = (content) =>
  h(Typography, null, {
    default: () => h('div', { innerHTML: marked.parse(content, { gfm: true, breaks: true }) })
  })
const roles: BubbleListProps['roles'] = {
  ai: {
    placement: 'start',
    typing: { step: 5, interval: 20 },
    avatar: { src: aiAvatar, shape: 'circle' },
    messageRender: renderMarkdown,
    styles: {
      content: {
        borderRadius: '16px'
      }
    }
  },
  local: {
    placement: 'end',
    variant: 'shadow',
    avatar: { src: userAvatar, shape: 'circle' }
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
