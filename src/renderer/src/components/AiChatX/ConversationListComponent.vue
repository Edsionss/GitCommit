<template>
  <div
    class="bg-opacity-50 w-[20%] h-full flex flex-col mx-[30px]"
    :style="{ background: `${token.colorBgLayout}80` }"
  >
    <!-- Logo -->
    <LogoComponent :title="logoTitle" :model="model" />

    <!-- 添加会话按钮 -->
    <Button
      type="link"
      class="!bg-[#1677ff0f] !border-[#1677ff34] w-[calc(100%-24px)] !mx-auto mb-6"
      @click="handleAddConversation"
    >
      <PlusOutlined />
      {{ addButtonText }}
    </Button>

    <!-- 会话列表 -->
    <Conversations
      :items="conversationsItems"
      class="px-3 flex-1 overflow-y-auto"
      :active-key="activeKey"
      :actions="conversationActions"
      @active-change="handleConversationClick"
      @actions-click="handleActionsClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { Button, theme, Dropdown } from 'ant-design-vue'
import { Conversations } from 'ant-design-x-vue'
import LogoComponent from './LogoComponent.vue'

interface Props {
  conversationsItems: Array<{ key: string; label: string }>
  activeKey: string
  logoTitle?: string
  addButtonText?: string
  model?: string
}

const props = withDefaults(defineProps<Props>(), {
  logoTitle: 'Cognito Ocean AI',
  addButtonText: 'New Conversation',
  model: 'GPT-4'
})

const emit = defineEmits<{
  'add-conversation': []
  'conversation-click': [key: string]
  'delete-conversation': [key: string]
}>()

const { token } = theme.useToken()

// 定义会话操作项
const conversationActions = computed(() => [
  {
    key: 'delete',
    icon: DeleteOutlined,
    danger: true
  }
])

const handleAddConversation = () => {
  emit('add-conversation')
}

const handleConversationClick = (key: string) => {
  emit('conversation-click', key)
}

const handleActionsClick = ({ key, itemKey }: { key: string; itemKey: string }) => {
  if (itemKey === 'delete') {
    emit('delete-conversation', key)
  }
}
</script>
