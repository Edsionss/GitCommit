<template>
  <div class="scheduler-container">
    <div class="page-header">
      <a-button type="primary" @click="showCreateModal">
        <template #icon>
          <PlusOutlined />
        </template>
        新建任务
      </a-button>
    </div>

    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="tasks"
        row-key="id"
        :loading="loading"
        :pagination="{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'isEnabled'">
            <a-tag :color="record.isEnabled === 1 ? 'success' : 'error'">
              {{ record.isEnabled === 1 ? '开启' : '关闭' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showEditModal(record)">
                <template #icon>
                  <EditOutlined />
                </template>
                编辑
              </a-button>
              <a-popconfirm title="确定删除此任务吗?" @confirm="onDelete(record.id)">
                <a-button type="link" size="small" danger>
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <TaskStepsForm
      :open="isModalVisible"
      :task="currentTask"
      @close="handleModalClose"
      @submit="handleModalSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { schedulerApi } from '@/api/scheduler'
import type {
  ScheduledTask,
  CreateScheduledTaskDto,
  UpdateScheduledTaskDto
} from '@shared/types/dtos/Scheduler'
import TaskStepsForm from '@/components/Scheduler/TaskStepsForm.vue'
import { message } from 'ant-design-vue'

const tasks = ref<ScheduledTask[]>([])
const loading = ref(false)
const isModalVisible = ref(false)
const currentTask = ref<ScheduledTask | null>(null)

const columns = [
  { title: '任务名称', dataIndex: 'name', key: 'name' },
  { title: 'Cron 表达式', dataIndex: 'cronExpression', key: 'cronExpression' },
  { title: '动作类型', dataIndex: 'actionType', key: 'actionType' },
  { title: '启用状态', dataIndex: 'isEnabled', key: 'isEnabled', align: 'center' },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '操作', key: 'action', align: 'center' }
]

const fetchTasks = async () => {
  loading.value = true
  try {
    tasks.value = await schedulerApi.getTasks()
  } catch (error) {
    message.error('加载任务列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchTasks)

const showCreateModal = () => {
  currentTask.value = null
  isModalVisible.value = true
}

const showEditModal = (task: ScheduledTask) => {
  currentTask.value = { ...task }
  isModalVisible.value = true
}

const handleModalClose = () => {
  isModalVisible.value = false
  currentTask.value = null
}

const handleModalSubmit = async (taskData: CreateScheduledTaskDto | UpdateScheduledTaskDto) => {
  try {
    if (currentTask.value && currentTask.value.id) {
      // Update
      await schedulerApi.updateTask(currentTask.value.id, taskData)
      message.success('任务更新成功')
    } else {
      // Create
      await schedulerApi.createTask(taskData as CreateScheduledTaskDto)
      message.success('任务创建成功')
    }
    fetchTasks()
    handleModalClose()
  } catch (error) {
    message.error('操作失败')
    console.error(error)
  }
}

const onToggle = async (task: ScheduledTask, checked: boolean) => {
  try {
    await schedulerApi.toggleTask(task.id!, checked ? 1 : 0)
    message.success('状态切换成功')
    fetchTasks()
  } catch (error) {
    message.error('状态切换失败')
    console.error(error)
  }
}

const onDelete = async (id: string) => {
  try {
    await schedulerApi.deleteTask(id)
    message.success('任务删除成功')
    fetchTasks()
  } catch (error) {
    message.error('删除失败')
    console.error(error)
  }
}
</script>

<style scoped>
.scheduler-container {
  padding: 14px;
  background-color: var(--bg-container);
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-secondary);
}

.page-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
}

.table-container {
  background-color: var(--bg-container);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 表格样式优化 */
:deep(.ant-table) {
  background-color: transparent;
}

:deep(.ant-table-thead > tr > th) {
  background-color: var(--bg-container);
  border-bottom: 1px solid var(--border-secondary);
  color: var(--text-primary);
  font-weight: 600;
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid var(--border-secondary);
  color: var(--text-primary);
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: var(--bg-hover);
}

/* 按钮样式优化 */
:deep(.ant-btn-primary) {
  background-color: var(--brand-primary);
  border-color: var(--brand-primary);
}

:deep(.ant-btn-primary:hover) {
  background-color: var(--brand-primary-hover);
  border-color: var(--brand-primary-hover);
}

/* 标签样式优化 */
:deep(.ant-tag) {
  border-radius: 4px;
  font-weight: 500;
}
</style>
