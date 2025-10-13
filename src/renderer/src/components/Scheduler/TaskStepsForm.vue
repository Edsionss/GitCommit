<template>
  <a-modal
    :open="props.open"
    :title="isEditing ? '编辑任务' : '新建任务'"
    :width="800"
    @cancel="close"
    :footer="null"
  >
    <a-steps :current="currentStep" class="mb-6">
      <a-step title="基本信息" description="设置任务名称、执行时间和类型" />
      <a-step title="任务参数" description="配置任务执行所需的参数" />
    </a-steps>

    <!-- 第一步：基本信息 -->
    <div v-show="currentStep === 0">
      <a-form ref="basicFormRef" :model="formState" layout="vertical" :rules="basicFormRules">
        <a-form-item label="任务名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入任务名称" />
        </a-form-item>

        <a-form-item label="Cron 表达式" name="cronExpression">
          <a-input
            v-model:value="formState.cronExpression"
            placeholder="例如: 0 8 * * * (每天早上8点)"
          />
          <div class="text-xs text-secondary mt-1">支持标准Cron表达式，格式：分 时 日 月 周</div>
        </a-form-item>

        <a-form-item label="动作类型" name="actionType">
          <a-select v-model:value="formState.actionType" placeholder="请选择动作类型">
            <a-select-option value="built_in">内置任务</a-select-option>
            <a-select-option value="run_script">执行脚本</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 内置任务选择 -->
        <a-form-item
          v-if="formState.actionType === 'built_in'"
          label="选择任务"
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
          <div v-if="selectedBuiltInTask" class="text-xs text-secondary mt-1">
            {{ selectedBuiltInTask.description }}
          </div>
        </a-form-item>

        <!-- 脚本选择 -->
        <a-form-item v-if="formState.actionType === 'run_script'" label="选择脚本" name="script_id">
          <a-select
            v-model:value="formState.script_id"
            placeholder="请选择要执行的脚本"
            show-search
            :filter-option="
              (input, option) => option.label.toLowerCase().includes(input.toLowerCase())
            "
          >
            <a-select-option
              v-for="script in scripts"
              :key="script.id"
              :value="script.id"
              :label="script.name"
            >
              {{ script.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="是否启用">
          <a-switch v-model:checked="formState.isEnabled" />
        </a-form-item>
      </a-form>
    </div>

    <!-- 第二步：任务参数 -->
    <div v-show="currentStep === 1">
      <div
        v-if="
          formState.actionType === 'built_in' &&
          selectedBuiltInTask &&
          selectedBuiltInTask.params &&
          selectedBuiltInTask.params.length > 0
        "
      >
        <a-form ref="paramsFormRef" :model="formState" layout="vertical" :rules="paramsFormRules">
          <a-divider orientation="left">任务参数配置</a-divider>
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
        </a-form>
      </div>

      <div v-else class="text-center py-8">
        <a-empty description="当前任务类型无需配置参数" />
      </div>
    </div>

    <!-- 步骤导航按钮 -->
    <div class="flex justify-between mt-6">
      <a-button v-if="currentStep > 0" @click="prevStep"> 上一步 </a-button>
      <div v-else></div>

      <a-space>
        <a-button @click="close">取消</a-button>
        <a-button v-if="currentStep < 1" type="primary" @click="nextStep"> 下一步 </a-button>
        <a-button v-else type="primary" @click="submit" :loading="submitting">
          {{ isEditing ? '更新任务' : '创建任务' }}
        </a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { schedulerApi } from '@/api/scheduler'
import { scriptManagementApi } from '@/api/scriptManagement'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import type { Script } from '@shared/types/dtos/ScriptManagement'
import { ref, watch, computed, reactive, type PropType } from 'vue'
import type { BuiltInTask, ParameterDefinition } from '@sharedType/parameterTypes'
import type {
  ScheduledTask,
  CreateScheduledTaskDto,
  UpdateScheduledTaskDto,
  TaskFormState
} from '@sharedType/Scheduler'

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
const currentStep = ref(0)
const submitting = ref(false)

// 表单引用
const basicFormRef = ref<FormInstance>()
const paramsFormRef = ref<FormInstance>()

// 内置任务和脚本列表
const builtInTasks = ref<BuiltInTask[]>([])
const scripts = ref<Script[]>([])
const selectedBuiltInTask = ref<BuiltInTask | null>(null)

// 表单验证规则
const basicFormRules = reactive({
  name: [{ required: true, message: '请输入任务名称' }],
  cronExpression: [{ required: true, message: '请输入 Cron 表达式' }],
  actionType: [{ required: true, message: '请选择动作类型' }],
  actionPayload: [
    {
      validator: (_rule: any, value: string) => {
        if (formState.value.actionType === 'built_in' && !value) {
          return Promise.reject('请选择内置任务')
        }
        return Promise.resolve()
      }
    }
  ],
  script_id: [
    {
      validator: (_rule: any, value: string) => {
        if (formState.value.actionType === 'run_script' && !value) {
          return Promise.reject('请选择脚本')
        }
        return Promise.resolve()
      }
    }
  ]
})

// 动态生成参数验证规则
const paramsFormRules = computed(() => {
  const rules: any = {}
  if (selectedBuiltInTask.value && selectedBuiltInTask.value.params) {
    selectedBuiltInTask.value.params.forEach((param) => {
      if (param.required) {
        rules[`actionParams.${param.name}`] = [{ required: true, message: `请输入${param.label}` }]
      }
    })
  }
  return rules
})

const fetchBuiltInTasks = async () => {
  try {
    builtInTasks.value = await schedulerApi.getBuiltInTasks()
  } catch (error) {
    message.error('加载内置任务列表失败')
    console.error(error)
  }
}

const fetchScripts = async () => {
  try {
    scripts.value = await scriptManagementApi.getAllScripts()
  } catch (error) {
    message.error('加载脚本列表失败')
    console.error(error)
  }
}

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
  script_id: undefined,
  actionParams: {},
  isEnabled: true
})

const formState = ref<TaskFormState>(createInitialFormState())

// 步骤导航
const nextStep = async () => {
  try {
    await basicFormRef.value?.validate()
    currentStep.value++
  } catch (error) {
    // 验证失败，不跳转
  }
}

const prevStep = () => {
  currentStep.value--
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      fetchBuiltInTasks()
      fetchScripts()
      currentStep.value = 0 // 重置步骤
      if (props.task) {
        // 编辑模式
        formState.value = {
          name: props.task.name,
          cronExpression: props.task.cronExpression,
          actionType: props.task.actionType,
          actionPayload: props.task.actionPayload || '',
          script_id: props.task.script_id || undefined,
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
      formState.value.script_id = undefined
      formState.value.actionParams = {}
      selectedBuiltInTask.value = null
    }
  }
)

const close = () => {
  emit('close')
}

const submit = async () => {
  // 如果有参数表单，先验证参数表单
  if (paramsFormRef.value) {
    try {
      await paramsFormRef.value.validate()
    } catch (error) {
      // 验证失败，不提交
      return
    }
  }

  submitting.value = true
  try {
    const payload: CreateScheduledTaskDto | UpdateScheduledTaskDto = {
      ...formState.value,
      isEnabled: formState.value.isEnabled ? 1 : 0,
      // 将参数对象转换为JSON字符串
      actionParams: JSON.stringify(formState.value.actionParams || {})
    }
    emit('submit', payload)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.mb-6 {
  margin-bottom: 24px;
}

.mt-1 {
  margin-top: 4px;
}

.mt-6 {
  margin-top: 24px;
}

.py-8 {
  padding-top: 32px;
  padding-bottom: 32px;
}

.text-xs {
  font-size: 12px;
}

.text-secondary {
  color: var(--text-secondary);
}

.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}
</style>
