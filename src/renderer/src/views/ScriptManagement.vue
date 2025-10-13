<template>
  <div class="p-4">
    <a-card title="脚本管理">
      <template #extra>
        <a-button type="primary" @click="showCreateModal">新建脚本</a-button>
      </template>

      <a-table :columns="columns" :data-source="scripts" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="showEditModal(record)">编辑</a-button>
              <a-popconfirm title="确定删除此脚本吗?" @confirm="handleDelete(record.id)">
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
              <a-button type="link" @click="handleExecute(record.id)">执行</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <ScriptForm
      v-model:visible="isModalVisible"
      :script="currentScript"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { scriptManagementApi } from '@/api/scriptManagement'
import type { Script } from '@shared/types/dtos/ScriptManagement'
import { message } from 'ant-design-vue'
import ScriptForm from '@/components/ScriptManagement/ScriptForm.vue'

const scripts = ref<Script[]>([])
const isModalVisible = ref(false)
const currentScript = ref<Script | null>(null)

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at' },
  { title: '操作', key: 'action' }
]

const fetchScripts = async () => {
  try {
    scripts.value = await scriptManagementApi.getAllScripts()
  } catch (error) {
    message.error('加载脚本列表失败')
  }
}

onMounted(() => {
  fetchScripts()
})

const showCreateModal = () => {
  currentScript.value = null
  isModalVisible.value = true
}

const showEditModal = (script: Script) => {
  currentScript.value = script
  isModalVisible.value = true
}

const handleFormSuccess = () => {
  fetchScripts()
}

const handleDelete = async (id: string) => {
  try {
    await scriptManagementApi.deleteScript(id)
    message.success('脚本删除成功')
    fetchScripts()
  } catch (error) {
    message.error('删除失败')
  }
}

const handleExecute = async (id: string) => {
  try {
    const result = await scriptManagementApi.executeScript(id)
    message.info('脚本执行完毕')
    // You can display the output in another modal or notification
    console.log('Stdout:', result.stdout)
    if (result.stderr) {
      console.error('Stderr:', result.stderr)
    }
  } catch (error) {
    message.error('脚本执行失败')
  }
}
</script>
