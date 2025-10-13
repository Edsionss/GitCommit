
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

    <a-modal v-model:open="isModalVisible" :title="modalTitle" @ok="handleOk" width="80%">
      <a-form :model="formState" layout="vertical">
        <a-form-item label="名称" name="name">
          <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="formState.description" />
        </a-form-item>
        <a-form-item label="脚本内容" name="content">
          <div style="height: 400px; border: 1px solid #303030;">
            <MonacoEditor
              v-model:value="formState.content"
              language="typescript"
              :options="{ theme: 'vs-dark' }"
            />
          </div>
        </a-form-item>
      </a-form>

      <div>
        <a-divider>可用NPM包</a-divider>
        <p class="text-sm text-gray-500">以下包已安装在项目中，可在脚本中通过 `require('package-name')` 使用。</p>
        <div class="mt-2">
          <strong>生产依赖:</strong>
          <a-tag v-for="(version, name) in dependencies" :key="name" color="blue">{{ name }}</a-tag>
        </div>
        <div class="mt-2">
          <strong>开发依赖:</strong>
          <a-tag v-for="(version, name) in devDependencies" :key="name" color="green">{{ name }}</a-tag>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { scriptManagementApi } from '@/api/scriptManagement';
import { applicationApi } from '@/api/application';
import type { Script, CreateScriptDto } from '@shared/types/dtos/ScriptManagement';
import { message } from 'ant-design-vue';
import MonacoEditor from 'monaco-editor-vue3';

// Manually configure the web workers
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

const scripts = ref<Script[]>([]);
const dependencies = ref<Record<string, string>>({});
const devDependencies = ref<Record<string, string>>({});
const isModalVisible = ref(false);
const isEditMode = ref(false);
const currentScriptId = ref<string | null>(null);
const modalTitle = ref('新建脚本');

const formState = ref<Partial<Script>>({
  name: '',
  description: '',
  content: '// 在此处编写 Node.js 脚本\nconsole.log("Hello from script!");'
});

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at' },
  { title: '操作', key: 'action' },
];

const fetchScripts = async () => {
  try {
    scripts.value = await scriptManagementApi.getAllScripts();
  } catch (error) {
    message.error('加载脚本列表失败');
  }
};

const fetchDependencies = async () => {
  try {
    const deps = await applicationApi.getDependencies();
    dependencies.value = deps.dependencies;
    devDependencies.value = deps.devDependencies;
  } catch (error) {
    message.error('加载可用包列表失败');
  }
};

onMounted(() => {
  fetchScripts();
  fetchDependencies();
});

const showCreateModal = () => {
  isEditMode.value = false;
  modalTitle.value = '新建脚本';
  formState.value = {
    name: '',
    description: '',
    content: '// 在此处编写 Node.js 脚本\nconsole.log("Hello from script!");'
  };
  isModalVisible.value = true;
};

const showEditModal = (script: Script) => {
  isEditMode.value = true;
  modalTitle.value = '编辑脚本';
  currentScriptId.value = script.id;
  formState.value = { ...script };
  isModalVisible.value = true;
};

const handleOk = async () => {
  try {
    const data: CreateScriptDto = {
      name: formState.value.name!,
      description: formState.value.description,
      content: formState.value.content!
    };

    if (isEditMode.value && currentScriptId.value) {
      await scriptManagementApi.updateScript(currentScriptId.value, data);
      message.success('脚本更新成功');
    } else {
      await scriptManagementApi.createScript(data);
      message.success('脚本创建成功');
    }
    isModalVisible.value = false;
    fetchScripts();
  } catch (error) {
    message.error('操作失败');
  }
};

const handleDelete = async (id: string) => {
  try {
    await scriptManagementApi.deleteScript(id);
    message.success('脚本删除成功');
    fetchScripts();
  } catch (error) {
    message.error('删除失败');
  }
};

const handleExecute = async (id: string) => {
  try {
    const result = await scriptManagementApi.executeScript(id);
    message.info('脚本执行完毕');
    // You can display the output in another modal or notification
    console.log('Stdout:', result.stdout);
    if (result.stderr) {
      console.error('Stderr:', result.stderr);
    }
  } catch (error) {
    message.error('脚本执行失败');
  }
};

</script>
