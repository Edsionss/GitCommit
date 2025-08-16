<template>
  <el-dialog v-model="dialogVisible" title="合并分支" width="500px" destroy-on-close @close="$emit('update:visible', false)">
    <el-form :model="form" label-width="120px">
      <el-form-item label="源分支">
        <el-input v-model="form.sourceBranch" disabled />
      </el-form-item>
      <el-form-item label="目标分支">
        <el-select v-model="form.targetBranch" placeholder="选择目标分支">
          <el-option
            v-for="branch in availableTargets"
            :key="branch.name"
            :label="branch.name"
            :value="branch.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="合并方式">
        <el-radio-group v-model="form.mergeType">
          <el-radio :value="'merge'">普通合并 (Merge)</el-radio>
          <el-radio :value="'rebase'">变基 (Rebase)</el-radio>
          <el-radio :value="'squash'">压缩提交 (Squash)</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="合并信息">
        <el-input
          v-model="form.message"
          type="textarea"
          placeholder="合并提交信息"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">合并</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  branches: { type: Array, required: true },
  sourceBranch: { type: String, default: '' }
});

const emit = defineEmits(['update:visible', 'merge']);

const dialogVisible = ref(props.visible);
const form = reactive({
  sourceBranch: '',
  targetBranch: 'main',
  mergeType: 'merge',
  message: ''
});

const availableTargets = computed(() => {
  return props.branches.filter(b => b.name !== form.sourceBranch);
});

watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal) {
    form.sourceBranch = props.sourceBranch;
    form.targetBranch = 'main';
    form.mergeType = 'merge';
    form.message = `将 ${props.sourceBranch} 合并到 main`;
  }
});

const submit = () => {
  emit('merge', { ...form });
};
</script>
