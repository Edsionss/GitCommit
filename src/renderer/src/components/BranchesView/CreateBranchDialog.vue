<template>
  <el-dialog v-model="dialogVisible" title="新建分支" width="500px" destroy-on-close @close="$emit('update:visible', false)">
    <el-form :model="form" label-width="120px">
      <el-form-item label="源分支">
        <el-select v-model="form.sourceBranch" placeholder="选择源分支">
          <el-option
            v-for="branch in branches"
            :key="branch.name"
            :label="branch.name"
            :value="branch.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="新分支名称">
        <el-input v-model="form.name" placeholder="输入新分支名称" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="分支描述（可选）"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">创建</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  branches: { type: Array, required: true }
});

const emit = defineEmits(['update:visible', 'create']);

const dialogVisible = ref(props.visible);
const form = reactive({
  sourceBranch: 'main',
  name: '',
  description: ''
});

watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal) {
    // Reset form when dialog opens
    form.sourceBranch = 'main';
    form.name = '';
    form.description = '';
  }
});

const submit = () => {
  emit('create', { ...form });
};
</script>
