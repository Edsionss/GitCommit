<template>
  <div :style="styles.toolbar">
    <Tooltip title="收起/展开会话列表">
      <Button
        type="text"
        :icon="conversationListCollapsed ? h(MenuUnfoldOutlined) : h(MenuFoldOutlined)"
        @click="toggleConversationList"
      />
    </Tooltip>

    <Tooltip title="开启/关闭流式输出">
      <Button
        type="text"
        :icon="h(PlayCircleOutlined)"
        :class="{ 'text-primary': streamingEnabled }"
        @click="toggleStreaming"
      />
    </Tooltip>

    <Tooltip title="保存当前会话">
      <Button type="text" :icon="h(SaveOutlined)" @click="saveCurrentConversation" />
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button, Tooltip, theme } from 'ant-design-vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlayCircleOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import { h } from 'vue'

interface Props {
  conversationListCollapsed?: boolean
  streamingEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  conversationListCollapsed: false,
  streamingEnabled: false
})

const emit = defineEmits<{
  'toggle-conversation-list': []
  'toggle-streaming': []
  'save-current-conversation': []
}>()

const { token } = theme.useToken()

const styles = computed(() => {
  return {
    toolbar: {
      display: 'flex',
      'flex-direction': 'column',
      gap: '8px',
      padding: '16px', // 增加上下padding
      'align-items': 'center',
      background: `${token.value.colorBgLayout}80`, // 与ConversationListComponent相同的背景色
      'border-right': `1px solid ${token.value.colorBorder}`
    }
  } as const
})

const toggleConversationList = () => {
  emit('toggle-conversation-list')
}

const toggleStreaming = () => {
  emit('toggle-streaming')
}

const saveCurrentConversation = () => {
  emit('save-current-conversation')
}
</script>
