<template>
  <el-card class="settings-card">
    <template #header>
      <div class="card-header">
        <span>Git 设置</span>
      </div>
    </template>

    <div class="settings-section">
      <div class="setting-item">
        <div class="setting-label">
          <el-icon><UserFilled /></el-icon>
          <span>默认作者</span>
        </div>
        <div class="setting-control">
          <el-input :model-value="settings.defaultAuthor" @update:modelValue="$emit('update:defaultAuthor', $event)" placeholder="输入默认作者名称" />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <el-icon><Message /></el-icon>
          <span>默认邮箱</span>
        </div>
        <div class="setting-control">
          <el-input :model-value="settings.defaultEmail" @update:modelValue="$emit('update:defaultEmail', $event)" placeholder="输入默认邮箱地址" />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <el-icon><FolderOpened /></el-icon>
          <span>仓库扫描路径</span>
        </div>
        <div class="setting-control">
          <el-input :model-value="settings.repositoryPath" @update:modelValue="$emit('update:repositoryPath', $event)" placeholder="输入默认仓库扫描路径">
            <template #append>
              <el-button @click="$emit('selectDirectory')">
                <el-icon><FolderAdd /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <el-icon><RefreshRight /></el-icon>
          <span>自动刷新时间间隔</span>
        </div>
        <div class="setting-control">
          <el-select :model-value="settings.refreshInterval" @update:modelValue="$emit('update:refreshInterval', $event)">
            <el-option label="禁用" value="0" />
            <el-option label="1分钟" value="60000" />
            <el-option label="5分钟" value="300000" />
            <el-option label="10分钟" value="600000" />
            <el-option label="30分钟" value="1800000" />
          </el-select>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { UserFilled, Message, FolderOpened, FolderAdd, RefreshRight } from '@element-plus/icons-vue';

defineProps({
  settings: { type: Object, required: true }
});

defineEmits(['update:defaultAuthor', 'update:defaultEmail', 'update:repositoryPath', 'update:refreshInterval', 'selectDirectory']);
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
  color: var(--color-text);
  font-weight: 500;
}

.setting-control {
  min-width: 200px;
}
</style>
