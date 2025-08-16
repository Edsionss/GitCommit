<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="500px"
    destroy-on-close
    @close="$emit('update:visible', false)"
  >
    <el-form ref="repoForm" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="仓库名称" prop="name">
        <el-input v-model="formData.name" placeholder="输入仓库名称"></el-input>
      </el-form-item>
      <el-form-item label="仓库路径" prop="path">
        <el-input v-model="formData.path" placeholder="输入Git仓库本地路径">
          <template #append>
            <el-button @click="selectDirectory">
              <el-icon><FolderOpened /></el-icon>
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="标签">
        <el-select
          v-model="formData.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="可选，添加标签"
        >
          <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="可选，添加描述"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { FolderOpened } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  isEdit: { type: Boolean, default: false },
  editId: { type: [String, Number], default: null },
  formData: { type: Object, required: true },
  availableTags: { type: Array, required: true }
})

const emit = defineEmits(['update:visible', 'save'])

const dialogVisible = ref(props.visible)
const repoForm = ref(null) // Ref for the form component

watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal
    if (newVal && !props.isEdit) {
      // Reset form when dialog opens for new repo
      Object.assign(props.formData, { name: '', path: '', description: '', tags: [] })
    }
  }
)

const selectDirectory = () => {
  // This should call Electron's dialog.showOpenDialog
  // Simulate selection
  setTimeout(() => {
    props.formData.path = 'D:/Selected/Repository/Path'
  }, 500)
}

const submit = async () => {
  try {
    await repoForm.value.validate()
    emit('save', { ...props.formData, id: props.editId })
    dialogVisible.value = false
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}
</script>
