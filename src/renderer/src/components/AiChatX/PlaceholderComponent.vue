<template>
  <Space :direction="'vertical'" :size="16" :style="styles.placeholder">
    <!-- 欢迎组件 -->
    <Welcome
      :variant="'borderless'"
      :icon="welcomeIcon"
      :title="welcomeTitle"
      :description="welcomeDescription"
    >
      <!-- <template #extra>
        <Space>
          <Button>
            <template #icon>
              <ShareAltOutlined />
            </template>
          </Button>
          <Button>
            <template #icon>
              <EllipsisOutlined />
            </template>
          </Button>
        </Space>
      </template> -->
    </Welcome>

    <!-- 提示词组件 -->
    <Prompts
      :title="() => promptsTitle"
      :items="promptsItems"
      :styles="promptsStyles"
      @item-click="handlePromptsItemClick"
    />
  </Space>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { ShareAltOutlined, EllipsisOutlined } from '@ant-design/icons-vue'
import { Button, Space } from 'ant-design-vue'
import { Prompts, Welcome } from 'ant-design-x-vue'
import type { PromptsProps } from 'ant-design-x-vue'
import aiIcon from '@/assets/img/fmt.png'

interface Props {
  promptsTitle?: string
  welcomeIcon?: any
  welcomeTitle?: string
  welcomeDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  promptsTitle: 'Do you want?',
  welcomeIcon: () =>
    h('img', { src: aiIcon, alt: 'AI Icon', style: { width: '48px', height: '48px' } }),
  welcomeTitle: 'Cognito Ocean X AI',
  welcomeDescription: 'Hello , I am Cognito Ocean X AI, your intelligent assistant.\n'
})

const emit = defineEmits<{
  'prompts-item-click': [description: string]
}>()

const styles = computed(() => {
  return {
    placeholder: {
      'padding-top': '32px',
      'text-align': 'left',
      flex: 1
    }
  } as const
})

const promptsStyles = computed(() => {
  return {
    list: {
      width: '100%'
    },
    item: {
      flex: 1
    }
  }
})

const promptsItems: PromptsProps['items'] = [
  {
    key: '1',
    description: 'Hot Topics',
    children: [
      {
        key: '1-1',
        description: `What's new in X?`
      },
      {
        key: '1-2',
        description: `What's AGI?`
      },
      {
        key: '1-3',
        description: `Where is the doc?`
      }
    ]
  },
  {
    key: '2',
    description: 'Design Guide',
    children: [
      {
        key: '2-1',
        description: `Know the well`
      },
      {
        key: '2-2',
        description: `Set the AI role`
      },
      {
        key: '2-3',
        description: `Express the feeling`
      }
    ]
  }
]

const handlePromptsItemClick: PromptsProps['onItemClick'] = (info) => {
  emit('prompts-item-click', info.data.description as string)
}
</script>
