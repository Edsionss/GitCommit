<template>
  <div
    class="bg-opacity-50 w-[20%] h-full flex flex-col mx-[30px]"
    :style="{ background: `${token.colorBgLayout}80` }"
  >
    <!-- Logo -->
    <LogoComponent />

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
      :menu="conversationMenu"
      @active-change="handleConversationClick"
    />

    <!-- 编辑会话名称的模态框 -->
    <Modal
      v-model:open="isModalVisible"
      title="修改会话名称"
      @ok="handleRenameConfirm"
      @cancel="handleRenameCancel"
    >
      <Input
        v-model:value="editingName"
        placeholder="请输入会话名称"
        @keyup.enter="handleRenameConfirm"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import { Button, theme, Dropdown, Input, Modal, Menu } from 'ant-design-vue'
import { Conversations, type Conversation } from 'ant-design-x-vue'
import type { Key } from 'ant-design-vue/es/_util/type'
import LogoComponent from './LogoComponent.vue'

interface Props {
  conversationsItems: Array<{ key: string; label: string }>
  activeKey: string
}
const addButtonText = ref('New Conversation')

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  'add-conversation': []
  'conversation-click': [key: string]
  'delete-conversation': [key: string]
  'rename-conversation': [key: string, newName: string]
}>()

const { token } = theme.useToken()

// 编辑会话名称的状态
const editingKey = ref<string | null>(null)
const editingName = ref('')
const isModalVisible = ref(false)

// 定义会话操作菜单
const conversationMenu = (conversation: Conversation) => ({
  items: [
    {
      key: 'rename',
      label: '重命名',
      icon: () => h(EditOutlined)
    },
    {
      key: 'delete',
      label: '删除',
      danger: true,
      icon: () => h(DeleteOutlined)
    }
  ],
  onClick: (info: { key: Key }) => {
    if (info.key === 'rename') {
      editingKey.value = conversation.key
      editingName.value = typeof conversation.label === 'string' ? conversation.label : ''
      isModalVisible.value = true
    } else if (info.key === 'delete') {
      emit('delete-conversation', conversation.key)
    }
  }
})

const handleAddConversation = () => {
  emit('add-conversation')
}

const handleConversationClick = (key: string) => {
  emit('conversation-click', key)
}

// 确认重命名
const handleRenameConfirm = () => {
  if (editingKey.value && editingName.value.trim()) {
    emit('rename-conversation', editingKey.value, editingName.value.trim())
    isModalVisible.value = false
    editingKey.value = null
    editingName.value = ''
  }
}

// 取消重命名
const handleRenameCancel = () => {
  isModalVisible.value = false
  editingKey.value = null
  editingName.value = ''
}
</script>
