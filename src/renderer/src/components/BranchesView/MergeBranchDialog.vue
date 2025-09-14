<template>
  <a-modal
    v-model:open="dialogVisible"
    title="合并分支"
    width="500px"
    :destroy-on-close="true"
    @cancel="$emit('update:visible', false)"
  >
    <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="源分支">
        <a-input v-model:value="form.sourceBranch" disabled />
      </a-form-item>
      <a-form-item label="目标分支">
        <a-select v-model:value="form.targetBranch" placeholder="选择目标分支">
          <a-select-option
            v-for="branch in availableTargets"
            :key="branch.name"
            :value="branch.name"
            >{{ branch.name }}</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item label="合并方式">
        <a-radio-group v-model:value="form.mergeType">
          <a-radio value="merge">普通合并 (Merge)</a-radio>
          <a-radio value="rebase">变基 (Rebase)</a-radio>
          <a-radio value="squash">压缩提交 (Squash)</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="合并信息">
        <a-textarea v-model:value="form.message" placeholder="合并提交信息" />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button @click="dialogVisible = false">取消</a-button>
      <a-button type="primary" @click="submit">合并</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import type { PropType } from 'vue'

interface Branch {
  name: string
}

const props = defineProps({
  visible: { type: Boolean, default: false },
  branches: { type: Array as PropType<Branch[]>, required: true },
  sourceBranch: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'merge'])

const dialogVisible = ref(props.visible)
const form = reactive({
  sourceBranch: '',
  targetBranch: 'main',
  mergeType: 'merge',
  message: ''
})

const availableTargets = computed(() => {
  return props.branches.filter((b: Branch) => b.name !== form.sourceBranch)
})

watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal
    if (newVal) {
      form.sourceBranch = props.sourceBranch
      form.targetBranch = 'main'
      form.mergeType = 'merge'
      form.message = `将 ${props.sourceBranch} 合并到 main`
    }
  }
)

watch(dialogVisible, (newVal) => {
  if (!newVal) {
    emit('update:visible', false)
  }
})

const submit = () => {
  emit('merge', { ...form })
}
</script>
