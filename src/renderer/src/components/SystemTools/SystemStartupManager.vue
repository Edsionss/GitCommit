<template>
  <a-card title="系统开机启动项管理" :bordered="false">
    <a-table
      :columns="columns"
      :data-source="startupApps"
      :loading="loading"
      row-key="name"
      :virtual="true"
      :scroll="{ y: 400 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-popconfirm
            title="确定要删除此启动项吗？此操作不可恢复。"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleRemove(record)"
          >
            <a-button type="link" danger>删除</a-button>
          </a-popconfirm>
        </template>
        <template v-if="column.key === 'command'">
          <a-tooltip :title="record.command">
            <span class="command-cell">{{ record.command }}</span>
          </a-tooltip>
        </template>
      </template>
    </a-table>
    <a-button @click="fetchStartupApps" :loading="loading" style="margin-top: 16px">
      刷新列表
    </a-button>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'

interface StartupApp {
  name: string
  command: string
  path: string
  enabled: boolean
}

const loading = ref(false)
const startupApps = ref<StartupApp[]>([])
let cleanupListener: () => void

const columns = [
  {
    title: '应用名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '命令',
    dataIndex: 'command',
    key: 'command',
    ellipsis: true
  },
  {
    title: '操作',
    key: 'action',
    width: 100
  }
]

const fetchStartupApps = async () => {
  loading.value = true
  try {
    const result = await window.api.getSystemStartupApps()
    if (result.success) {
      startupApps.value = result.apps
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    message.error('加载启动项列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 修改为单向发送指令
const handleRemove = (item: StartupApp) => {
  try {
    window.api.removeSystemStartupApp({ name: item.name, path: item.path })
    message.loading({ content: `正在删除: ${item.name}...`, key: 'remove-startup-app' })
  } catch (error) {
    message.error('发送删除指令失败')
    console.error(error)
  }
}

onMounted(() => {
  // 初始加载
  fetchStartupApps()

  // 设置监听器，接收后端推送的更新
  cleanupListener = window.api.onStartupAppsUpdated((updatedApps) => {
    startupApps.value = updatedApps
    message.success({ content: '列表已更新', key: 'remove-startup-app', duration: 2 })
  })
})

onUnmounted(() => {
  // 组件卸载时清理监听器
  if (cleanupListener) {
    cleanupListener()
  }
})
</script>

<style scoped>
.command-cell {
  display: block;
  max-width: 400px; /* or any other desired max-width */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
