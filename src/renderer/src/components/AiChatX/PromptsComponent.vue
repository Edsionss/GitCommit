<template>
  <Prompts :items="promptsItems" class="flex" @item-click="handlePromptsItemClick" />
</template>

<script setup lang="ts">
import { h } from 'vue'
import { FireOutlined, ReadOutlined } from '@ant-design/icons-vue'
import { Prompts } from 'ant-design-x-vue'
import type { PromptsProps } from 'ant-design-x-vue'

const emit = defineEmits<{
  'prompts-item-click': [description: string]
}>()

const promptsItems: PromptsProps['items'] = [
  {
    key: '1',
    description: 'Hot Topics',
    icon: h(FireOutlined, { style: { color: '#FF4D4F' } })
  },
  {
    key: '2',
    description: 'Design Guide',
    icon: h(ReadOutlined, { style: { color: '#1890FF' } })
  }
]

const handlePromptsItemClick: PromptsProps['onItemClick'] = (info) => {
  emit('prompts-item-click', info.data.description as string)
}
</script>
