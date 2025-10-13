<template>
  <a-modal
    :open="props.open"
    :title="isEditing ? '编辑任务' : '新建任务'"
    @cancel="close"
    @ok="submit"
  >
    <a-form :model="formState" layout="vertical">
      <a-form-item
        label="任务名称"
        :rules="[{ required: true, message: '请输入任务名称' }]"
        name="name"
      >
        <a-input v-model:value="formState.name" />
      </a-form-item>
      <a-form-item
        label="Cron 表达式"
        :rules="[{ required: true, message: '请输入 Cron 表达式' }]"
        name="cronExpression"
      >
        <a-input
          v-model:value="formState.cronExpression"
          placeholder="例如: 0 8 * * * (每天早上8点)"
        />
      </a-form-item>
      <a-form-item
        label="动作类型"
        :rules="[{ required: true, message: '请选择动作类型' }]"
        name="actionType"
      >
        <a-select v-model:value="formState.actionType">
          <a-select-option value="built_in">内置任务</a-select-option>
          <a-select-option value="run_script">执行脚本</a-select-option>
        </a-select>
      </a-form-item>

      <!-- 内置任务选择 -->
      <a-form-item
        v-if="formState.actionType === 'built_in'"
        label="选择任务"
        :rules="[{ required: true, message: '请选择一个内置任务' }]"
        name="actionPayload"
      >
        <a-select
          v-model:value="formState.actionPayload"
          placeholder="请选择内置任务"
          @change="handleBuiltInTaskChange"
        >
          <a-select-option v-for="task in builtInTasks" :key="task.id" :value="task.id">
            {{ task.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 内置任务参数 -->
      <template
        v-if="
          formState.actionType === 'built_in' &&
          selectedBuiltInTask &&
          selectedBuiltInTask.params &&
          selectedBuiltInTask.params.length > 0
        "
      >
        <a-divider orientation="left">任务参数</a-divider>
        <a-form-item
          v-for="param in selectedBuiltInTask.params"
          :key="param.name"
          :label="param.label"
          :name="['actionParams', param.name]"
          :rules="param.required ? [{ required: true, message: `请输入${param.label}` }] : []"
        >
          <!-- 字符串输入框 -->
          <a-input
            v-if="param.type === 'string'"
            v-model:value="formState.actionParams[param.name]"
            :placeholder="param.placeholder"
          />

          <!-- 数字输入框 -->
          <a-input-number
            v-else-if="param.type === 'number'"
            v-model:value="formState.actionParams[param.name]"
            :placeholder="param.placeholder"
            :min="param.validation?.min"
            :max="param.validation?.max"
            style="width: 100%"
          />

          <!-- 布尔值开关 -->
          <a-switch
            v-else-if="param.type === 'boolean'"
            v-model:checked="formState.actionParams[param.name]"
          />

          <!-- 文本域 -->
          <a-textarea
            v-else-if="param.type === 'textarea'"
            v-model:value="formState.actionParams[param.name]"
            :placeholder="param.placeholder"
            :rows="4"
          />

          <!-- 日期选择器 -->
          <a-date-picker
            v-else-if="param.type === 'date'"
            v-model:value="formState.actionParams[param.name]"
            style="width: 100%"
          />

          <!-- 时间选择器 -->
          <a-time-picker
            v-else-if="param.type === 'time'"
            v-model:value="formState.actionParams[param.name]"
            style="width: 100%"
          />

          <!-- 下拉选择框 -->
          <a-select
            v-else-if="param.type === 'select'"
            v-model:value="formState.actionParams[param.name]"
            :placeholder="param.placeholder"
          >
            <a-select-option
              v-for="option in param.options"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </template>

      <!-- 脚本路径 -->
      <a-form-item
        v-if="formState.actionType === 'run_script'"
        label="脚本路径"
        name="actionPayload"
        :rules="[{ required: true, message: '请输入脚本路径' }]"
      >
        <a-input v-model:value="formState.actionPayload" placeholder="请输入可执行脚本的绝对路径" />
      </a-form-item>

      <a-form-item label="是否启用">
        <a-switch v-model:checked="formState.isEnabled" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { PropType } from 'vue'
import type {
  ScheduledTask,
  CreateScheduledTaskDto,
  UpdateScheduledTaskDto,
  TaskFormState
} from '@shared/types/dtos/Scheduler'
import type { BuiltInTask, ParameterDefinition } from '@sharedType/parameterTypes'
import { schedulerApi } from '@/api/scheduler'
import { message } from 'ant-design-vue'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  task: {
    type: Object as PropType<ScheduledTask | null>,
    default: null
  }
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: CreateScheduledTaskDto | UpdateScheduledTaskDto): void
}>()

const isEditing = computed(() => !!props.task)

// --- 新增: 内置任务列表 ---
const builtInTasks = ref<BuiltInTask[]>([])
const selectedBuiltInTask = ref<BuiltInTask | null>(null)

const fetchBuiltInTasks = async () => {
  try {
    builtInTasks.value = await schedulerApi.getBuiltInTasks()
  } catch (error) {
    message.error('加载内置任务列表失败')
    console.error(error)
  }
}

// 处理内置任务选择变化
const handleBuiltInTaskChange = (taskId: string) => {
  selectedBuiltInTask.value = builtInTasks.value.find((task) => task.id === taskId) || null

  // 初始化参数值
  if (selectedBuiltInTask.value && selectedBuiltInTask.value.params) {
    const params: Record<string, any> = {}
    selectedBuiltInTask.value.params.forEach((param) => {
      params[param.name] = param.defaultValue || (param.type === 'boolean' ? false : '')
    })
    formState.value.actionParams = params
  } else {
    formState.value.actionParams = {}
  }
}

const createInitialFormState = (): TaskFormState => ({
  name: '',
  cronExpression: '',
  actionType: 'built_in',
  actionPayload: '',
  actionParams: {},
  isEnabled: true
})

const formState = ref<TaskFormState>(createInitialFormState())

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      fetchBuiltInTasks() // 打开模态框时加载内置任务
      if (props.task) {
        // 编辑模式
        formState.value = {
          name: props.task.name,
          cronExpression: props.task.cronExpression,
          actionType: props.task.actionType,
          actionPayload: props.task.actionPayload || '',
          actionParams: props.task.actionParams ? JSON.parse(props.task.actionParams) : {},
          isEnabled: props.task.isEnabled === 1
        }

        // 如果是内置任务，设置选中的任务并初始化参数
        if (props.task.actionType === 'built_in' && props.task.actionPayload) {
          handleBuiltInTaskChange(props.task.actionPayload)
        }
      } else {
        // 新建模式
        formState.value = createInitialFormState()
        selectedBuiltInTask.value = null
      }
    }
  }
)

// 监视动作类型变化，清空载荷和参数
watch(
  () => formState.value.actionType,
  () => {
    if (!isEditing.value) {
      // 只有在新建模式下自动清空，编辑模式下不清空以便用户可以看到原始值
      formState.value.actionPayload = ''
      formState.value.actionParams = {}
      selectedBuiltInTask.value = null
    }
  }
)

const close = () => {
  emit('close')
}

const submit = () => {
  const payload: CreateScheduledTaskDto | UpdateScheduledTaskDto = {
    ...formState.value,
    isEnabled: formState.value.isEnabled ? 1 : 0,
    // 将参数对象转换为JSON字符串
    actionParams: JSON.stringify(formState.value.actionParams || {})
  }
  emit('submit', payload)
}
</script>
