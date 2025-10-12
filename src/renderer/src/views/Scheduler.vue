<template>
  <div class="p-4">
    <a-button type="primary" @click="showCreateModal" class="mb-4">新建任务</a-button>
    <a-table :columns="columns" :data-source="tasks" row-key="id" :loading="loading">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'isEnabled'">
          <a-tag :color="record.isEnabled === 1 ? 'success' : 'error'">
            {{ record.isEnabled === 1 ? '开启' : '关闭' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" @click="showEditModal(record)">编辑</a-button>
            <a-popconfirm title="确定删除此任务吗?" @confirm="onDelete(record.id)">
              <a-button type="link" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <TaskForm
      :open="isModalVisible"
      :task="currentTask"
      @close="handleModalClose"
      @submit="handleModalSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { schedulerApi } from '@/api/scheduler'
import type {
  ScheduledTask,
  CreateScheduledTaskDto,
  UpdateScheduledTaskDto
} from '@shared/types/dtos/Scheduler'
import TaskForm from '@/components/Scheduler/TaskForm.vue'
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
