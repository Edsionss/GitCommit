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
            <div class="icon-grid" ref="iconGridRef" @scroll="handleScroll">
              <div class="icon-scroll-content" :style="{ height: `${totalRows * rowHeight}px` }">
                <div
                  v-for="(icon, index) in visibleIcons"
                  :key="icon"
                  class="icon-item"
                  :class="{ selected: formState.menuIcon === icon }"
                  @click="formState.menuIcon = icon"
                  :style="getIconPosition(index)"
                >
                  <a-tooltip :title="icon">
                    <component :is="Icons[icon]" v-if="Icons[icon]" class="icon-svg" />
                  </a-tooltip>
                  <span>{{ icon }}</span>
                </div>
              </div>
              <div v-if="loadingMore" class="loading-more">
                <a-spin size="small" />
                <span>加载更多图标...</span>
              </div>
            </div>
          </div>
        </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, nextTick, type PropType } from 'vue'
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
const iconGridRef = ref<HTMLElement>()

// 动态加载相关状态
const loadedIcons = ref<string[]>([]) // 已加载的图标
const loadingMore = ref(false) // 是否正在加载更多
const initialLoadCount = 24 // 初始加载的图标数量
const loadMoreCount = 16 // 每次加载更多的图标数量
const hasMore = ref(true) // 是否还有更多图标可以加载

// 虚拟滚动相关状态
const scrollTop = ref(0)
const containerHeight = 100 // 容器高度
const itemHeight = 40 // 每个图标项的高度
const itemsPerRow = 8 // 每行显示的图标数量
const bufferRows = 2 // 上下缓冲的行数

// 计算每行的高度
const rowHeight = itemHeight

// 计算总行数
const totalRows = computed(() => Math.ceil(loadedIcons.value.length / itemsPerRow))

// 计算可见的起始行和结束行
const visibleRange = computed(() => {
  const startRow = Math.max(0, Math.floor(scrollTop.value / rowHeight) - bufferRows)
  const endRow = Math.min(
    totalRows.value,
    Math.ceil((scrollTop.value + containerHeight) / rowHeight) + bufferRows
  )
  return { startRow, endRow }
})

// 计算可见的图标列表
const visibleIcons = computed(() => {
  const { startRow, endRow } = visibleRange.value
  const startIndex = startRow * itemsPerRow
  const endIndex = Math.min(loadedIcons.value.length, endRow * itemsPerRow)
  return loadedIcons.value.slice(startIndex, endIndex)
})

// 获取图标的位置样式
const getIconPosition = (index: number) => {
  const { startRow } = visibleRange.value
  const actualIndex = startRow * itemsPerRow + index
  const row = Math.floor(actualIndex / itemsPerRow)
  const col = actualIndex % itemsPerRow
  
  return {
    position: 'absolute',
    top: `${row * rowHeight}px`,
    left: `${(col * 100) / itemsPerRow}%`,
    width: `${100 / itemsPerRow}%`,
    height: `${rowHeight}px`
  }
}

// 初始加载图标
const loadInitialIcons = () => {
  loadedIcons.value = menuIconArray.slice(0, initialLoadCount)
  hasMore.value = loadedIcons.value.length < menuIconArray.length
}

// 加载更多图标
const loadMoreIcons = async () => {
  if (loadingMore.value || !hasMore.value) return
  
  loadingMore.value = true
  
  // 模拟异步加载延迟
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const currentLength = loadedIcons.value.length
  const newIcons = menuIconArray.slice(currentLength, currentLength + loadMoreCount)
  
  loadedIcons.value = [...loadedIcons.value, ...newIcons]
  hasMore.value = loadedIcons.value.length < menuIconArray.length
  
  loadingMore.value = false
}

// 处理滚动事件
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  scrollTop.value = target.scrollTop
  
  // 检查是否需要加载更多
  const { scrollTop: currentScrollTop, scrollHeight, clientHeight } = target
  const scrollPercentage = (currentScrollTop + clientHeight) / scrollHeight
  
  // 当滚动到接近底部时加载更多
  if (scrollPercentage > 0.8 && hasMore.value && !loadingMore.value) {
    loadMoreIcons()
  }
}

// 重置图标列表
const resetIconList = () => {
  loadedIcons.value = []
  hasMore.value = true
  loadingMore.value = false
  scrollTop.value = 0
  loadInitialIcons()
}

// 监听模态框显示状态
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      resetIconList()
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

// 组件挂载时初始化图标列表
onMounted(() => {
  loadInitialIcons()
})
</script>

<style scoped>
.icon-selector-container {
  width: 100%;
  height: 100px;
  position: relative;
  border: 1px solid var(--border-primary, #d9d9d9);
  border-radius: 4px;
  overflow: hidden;
}

.icon-grid {
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.icon-scroll-content {
  position: relative;
  width: 100%;
}

/* 设置滚动条样式 */
.icon-grid-container::-webkit-scrollbar {
  width: 6px;
}

.icon-grid-container::-webkit-scrollbar-track {
  background: var(--bg-container, #f1f1f1);
  border-radius: 3px;
}

.icon-grid-container::-webkit-scrollbar-thumb {
  background: var(--border-secondary, #c1c1c1);
  border-radius: 3px;
}

.icon-grid-container::-webkit-scrollbar-thumb:hover {
  background: var(--border-primary, #a8a8a8);
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  color: var(--text-color-secondary);
  background: var(--bg-container);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
}

.loading-more .ant-spin {
  margin-right: 8px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}

.icon-item span {
  font-size: 10px;
  margin-top: 2px;
  text-align: center;
  word-break: break-all;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.icon-item:hover {
  background-color: var(--brand-primary-bg, rgba(24, 144, 255, 0.1));
  border-color: var(--brand-primary, #1890ff);
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.icon-item.selected {
  background-color: var(--brand-primary-bg, rgba(24, 144, 255, 0.2));
  border-color: var(--brand-primary, #1890ff);
  color: var(--brand-primary, #1890ff);
}

.icon-svg {
  font-size: 20px;
  color: var(--text-primary, #000);
  transition: color 0.2s;
}

.icon-item:hover .icon-svg {
  color: var(--brand-primary, #1890ff);
}

.icon-item.selected .icon-svg {
  color: var(--brand-primary, #1890ff);
}
</style>
