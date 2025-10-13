<template>
  <div class="ntfy-notification-container">
    <a-card title="Ntfy消息推送" :bordered="false">
      <!-- 消息推送表单 -->
      <a-row :gutter="16" style="margin-bottom: 24px">
        <a-col :span="24">
          <a-card title="发送消息" size="small">
            <a-form :model="messageForm" layout="vertical" @finish="handleSendMessage">
              <a-form-item
                label="推送主题"
                name="topic"
                :rules="[{ required: true, message: '请输入推送主题' }]"
              >
                <a-input
                  v-model:value="messageForm.topic"
                  placeholder="例如: mytopic"
                  :disabled="sending"
                />
              </a-form-item>

              <a-form-item
                label="消息内容"
                name="message"
                :rules="[{ required: true, message: '请输入消息内容' }]"
              >
                <a-textarea
                  v-model:value="messageForm.message"
                  placeholder="请输入要推送的消息内容"
                  :rows="4"
                  :disabled="sending"
                />
              </a-form-item>

              <a-form-item>
                <a-button type="primary" html-type="submit" :loading="sending"> 发送消息 </a-button>
                <a-button style="margin-left: 8px" @click="resetForm" :disabled="sending">
                  重置
                </a-button>
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>
      </a-row>

      <!-- 推送历史记录 -->
      <a-row :gutter="16">
        <a-col :span="24">
          <a-card title="推送历史" size="small">
            <!-- 筛选条件 -->
            <div style="margin-bottom: 16px">
              <a-space>
                <a-input
                  v-model:value="filters.topic"
                  placeholder="按主题筛选"
                  style="width: 200px"
                  allowClear
                  @change="handleFilterChange"
                />
                <a-select
                  v-model:value="filters.status"
                  placeholder="按状态筛选"
                  style="width: 150px"
                  allowClear
                  @change="handleFilterChange"
                >
                  <a-select-option value="success">成功</a-select-option>
                  <a-select-option value="failed">失败</a-select-option>
                </a-select>
                <a-button type="primary" @click="refreshLogs"> 刷新 </a-button>
              </a-space>
            </div>

            <!-- 日志表格 -->
            <a-table
              :columns="logColumns"
              :data-source="logs"
              :loading="loading"
              :pagination="pagination"
              rowKey="id"
              @change="handleTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status === 'success' ? 'green' : 'red'">
                    {{ record.status === 'success' ? '成功' : '失败' }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'message'">
                  <a-tooltip :title="record.message">
                    <div class="message-cell">{{ truncateText(record.message, 50) }}</div>
                  </a-tooltip>
                </template>
                <template v-else-if="column.key === 'error_message'">
                  <a-tooltip v-if="record.error_message" :title="record.error_message">
                    <div class="error-message-cell">
                      {{ truncateText(record.error_message, 30) }}
                    </div>
                  </a-tooltip>
                  <span v-else>-</span>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { sendNtfyMessage, getNotificationLogs } from '@/api/ntfyNotification'
import type { NotificationLog } from '@sharedType/NtfyNotification'

// 消息表单
const messageForm = reactive({
  topic: '',
  message: ''
})

// 发送状态
const sending = ref(false)

// 日志相关状态
const logs = ref<NotificationLog[]>([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 筛选条件
const filters = reactive({
  topic: '',
  status: undefined as 'success' | 'failed' | undefined
})

// 表格列定义
const logColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: '主题',
    dataIndex: 'topic',
    key: 'topic',
    width: 150
  },
  {
    title: '消息内容',
    dataIndex: 'message',
    key: 'message',
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '错误信息',
    dataIndex: 'error_message',
    key: 'error_message',
    width: 200,
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180
  }
]

// 发送消息
const handleSendMessage = async () => {
  sending.value = true
  try {
    const response = await sendNtfyMessage({
      topic: messageForm.topic,
      message: messageForm.message
    })

    if (response.success) {
      message.success('消息发送成功')
      resetForm()
      refreshLogs()
    } else {
      message.error(`消息发送失败: ${response.error}`)
    }
  } catch (error) {
    console.error('发送消息出错:', error)
    message.error('发送消息时发生错误')
  } finally {
    sending.value = false
  }
}

// 重置表单
const resetForm = () => {
  messageForm.topic = ''
  messageForm.message = ''
}

// 获取日志列表
const fetchLogs = async () => {
  loading.value = true
  try {
    const response = await getNotificationLogs({
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize,
      topic: filters.topic || undefined,
      status: filters.status
    })

    if (response.success && response.logs) {
      logs.value = response.logs
      pagination.total = response.total || 0
    } else {
      message.error(`获取日志失败: ${response.error}`)
    }
  } catch (error) {
    console.error('获取日志出错:', error)
    message.error('获取日志时发生错误')
  } finally {
    loading.value = false
  }
}

// 刷新日志
const refreshLogs = () => {
  pagination.current = 1
  fetchLogs()
}

// 筛选条件变化
const handleFilterChange = () => {
  pagination.current = 1
  fetchLogs()
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchLogs()
}

// 截断文本
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return ''
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

// 组件挂载时获取日志
onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.ntfy-notification-container {
}

.message-cell,
.error-message-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
