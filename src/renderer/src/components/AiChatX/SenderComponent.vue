<template>
  <Sender
    :value="content"
    :style="styles.sender"
    :loading="loading"
    @submit="handleSubmit"
    @change="handleChange"
  >
    <template #prefix>
      <Badge :dot="attachedFiles.length > 0 && !headerOpen">
        <Button type="text" @click="toggleHeader">
          <template #icon>
            <PaperClipOutlined />
          </template>
        </Button>
      </Badge>
    </template>

    <template #header>
      <Sender.Header
        title="Attachments"
        :open="headerOpen"
        :styles="{ content: { padding: 0 } }"
        @open-change="handleHeaderChange"
      >
        <Attachments :before-upload="() => false" :items="attachedFiles" @change="handleFileChange">
          <template #placeholder="type">
            <Flex
              v-if="type && type.type === 'inline'"
              align="center"
              justify="center"
              vertical
              gap="2"
            >
              <Typography.Text style="font-size: 30px; line-height: 1">
                <CloudUploadOutlined />
              </Typography.Text>
              <Typography.Title :level="5" style="margin: 0; font-size: 14px; line-height: 1.5">
                Upload files
              </Typography.Title>
              <Typography.Text type="secondary">
                Click or drag files to this area to upload
              </Typography.Text>
            </Flex>
            <Typography.Text v-if="type && type.type === 'drop'"> Drop file here </Typography.Text>
          </template>
        </Attachments>
      </Sender.Header>
    </template>
  </Sender>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CloudUploadOutlined, PaperClipOutlined } from '@ant-design/icons-vue'
import { Badge, Button, Flex, Typography, theme } from 'ant-design-vue'
import { Attachments, Sender } from 'ant-design-x-vue'
import type { AttachmentsProps } from 'ant-design-x-vue'

interface Props {
  content: string
  loading: boolean
  headerOpen?: boolean
  attachedFiles?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  headerOpen: false,
  attachedFiles: () => []
})

const emit = defineEmits<{
  submit: [content: string]
  change: [value: string]
  'file-change': [fileList: AttachmentsProps['items']]
  'header-change': [open: boolean]
}>()

const { token } = theme.useToken()
const headerOpen = ref(props.headerOpen)
const attachedFiles = ref<AttachmentsProps['items']>(props.attachedFiles || [])

const styles = computed(() => {
  return {
    sender: {
      'box-shadow': token.value.boxShadow
    }
  } as const
})

// 监听 props.attachedFiles 的变化
watch(
  () => props.attachedFiles,
  (newFiles) => {
    if (newFiles) {
      attachedFiles.value = newFiles
    }
  },
  { deep: true }
)

// 监听 props.headerOpen 的变化
watch(
  () => props.headerOpen,
  (newOpen) => {
    if (newOpen !== undefined) {
      headerOpen.value = newOpen
    }
  }
)

const handleSubmit = (nextContent: string) => {
  if (!nextContent) return
  emit('submit', nextContent)
}

const handleChange = (value: string) => {
  emit('change', value)
}

const toggleHeader = () => {
  headerOpen.value = !headerOpen.value
}

const handleHeaderChange = (open: boolean) => {
  headerOpen.value = open
  emit('header-change', open)
}

const handleFileChange: AttachmentsProps['onChange'] = (info) => {
  attachedFiles.value = info.fileList
  emit('file-change', attachedFiles.value)
}
</script>
