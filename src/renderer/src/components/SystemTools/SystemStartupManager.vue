<template>
  <a-card title="系统开机启动项管理" :bordered="false">
    <a-table :columns="columns" :data-source="startupApps" :loading="loading" row-key="name">
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
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'

interface StartupApp {
  name: string
  command: string
  path: string
  enabled: boolean
}

const loading = ref(false)
const startupApps = ref<StartupApp[]>([])

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

const handleRemove = async (item: StartupApp) => {
  try {
    const result = await window.api.removeSystemStartupApp({ name: item.name, path: item.path })
    if (result.success) {
      message.success(`已删除启动项: ${item.name}`)
      fetchStartupApps() // Refresh the list
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    message.error('删除启动项失败')
    console.error(error)
  }
}

onMounted(() => {
  fetchStartupApps()
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
