<template>
  <el-drawer v-model="visible" title="提交详情" size="50%" direction="rtl" @close="$emit('update:visible', false)">
    <div v-if="commit" class="commit-details">
      <el-descriptions border column="1" :title="`提交 #${commit.shortHash}`">
        <el-descriptions-item label="提交ID">
          <div class="copy-with-button">
            <span>{{ commit.commitId }}</span>
            <el-button
              link
              type="primary"
              size="small"
              @click="$emit('copyToClipboard', commit.commitId)"
            >
              <el-icon><DocumentCopy /></el-icon>
            </el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="仓库">{{
          commit.repository
        }}</el-descriptions-item>
        <el-descriptions-item label="作者">
          <div class="commit-author">
            <el-avatar :size="24">
              {{ commit.author.substring(0, 1).toUpperCase() }}
            </el-avatar>
            <span>{{ commit.author }}</span>
            <span class="email" v-if="commit.email">
              &lt;{{ commit.email }}&gt;
            </span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="日期">
          {{ formatDate(commit.date) }}
        </el-descriptions-item>
        <el-descriptions-item label="提交消息">
          <div class="commit-message">
            <div v-if="hasTags(commit.message)" class="message-tags">
              <el-tag
                v-for="tag in extractTags(commit.message)"
                :key="tag"
                size="small"
                class="message-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
            <p class="commit-title">{{ cleanMessage(commit.message) }}</p>
            <pre v-if="commit.body" class="commit-body">{{ commit.body }}</pre>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="文件变更">
          <div class="commit-stats">
            <el-tag type="info">{{ commit.filesChanged }} 个文件</el-tag>
            <el-tag type="success">+{{ commit.insertions }}</el-tag>
            <el-tag type="danger">-{{ commit.deletions }}</el-tag>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { DocumentCopy } from '@element-plus/icons-vue';

defineProps({
  visible: { type: Boolean, required: true },
  commit: { type: Object, default: null },
  formatDate: { type: Function, required: true },
  hasTags: { type: Function, required: true },
  extractTags: { type: Function, required: true },
  cleanMessage: { type: Function, required: true },
  copyToClipboard: { type: Function, required: true }
});

defineEmits(['update:visible', 'copyToClipboard']);
</script>

<style scoped>
.commit-details {
  padding: var(--spacing-md);
}

.commit-author {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.email {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.commit-message {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.commit-title {
  font-weight: var(--font-weight-semibold);
  margin: 0;
  line-height: 1.5;
}

.commit-body {
  margin: 0;
  white-space: pre-wrap;
  font-family: 'Fira Code', monospace;
  font-size: var(--font-size-sm);
  background-color: #f8f9fa;
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  border-left: 3px solid var(--border-color);
}

.commit-stats {
  display: flex;
  gap: var(--spacing-sm);
}

.copy-with-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: 'Fira Code', monospace;
  font-size: var(--font-size-sm);
  background-color: #f8f9fa;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  overflow-x: auto;
}
</style>
