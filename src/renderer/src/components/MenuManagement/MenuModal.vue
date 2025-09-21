<template>
  <a-modal
    :open="visible"
    :title="title"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    :maskClosable="false"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item label="父级菜单">
        <a-input :value="parentName" disabled />
      </a-form-item>
      <a-form-item label="菜单名称" :name="['meta', 'title']">
        <a-input v-model:value="formState.meta.title" placeholder="请输入菜单名称" />
      </a-form-item>
      <a-form-item label="菜单排序" name="menuOrder">
        <a-input-number v-model:value="formState.menuOrder" :min="0" style="width: 100%" />
      </a-form-item>
      <a-form-item label="菜单路由" name="path">
        <a-input v-model:value="formState.path" placeholder="例如: /system/user" />
      </a-form-item>
      <a-form-item label="路由名称" name="name">
        <a-input v-model:value="formState.name" placeholder="例如: SystemUser" />
      </a-form-item>
      <template v-if="!isEdit">
        <a-form-item label="组件文件夹" :rules="componentPathRules.folder">
          <a-select v-model:value="componentPath.folder" placeholder="默认不隐藏" show-search>
            <a-select-option value="components">@components </a-select-option>
            <a-select-option value="view">@view </a-select-option>
            <a-select-option value="custom">手动输入 </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="组件路径"
          v-if="componentPath.folder !== 'custom'"
          :rules="componentPathRules.folder"
        >
          <a-input
            v-model:value="componentPath.path"
            placeholder="文件夹后的路径 例如: system/user/index"
          />
        </a-form-item>
      </template>
      <a-form-item
        label="组件完整路径"
        name="componentPath"
        v-if="isEdit || componentPath.folder == 'custom'"
      >
        <a-input
          v-model:value="formState.componentPath"
          placeholder=" 例如：@view/system/user/index"
        />
      </a-form-item>
      <a-form-item label="是否隐藏" name="hide">
        <a-select v-model:value="formState.hide" placeholder="默认不隐藏" allow-clear show-search>
          <a-select-option value="1">是 </a-select-option>
          <a-select-option value="0">否 </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="开启缓存" :name="['meta', 'keepAlive']">
        <a-select
          v-model:value="formState.meta.keepAlive"
          placeholder="默认不开启"
          allow-clear
          show-search
        >
          <a-select-option value="1">开启 </a-select-option>
          <a-select-option value="0">关闭 </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="菜单图标" name="menuIcon">
        <div class="icon-selector-container">
          <div class="icon-grid">
            <div
              v-for="icon in menuIconArray"
              :key="icon"
              class="icon-item"
              :class="{ selected: formState.menuIcon === icon }"
              @click="formState.menuIcon = icon"
            >
              <a-tooltip :title="icon">
                <component :is="Icons[icon]" class="icon-svg" />
              </a-tooltip>
            </div>
          </div>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, type PropType } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { menuIconArray, type RouteRecord } from '@sharedType/MenuManagement'
import * as Icons from '@ant-design/icons-vue'

interface Props {
  visible: boolean
  isEdit: boolean
  initialData: RouteRecord | null
  parentData: RouteRecord | null
  isDirectory: boolean
}

interface Emits {
  (e: 'ok', data: Omit<RouteRecord, 'id' | 'children'>): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const confirmLoading = ref(false)

const getDefaultFormState = (): Omit<RouteRecord, 'id' | 'children'> => ({
  parentId: null,
  name: '',
  meta: {
    title: '',
    keepAlive: '0'
  },
  componentPath: '',
  menuOrder: 0,
  path: '',
  menuIcon: undefined,
  hide: '0'
})

let formState = reactive(getDefaultFormState())

const title = computed(() => (props.isEdit ? '编辑菜单' : '新增菜单'))
const parentName = computed(() => props.parentData?.meta.title || '顶级菜单')

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      formRef.value?.resetFields()
      if (props.isEdit && props.initialData) {
        Object.assign(formState, props.initialData)
        componentPath.folder = 'custom'
      } else {
        Object.assign(formState, getDefaultFormState())
        formState.parentId = props.parentData?.id || null
      }
    }
  }
)

const componentPath = reactive({
  folder: 'view',
  path: ''
})

const isFolder = computed(() => {
  return parentName.value == '顶级菜单'
})

const componentPathRules = computed(() => {
  // if (props.isDirectory) {
  if (isFolder) {
    return {}
  } else {
    return {
      folder: [{ required: true, message: '请选择文件夹' }],
      path: [{ required: true, message: '请输入组件路径' }]
    }
  }
})

const componentPathFull = computed(() => {
  if (componentPath.folder === 'custom') {
    return formState.componentPath
  } else {
    return `${componentPath.folder}/${componentPath.path}`
  }
})

const rules = computed(() => {
  let result = {
    meta: {
      title: [{ required: true, message: '请输入菜单名称' }]
    },
    menuOrder: [{ required: true, message: '请输入菜单排序' }],
    path: [{ required: true, message: '请输入路由路径' }]
  }
  if (!isFolder) {
    result = Object.assign(result, {
      name: [{ required: true, message: '请输入路由名称' }],
      componentPath: [{ required: true, message: '请输入组件路径' }],
      meta: {
        keepAlive: [
          {
            required: true,
            message: '请输入菜单标题'
          }
        ],
        title: [{ required: true, message: '请输入菜单名称' }]
      }
    })
  }
  return result
})

const handleOk = async () => {
  formState = { ...formState, componentPath: componentPathFull.value }
  try {
    await formRef.value?.validate()
    confirmLoading.value = true
    emit('ok', { ...formState })
    confirmLoading.value = false
  } catch (error) {
    message.error('请检查表单输入项！')
    confirmLoading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.icon-selector-container {
  width: 100%;
  max-height: 100px;
  overflow-y: auto;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-item:hover {
  background-color: #f0faff;
  border-color: #1890ff;
}

.icon-item.selected {
  background-color: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.icon-svg {
  font-size: 24px;
}
</style>
