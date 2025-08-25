<template>
  <a-card class="setting-card">
    <template #title>
      <div class="card-header">
        <span>Git 设置</span>
        <BranchesOutlined />
      </div>
    </template>
    <div class="setting-section">
      <div class="setting-item">
        <div class="setting-label">
          <UserOutlined />
          <span>默认作者</span>
        </div>
        <div class="setting-control">
          <a-input v-model:value="GitConfig.defaultAuthor" placeholder="例如：John Doe" />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <MailOutlined />
          <span>默认邮箱</span>
        </div>
        <div class="setting-control">
          <a-input v-model:value="GitConfig.defaultEmail" placeholder="例如：johndoe@example.com" />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <FolderOpenOutlined />
          <span>默认仓库路径</span>
        </div>
        <div class="setting-control">
          <a-input v-model:value="GitConfig.repositoryPath" placeholder="选择一个目录">
            <template #addonAfter>
              <span @click="selectDirectory" style="cursor: pointer">
                <FolderOutlined />
              </span>
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
          <a-select v-model:value="GitConfig.refreshInterval" style="width: 120px">
            <a-select-option value="60000">1 分钟</a-select-option>
            <a-select-option value="300000">5 分钟</a-select-option>
            <a-select-option value="600000">10 分钟</a-select-option>
            <a-select-option value="0">从不</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-label">
          <ClearOutlined />
          <span>扫描完成后清空配置</span>
        </div>
        <div class="setting-control">
          <a-switch v-model:checked="GitConfig.clearScanConfigOnFinish" />
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
  SyncOutlined,
  ClearOutlined
} from '@ant-design/icons-vue'

import { useSettingsStore } from '@/stores/settingsStore'
import { storeToRefs } from 'pinia'
const settingStore = useSettingsStore()
const { GitConfig } = storeToRefs(settingStore)

// 选择目录
const selectDirectory = async () => {}
</script>

<style scoped>
.setting-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
}

.setting-section {
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
