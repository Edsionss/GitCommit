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
          <a-select-option value="notification">发送通知</a-select-option>
          <a-select-option value="run_script" disabled>执行脚本 (暂未支持)</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        v-if="formState.actionType === 'notification'"
        label="通知内容"
        name="actionPayload"
      >
        <a-textarea v-model:value="formState.actionPayload" />
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
  UpdateScheduledTaskDto
} from '@shared/types/dtos/Scheduler'

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

interface TaskFormState {
  name: string
  cronExpression: string
  actionType: 'notification' | 'run_script'
  actionPayload?: string
  isEnabled: boolean
}

const createInitialFormState = (): TaskFormState => ({
  name: '',
  cronExpression: '',
  actionType: 'notification',
  actionPayload: '',
  isEnabled: true
})

const formState = ref<TaskFormState>(createInitialFormState())

watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      formState.value = {
        name: newTask.name,
        cronExpression: newTask.cronExpression,
        actionType: newTask.actionType,
        actionPayload: newTask.actionPayload || '',
        isEnabled: newTask.isEnabled === 1
      }
    } else {
      formState.value = createInitialFormState()
    }
  }
)

const close = () => {
  emit('close')
}

const submit = () => {
  const payload: CreateScheduledTaskDto | UpdateScheduledTaskDto = {
    ...formState.value,
    isEnabled: formState.value.isEnabled ? 1 : 0
  }
  emit('submit', payload)
}
</script>
