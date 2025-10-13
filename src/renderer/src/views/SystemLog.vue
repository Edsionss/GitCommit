<template>
  <div class="system-log-container">
    <a-card title="系统日志" :bordered="false">
      <!-- 操作区域 -->
      <template #extra>
        <a-space>
          <a-select
            v-model:value="levelFilter"
            placeholder="日志级别"
            style="width: 120px"
            allow-clear
            @change="handleLevelFilterChange"
          >
            <a-select-option value="log">信息</a-select-option>
            <a-select-option value="warn">警告</a-select-option>
            <a-select-option value="error">错误</a-select-option>
          </a-select>
          <a-button
            type="primary"
            danger
            @click="handleBatchDelete"
            :disabled="!hasSelected"
            :loading="loading"
          >
            <template #icon><DeleteOutlined /></template>
            批量删除
          </a-button>
          <a-button type="primary" danger @click="handleClearAll" :loading="loading">
            <template #icon><ClearOutlined /></template>
            清空日志
          </a-button>
          <a-button @click="fetchLogs">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <!-- 表格 -->
      <a-table
        :columns="columns"
        :data-source="filteredDataSource"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        size="middle"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <!-- 日志级别标签 -->
          <template v-if="column.key === 'level'">
            <a-tag :color="getLevelTagColor(record.level)">
              {{ getLevelText(record.level) }}
            </a-tag>
          </template>
          <!-- 时间戳格式化 -->
          <template v-if="column.key === 'timestamp'">
            {{ formatTimestamp(record.timestamp) }}
          </template>
          <!-- 日志内容 -->
          <template v-if="column.key === 'content'">
            <div class="log-content">
              {{ record.content }}
            </div>
          </template>
          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showDetails(record)"> 详情 </a-button>
              <a-popconfirm
                title="确定要删除这条日志吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" size="small" danger> 删除 </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal v-model:open="isModalVisible" title="日志详情" width="800px" :footer="null">
      <a-descriptions bordered :column="1" size="small">
        <a-descriptions-item label="ID">{{ selectedLog?.id }}</a-descriptions-item>
        <a-descriptions-item label="时间戳">{{
          formatTimestamp(selectedLog?.timestamp)
        }}</a-descriptions-item>
        <a-descriptions-item label="日志级别">
          <a-tag :color="getLevelTagColor(selectedLog?.level)">
            {{ getLevelText(selectedLog?.level) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="日志内容">
          <pre class="log-detail-content">{{ selectedLog?.content }}</pre>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { DeleteOutlined, ReloadOutlined, ClearOutlined } from '@ant-design/icons-vue'
import { getSystemLogsApi, deleteSystemLogsApi, clearSystemLogsApi } from '@api/systemLog'
import type { SystemLog } from '@sharedType/systemLog'
import { copyNormalize } from '@utils/index'
// 表格列定义
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', sorter: true, width: 80 },
  { title: '时间戳', dataIndex: 'timestamp', key: 'timestamp', sorter: true, width: 180 },
  { title: '级别', dataIndex: 'level', key: 'level', width: 100 },
  { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
  { title: '操作', key: 'action', width: 120, align: 'center' }
]

// 响应式数据
const dataSource = ref<SystemLog[]>([])
const loading = ref(false)
const selectedRowKeys = ref<number[]>([])
const levelFilter = ref<string | undefined>(undefined)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 详情弹窗
const isModalVisible = ref(false)
const selectedLog = ref<SystemLog | null>(null)

// 计算属性
const hasSelected = computed(() => selectedRowKeys.value.length > 0)
const filteredDataSource = computed(() => {
  if (!levelFilter.value) {
    return dataSource.value
  }
  return dataSource.value.filter((log) => log.level === levelFilter.value)
})

// 方法
const fetchLogs = async () => {
  loading.value = true
  try {
    const { records, total } = await getSystemLogsApi(
      pagination.value.current,
      pagination.value.pageSize
    )
    dataSource.value = records
    pagination.value.total = total
  } catch (error) {
    message.error('获取日志失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const onSelectChange = (keys: number[]) => {
  selectedRowKeys.value = keys
}

const handleTableChange = (pager: any) => {
  pagination.value.current = pager.current
  pagination.value.pageSize = pager.pageSize
  fetchLogs()
}

const handleLevelFilterChange = () => {
  // 重置分页到第一页
  pagination.value.current = 1
}

const handleDelete = async (id: number) => {
  try {
    const { changes } = await deleteSystemLogsApi([id])
    if (changes > 0) {
      message.success('删除成功')
      fetchLogs()
    } else {
      message.warning('未删除任何记录')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '删除失败'
    message.error(errorMessage)
    console.error('删除失败:', error)
  }
}

const handleBatchDelete = () => {
  Modal.confirm({
    title: `确定要删除选中的 ${selectedRowKeys.value.length} 条日志吗？`,
    content: '此操作不可恢复。',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        const { changes } = await deleteSystemLogsApi(copyNormalize(selectedRowKeys.value))
        if (changes > 0) {
          message.success(`成功删除 ${changes} 条记录`)
          selectedRowKeys.value = []
          fetchLogs()
        } else {
          message.warning('未删除任何记录')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '批量删除失败'
        message.error(errorMessage)
        console.error('批量删除失败:', error)
      }
    }
  })
}

const handleClearAll = () => {
  Modal.confirm({
    title: '确定要清空所有系统日志吗？',
    content: '此操作将永久删除所有日志，且不可恢复。请谨慎操作！',
    okText: '确定清空',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        const { changes } = await clearSystemLogsApi()
        if (changes > 0) {
          message.success(`成功清空 ${changes} 条日志`)
          fetchLogs()
        } else {
          message.warning('日志已为空，无需清空')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '清空日志失败'
        message.error(errorMessage)
        console.error('清空日志失败:', error)
      }
    }
  })
}

const showDetails = (record: SystemLog) => {
  selectedLog.value = record
  isModalVisible.value = true
}

const getLevelTagColor = (level: string | undefined) => {
  switch (level) {
    case 'error':
      return 'error'
    case 'warn':
      return 'warning'
    case 'log':
    default:
      return 'default'
  }
}

const getLevelText = (level: string | undefined) => {
  switch (level) {
    case 'error':
      return '错误'
    case 'warn':
      return '警告'
    case 'log':
    default:
      return '信息'
  }
}

const formatTimestamp = (ts: string | undefined) => {
  if (!ts) return ''
  return new Date(ts).toLocaleString()
}

// 组件挂载时加载数据
onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.system-log-container {
}

.log-content {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-detail-content {
  background-color: var(--bg-elevated);
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
}
</style>
