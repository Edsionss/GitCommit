<template>
  <a-modal
    :open="visible"
    :title="isEditMode ? '编辑脚本' : '新建脚本'"
    @ok="handleOk"
    @cancel="handleCancel"
    @update:open="handleVisibleChange"
    width="80%"
  >
    <a-form :model="formState" layout="vertical">
      <a-form-item label="名称" name="name">
        <a-input v-model:value="formState.name" />
      </a-form-item>
      <a-form-item label="描述" name="description">
        <a-textarea v-model:value="formState.description" />
      </a-form-item>
      <a-form-item label="脚本内容" name="content">
        <div style="height: 400px; border: 1px solid #303030">
          <CodeEditor
            v-model:value="formState.content"
            language="typescript"
            :options="{ theme: 'vs-dark' }"
          />
        </div>
      </a-form-item>
    </a-form>

    <div>
      <a-divider>可用NPM包</a-divider>
      <p class="text-sm text-gray-500">
        以下包已安装在项目中，可在脚本中通过 `require('package-name')` 使用。
      </p>
      <div class="mt-2">
        <strong>生产依赖:</strong>
        <a-tag v-for="(version, name) in dependencies" :key="name" color="blue">{{ name }}</a-tag>
      </div>
      <div class="mt-2">
        <strong>开发依赖:</strong>
        <a-tag v-for="(version, name) in devDependencies" :key="name" color="green">{{
          name
        }}</a-tag>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
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

const formState = ref<Partial<Script>>({
  name: '',
  description: '',
  content: '// 在此处编写 Node.js 脚本\nconsole.log("Hello from script!");'
})

// 监听 visible 变化，加载依赖
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      fetchDependencies()
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

const handleOk = async () => {
  try {
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
