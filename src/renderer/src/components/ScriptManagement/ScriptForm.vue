<template>
  <a-modal
    :open="visible"
    :title="isEditMode ? '编辑脚本' : '新建脚本'"
    :width="800"
    :footer="null"
    @cancel="handleCancel"
    @update:open="handleVisibleChange"
  >
    <a-steps :current="currentStep" class="steps-margin">
      <a-step title="基本信息" />
      <a-step title="脚本内容" />
    </a-steps>

    <!-- 步骤1：基本信息 -->
    <div v-if="currentStep === 0">
      <a-form :model="formState" layout="vertical">
        <a-form-item
          label="名称"
          name="name"
          :rules="[{ required: true, message: '请输入脚本名称' }]"
        >
          <a-input v-model:value="formState.name" placeholder="请输入脚本名称" />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea
            v-model:value="formState.description"
            placeholder="请输入脚本描述"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </div>

    <!-- 步骤2：脚本内容 -->
    <div v-if="currentStep === 1">
      <a-form :model="formState" layout="vertical">
        <a-form-item
          label="脚本内容"
          name="content"
          :rules="[{ required: true, message: '请输入脚本内容' }]"
        >
          <div style="height: 200px; border: 1px solid #303030">
            <CodeEditor
              v-model:value="formState.content"
              language="typescript"
              :options="{ theme: 'vs-dark' }"
            />
          </div>
        </a-form-item>
      </a-form>

      <a-collapse>
        <a-collapse-panel key="1" header="可用NPM包">
          <p class="description-text">
            以下包已安装在项目中，可在脚本中通过 `require('package-name')` 使用。
          </p>
          <div class="dependency-section">
            <strong>生产依赖:</strong>
            <a-tag v-for="(version, name) in dependencies" :key="name" color="blue">{{
              name
            }}</a-tag>
          </div>
          <div class="dependency-section">
            <strong>开发依赖:</strong>
            <a-tag v-for="(version, name) in devDependencies" :key="name" color="green">{{
              name
            }}</a-tag>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>

    <!-- 按钮区域 -->
    <div class="button-container">
      <a-button v-if="currentStep === 1" @click="prevStep">上一步</a-button>
      <div v-else></div>
      <div>
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="currentStep === 0 ? nextStep() : handleOk()">
            {{ currentStep === 0 ? '下一步' : isEditMode ? '更新' : '创建' }}
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, watch, reactive } from 'vue'
import { scriptManagementApi } from '@/api/scriptManagement'
import { applicationApi } from '@/api/application'
import type { Script, CreateScriptDto } from '@shared/types/dtos/ScriptManagement'
import { message } from 'ant-design-vue'
import '@utils/monacoEditor'
import { CodeEditor } from 'monaco-editor-vue3'

interface Props {
  visible: boolean
  script?: Script | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  script: null
})

const emit = defineEmits<Emits>()

const dependencies = ref<Record<string, string>>({})
const devDependencies = ref<Record<string, string>>({})
const isEditMode = ref(false)
const currentStep = ref(0)

const formState = ref<Partial<Script>>({
  name: '',
  description: '',
  content: '// 在此处编写 Node.js 脚本\nconsole.log("Hello from script!");'
})

const formRules = reactive({
  name: [{ required: true, message: '请输入脚本名称' }],
  content: [{ required: true, message: '请输入脚本内容' }]
})

// 监听 visible 变化，加载依赖
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      fetchDependencies()
      // 重置步骤
      currentStep.value = 0
    }
  }
)

// 监听 script 变化，更新表单
watch(
  () => props.script,
  (newVal) => {
    if (newVal) {
      isEditMode.value = true
      formState.value = { ...newVal }
    } else {
      isEditMode.value = false
      formState.value = {
        name: '',
        description: '',
        content: '// 在此处编写 Node.js 脚本\nconsole.log("Hello from script!");'
      }
    }
  }
)

const fetchDependencies = async () => {
  try {
    const deps = await applicationApi.getDependencies()
    dependencies.value = deps.dependencies
    devDependencies.value = deps.devDependencies
  } catch (error) {
    message.error('加载可用包列表失败')
  }
}

const nextStep = () => {
  if (currentStep.value < 1) {
    // 验证第一步的表单
    if (!formState.value.name) {
      message.error('请输入脚本名称')
      return
    }
    currentStep.value += 1
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value -= 1
  }
}

const handleOk = async () => {
  try {
    // 验证表单
    if (!formState.value.name) {
      message.error('请输入脚本名称')
      return
    }

    if (!formState.value.content) {
      message.error('请输入脚本内容')
      return
    }

    const data: CreateScriptDto = {
      name: formState.value.name!,
      description: formState.value.description,
      content: formState.value.content!
    }

    if (isEditMode.value && props.script?.id) {
      await scriptManagementApi.updateScript(props.script.id, data)
      message.success('脚本更新成功')
    } else {
      await scriptManagementApi.createScript(data)
      message.success('脚本创建成功')
    }

    emit('success')
    emit('update:visible', false)
  } catch (error) {
    message.error('操作失败')
  }
}

const handleCancel = () => {
  emit('update:visible', false)
}

const handleVisibleChange = (visible: boolean) => {
  emit('update:visible', visible)
}
</script>

<style scoped>
.button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.steps-margin {
  margin-bottom: 16px;
}

.description-text {
  font-size: 12px;
  color: var(--text-tertiary);
}

.dependency-section {
  margin-top: 8px;
}
</style>
