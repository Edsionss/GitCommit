<template>
  <a-modal
    :open="visible"
    :title="title"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
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
      <a-form-item label="菜单名称" name="title">
        <a-input v-model:value="formState.meta.title" placeholder="请输入菜单名称" />
      </a-form-item>
      <a-form-item label="菜单排序" name="menuOrder">
        <a-input-number v-model:value="formState.menuOrder" :min="0" style="width: 100%" />
      </a-form-item>
      <a-form-item label="菜单路由" name="path">
        <a-input v-model:value="formState.path" placeholder="例如: /system/user" />
      </a-form-item>
      <a-form-item label="路由名称" name="name" v-show="!isDirectory">
        <a-input v-model:value="formState.name" placeholder="例如: SystemUser" />
      </a-form-item>
      <a-form-item label="组件路径" name="componentPath" v-show="!isDirectory">
        <a-input v-model:value="formState.componentPath" placeholder="例如: system/user/index" />
      </a-form-item>
      <a-form-item label="是否隐藏" name="hide" v-show="!isDirectory">
        <a-select v-model:value="formState.hide" placeholder="默认不隐藏" allow-clear show-search>
          <a-select-option value="1">是 </a-select-option>
          <a-select-option value="0">否 </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="开启缓存" name="keepAlive" v-show="!isDirectory">
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
        <a-select
          v-model:value="formState.menuIcon"
          placeholder="请选择图标"
          allow-clear
          show-search
        >
          <a-select-option v-for="icon in antdIcons" :key="icon" :value="icon">
            <component :is="Icons[icon]" /> {{ icon }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, type PropType } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import type { RouteRecord } from '@type/MenuManagement'
import * as Icons from '@ant-design/icons-vue'

// 简单列举一些图标，实际项目可以更丰富
const antdIcons = [
  'HomeOutlined',
  'SettingOutlined',
  'UserOutlined',
  'TeamOutlined',
  'AppstoreOutlined',
  'SafetyCertificateOutlined'
]

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

// 监听 props 变化，更新表单数据
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      formRef.value?.resetFields()
      if (props.isEdit && props.initialData) {
        // 编辑模式：填充表单
        Object.assign(formState, props.initialData)
      } else {
        // 新增模式：设置父ID
        Object.assign(formState, getDefaultFormState())
        formState.parentId = props.parentData?.id || null
      }
    }
  }
)
const rules = computed(() => {
  let result = {
    title: [{ required: true, message: '请输入菜单名称' }],
    menuOrder: [{ required: true, message: '请输入菜单排序' }],
    path: [{ required: true, message: '请输入路由路径' }]
  }
  if (!props.isDirectory) {
    Object.assign(result, {
      name: [{ required: true, message: '请输入路由名称' }],
      componentPath: [{ required: true, message: '请输入组件路径' }],
      keepAlive: [{ required: true, message: '请选择是否开启缓存' }]
    })
  }
  return result
})

const handleOk = async () => {
  try {
    await formRef.value?.validate()
    confirmLoading.value = true
    // 模拟API请求延迟
    await new Promise((resolve) => setTimeout(resolve, 500))
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
