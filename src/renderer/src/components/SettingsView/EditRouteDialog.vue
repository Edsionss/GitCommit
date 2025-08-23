<template>
  <a-modal
    :open="open"
    title="编辑路由"
    @ok="handleSubmit"
    @cancel="() => $emit('update:open', false)"
  >
    <a-form v-if="editableRoute" :model="editableRoute" layout="vertical">
      <a-form-item label="菜单名称">
        <a-input v-model:value="editableRoute.meta.title" />
      </a-form-item>
      <a-form-item label="菜单顺序">
        <a-input-number
          v-model:value="editableRoute.menuOrder"
          style="width: 100%"
          :disabled="!editableRoute.isMenu"
          :placeholder="!editableRoute.isMenu && '菜单顺序仅对菜单有效'"
        />
      </a-form-item>
      <a-form-item label="路由路径">
        <a-input v-model:value="editableRoute.path" />
      </a-form-item>
      <a-form-item label="路由名称 (Name)">
        <a-input v-model:value="editableRoute.name" disabled />
      </a-form-item>
      <a-form-item label="组件路径">
        <a-input v-model:value="editableRoute.componentPath" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouteRecord } from '@/stores/routesStore'

const props = defineProps<{
  open: boolean
  routeData: RouteRecord | null
}>()

const emit = defineEmits(['update:open', 'submit'])

const editableRoute = ref<RouteRecord | null>(null)

watch(
  () => props.routeData,
  (newVal) => {
    if (newVal) {
      // Create a deep copy to prevent modifying the original object directly
      editableRoute.value = JSON.parse(JSON.stringify(newVal))
    }
  },
  { immediate: true }
)

const handleSubmit = () => {
  if (editableRoute.value) {
    emit('submit', editableRoute.value)
  }
}
</script>
