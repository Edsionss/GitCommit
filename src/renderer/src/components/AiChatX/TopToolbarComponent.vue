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
      <Button type="text" :icon="h(SaveOutlined)" @click="saveCurrentConversation" />
      <a-segmented v-model:value="chatStore.chatModel" :options="modelOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { Button, theme } from 'ant-design-vue'
import { MenuFoldOutlined, MenuUnfoldOutlined, SaveOutlined } from '@ant-design/icons-vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chatStore'
const chatStore = useChatStore()
const settingsStore = useSettingsStore()
const { AiConfig } = storeToRefs(settingsStore)
const model = AiConfig.value.model
interface Props {
  conversationListCollapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  conversationListCollapsed: false
})
const modelOptions = ref([
  { label: 'Chat', value: 'Chat' },
  { label: 'Function Calling', value: 'Function Calling' }
])
const emit = defineEmits<{
  'toggle-conversation-list': []
  'save-current-conversation': []
}>()

const { token } = theme.useToken()

const toggleConversationList = () => {
  emit('toggle-conversation-list')
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
