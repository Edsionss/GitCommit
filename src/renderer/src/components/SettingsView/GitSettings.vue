<template>
  <a-card class="settings-card">
    <template #title>
      <div class="card-header">
        <span>Git 设置</span>
        <BranchesOutlined />
      </div>
    </template>
    <div class="settings-section">
      <div class="setting-item">
        <div class="setting-label">
          <UserOutlined />
          <span>默认作者</span>
        </div>
        <div class="setting-control">
          <a-input
            :value="settings.defaultAuthor"
            @change="(e) => $emit('update:defaultAuthor', e.target.value)"
            placeholder="例如：John Doe"
          />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <MailOutlined />
          <span>默认邮箱</span>
        </div>
        <div class="setting-control">
          <a-input
            :value="settings.defaultEmail"
            @change="(e) => $emit('update:defaultEmail', e.target.value)"
            placeholder="例如：johndoe@example.com"
          />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <FolderOpenOutlined />
          <span>默认仓库路径</span>
        </div>
        <div class="setting-control">
          <a-input
            :value="settings.repositoryPath"
            @change="(e) => $emit('update:repositoryPath', e.target.value)"
            placeholder="选择一个目录"
          >
            <template #addonAfter>
              <a-button @click="$emit('selectDirectory')">
                <FolderOutlined />
              </a-button>
            </template>
          </a-input>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <SyncOutlined />
          <span>自动刷新间隔</span>
        </div>
        <div class="setting-control">
          <a-select
            :value="settings.refreshInterval"
            @change="(value) => $emit('update:refreshInterval', value)"
            style="width: 120px"
          >
            <a-select-option value="60000">1 分钟</a-select-option>
            <a-select-option value="300000">5 分钟</a-select-option>
            <a-select-option value="600000">10 分钟</a-select-option>
            <a-select-option value="0">从不</a-select-option>
          </a-select>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import {
  BranchesOutlined,
  UserOutlined,
  MailOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  SyncOutlined
} from '@ant-design/icons-vue'

defineProps({
  settings: { type: Object, required: true }
})

defineEmits([
  'update:defaultAuthor',
  'update:defaultEmail',
  'update:repositoryPath',
  'update:refreshInterval',
  'selectDirectory'
])
</script>

<style scoped>
.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.setting-control {
  min-width: 200px;
  justify-content: flex-end;
}
</style>