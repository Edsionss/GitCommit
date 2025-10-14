<template>
  <div :style="styles.menu">
    <!-- Logo -->
    <LogoComponent :title="logoTitle" :model="model" />

    <!-- 添加会话按钮 -->
    <Button type="link" :style="styles.addBtn" @click="handleAddConversation">
      <PlusOutlined />
      {{ addButtonText }}
    </Button>

    <!-- 会话列表 -->
    <Conversations
      :items="conversationsItems"
      :style="styles.conversations"
      :active-key="activeKey"
      @active-change="handleConversationClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { Button, theme } from 'ant-design-vue'
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
}>()

const { token } = theme.useToken()

const styles = computed(() => {
  return {
    menu: {
      background: `${token.value.colorBgLayout}80`,
      width: '280px',
      height: '100%',
      display: 'flex',
      'flex-direction': 'column'
    },
    conversations: {
      padding: '0 12px',
      flex: 1,
      'overflow-y': 'auto'
    },
    addBtn: {
      background: '#1677ff0f',
      border: '1px solid #1677ff34',
      width: 'calc(100% - 24px)',
      margin: '0 12px 24px 12px'
    }
  } as const
})

const handleAddConversation = () => {
  emit('add-conversation')
}

const handleConversationClick = (key: string) => {
  emit('conversation-click', key)
}
</script>
