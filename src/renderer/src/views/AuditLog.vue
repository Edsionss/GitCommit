<template>
  <div class="audit-log-container">
    <a-card title="审计日志" :bordered="false">
      <!-- 操作区域 -->
      <template #extra>
        <a-space>
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
          <a-button @click="fetchLogs">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <!-- 表格 -->
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        size="middle"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <!-- 操作类型标签 -->
          <template v-if="column.key === 'actionType'">
            <a-tag :color="getActionTagColor(record.actionType)">
              {{ record.actionType }}
            </a-tag>
          </template>
          <!-- 时间戳格式化 -->
          <template v-if="column.key === 'timestamp'">
            {{ formatTimestamp(record.timestamp) }}
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
        <a-descriptions-item label="操作类型">{{ selectedLog?.actionType }}</a-descriptions-item>
        <a-descriptions-item label="表名">{{ selectedLog?.tableName }}</a-descriptions-item>
        <a-descriptions-item label="记录ID">{{ selectedLog?.recordId }}</a-descriptions-item>
        <a-descriptions-item label="操作者ID">{{ selectedLog?.userId }}</a-descriptions-item>
        <a-descriptions-item label="备注">{{ selectedLog?.remarks }}</a-descriptions-item>
        <a-descriptions-item label="旧数据 (Old Data)">
          <pre>{{ formatJson(selectedLog?.oldData) }}</pre>
        </a-descriptions-item>
        <a-descriptions-item label="新数据 (New Data)">
          <pre>{{ formatJson(selectedLog?.newData) }}</pre>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { getAuditLogsApi, deleteAuditLogsApi } from '@/api/auditLog'

import { AuditLog } from '@sharedType/auditLog'

// 表格列定义
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', sorter: true },
  { title: '时间戳', dataIndex: 'timestamp', key: 'timestamp', sorter: true },
  { title: '操作类型', dataIndex: 'actionType', key: 'actionType' },
  { title: '表名', dataIndex: 'tableName', key: 'tableName', sorter: true },
  { title: '记录ID', dataIndex: 'recordId', key: 'recordId' },
  { title: '操作', key: 'action', width: 120, align: 'center' }
]

// 响应式数据
const dataSource = ref<AuditLog[]>([])
const loading = ref(false)
const selectedRowKeys = ref<number[]>([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 详情弹窗
const isModalVisible = ref(false)
const selectedLog = ref<AuditLog | null>(null)

// 计算属性
const hasSelected = computed(() => selectedRowKeys.value.length > 0)

// 方法
const fetchLogs = async () => {
  loading.value = true
  try {
    const { records, total } = await getAuditLogsApi(
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

const handleDelete = async (id: number) => {
  try {
    const { changes } = await deleteAuditLogsApi([id])
    if (changes > 0) {
      message.success('删除成功')
      fetchLogs()
    } else {
      message.warning('未删除任何记录')
    }
  } catch (error) {
    message.error('删除失败')
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
        const { changes } = await deleteAuditLogsApi(selectedRowKeys.value)
        if (changes > 0) {
          message.success(`成功删除 ${changes} 条记录`)
          selectedRowKeys.value = []
          fetchLogs()
        } else {
          message.warning('未删除任何记录')
        }
      } catch (error) {
        message.error('批量删除失败')
      }
    }
  })
}

const showDetails = (record: AuditLog) => {
  selectedLog.value = record
  isModalVisible.value = true
}

const getActionTagColor = (actionType: string) => {
  switch (actionType) {
    case 'INSERT':
      return 'success'
    case 'UPDATE':
      return 'processing'
    case 'DELETE':
      return 'error'
    default:
      return 'default'
  }
}

const formatTimestamp = (ts: string | undefined) => {
  if (!ts) return ''
  return new Date(ts).toLocaleString()
}

const formatJson = (jsonString: string | undefined | null) => {
  if (!jsonString) return 'N/A'
  try {
    const obj = JSON.parse(jsonString)
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return jsonString // 如果解析失败, 返回原始字符串
  }
}

// 组件挂载时加载数据
onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.audit-log-container {
  padding: 20px;
}
pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
