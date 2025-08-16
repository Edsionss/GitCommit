<template>
  <a-modal v-model:open="dialogVisible" title="新建分支" width="500px" :destroy-on-close="true" @cancel="$emit('update:visible', false)">
    <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="源分支">
        <a-select v-model:value="form.sourceBranch" placeholder="选择源分支">
          <a-select-option
            v-for="branch in branches"
            :key="branch.name"
            :value="branch.name"
          >{{ branch.name }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="新分支名称">
        <a-input v-model:value="form.name" placeholder="输入新分支名称" />
      </a-form-item>
      <a-form-item label="描述">
        <a-textarea
          v-model:value="form.description"
          placeholder="分支描述（可选）"
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button @click="dialogVisible = false">取消</a-button>
      <a-button type="primary" @click="submit">创建</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import { Modal, Form, Select, Input, Button } from 'ant-design-vue';

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