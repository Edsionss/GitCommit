<template>
  <div
    class="flex justify-between items-center h-12 border-b flex-shrink-0 !p-2"
    :style="{ borderBottomColor: token.colorBorder }"
  >
    <!-- 左侧按钮：收起展开按钮 -->
    <div class="flex gap-2">
      <Button
        type="text"
        :icon="conversationListCollapsed ? h(MenuUnfoldOutlined) : h(MenuFoldOutlined)"
        @click="toggleConversationList"
      />
    </div>
    <div class="flex-1 flex items-center justify-center">
      <div class="model-tag">{{ model }}</div>
    </div>
    <!-- 右侧按钮：其他功能按钮 -->
    <div class="flex gap-2">
      <Button
        type="text"
        :icon="h(PlayCircleOutlined)"
        :class="{ 'text-primary': streamingEnabled }"
        @click="toggleStreaming"
      />
      <Button type="text" :icon="h(SaveOutlined)" @click="saveCurrentConversation" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, theme } from 'ant-design-vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlayCircleOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import { h } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { storeToRefs } from 'pinia'

const settingsStore = useSettingsStore()
const { AiConfig } = storeToRefs(settingsStore)
const model = AiConfig.value.model
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

<style scoped lang="scss">
.model-tag {
  font-weight: bold;
}
</style>
