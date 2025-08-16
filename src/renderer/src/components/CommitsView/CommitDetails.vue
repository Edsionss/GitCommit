<template>
  <div class="commit-details" v-if="commit">
    <el-tabs>
      <el-tab-pane label="提交详情">
        <div class="commit-detail-header">
          <h2 class="commit-title">{{ commit.title }}</h2>
          <div class="commit-hash">
            <span>完整哈希值：</span>
            <el-tag size="small" @click="$emit('copy', commit.hash)">
              {{ commit.hash }}
              <el-icon><CopyDocument /></el-icon>
            </el-tag>
          </div>
        </div>

        <div class="commit-meta">
          <div class="meta-item">
            <span class="meta-label">作者：</span>
            <span class="meta-value">{{ commit.author }} &lt;{{ commit.authorEmail }}&gt;</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">日期：</span>
            <span class="meta-value">{{ formatDate(commit.date, 'YYYY-MM-DD HH:mm:ss') }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">分支：</span>
            <span class="meta-value">
              <el-tag size="small" v-for="branch in commit.branches" :key="branch">
                {{ branch }}
              </el-tag>
            </span>
          </div>
        </div>

        <div class="commit-message" v-if="commit.fullMessage">
          <h3>提交信息</h3>
          <pre>{{ commit.fullMessage }}</pre>
        </div>

        <div class="commit-parent" v-if="commit.parents.length > 0">
          <h3>父提交</h3>
          <div class="parent-hashes">
            <el-tag
              v-for="parent in commit.parents"
              :key="parent"
              size="small"
              @click="$emit('loadCommit', parent)"
            >
              {{ parent.substring(0, 7) }}
            </el-tag>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="变更文件">
        <div class="files-summary">
          <div class="files-count">
            <span>共 {{ commit.files.length }} 个文件变更</span>
            <span class="changes-summary">
              <span class="additions">+{{ commit.additions }}</span>
              <span class="deletions">-{{ commit.deletions }}</span>
            </span>
          </div>

          <div class="files-filter">
            <el-input v-model="fileFilter" placeholder="筛选文件" clearable size="small">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>

        <div class="file-list">
          <div
            v-for="(file, fileIndex) in filteredFiles"
            :key="file.path"
            class="file-item"
            :class="{ active: selectedFileIndex === fileIndex }"
            @click="selectFile(fileIndex)"
          >
            <div class="file-icon">
              <el-icon v-if="file.status === 'added'"><Plus /></el-icon>
              <el-icon v-else-if="file.status === 'modified'"><Edit /></el-icon>
              <el-icon v-else-if="file.status === 'deleted'"><Delete /></el-icon>
              <el-icon v-else-if="file.status === 'renamed'"><Right /></el-icon>
            </div>

            <div class="file-path">{{ file.path }}</div>

            <div class="file-changes">
              <span class="additions">+{{ file.additions }}</span>
              <span class="deletions">-{{ file.deletions }}</span>
            </div>
          </div>
        </div>

        <div class="diff-viewer" v-if="selectedFile">
          <div class="diff-header">
            <div class="file-path">{{ selectedFile.path }}</div>
            <div class="diff-actions">
              <el-button-group>
                <el-button size="small" :disabled="!canShowSideBySide">
                  <el-icon><DCaret /></el-icon> 并排视图
                </el-button>
                <el-button size="small">
                  <el-icon><Bottom /></el-icon> 统一视图
                </el-button>
              </el-button-group>
            </div>
          </div>

          <div class="diff-content">
            <pre v-if="selectedFile.diff" class="diff-code">{{ selectedFile.diff }}</pre>
            <el-empty description="无法显示差异" v-else></el-empty>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { CopyDocument, Search, Plus, Edit, Delete, Right, DCaret, Bottom } from '@element-plus/icons-vue';

const props = defineProps({
  commit: { type: Object, default: null },
  formatDate: { type: Function, required: true }
});

defineEmits(['copy', 'loadCommit']);

const fileFilter = ref('');
const selectedFileIndex = ref(0);

const filteredFiles = computed(() => {
  if (!props.commit) return [];
  if (!fileFilter.value) return props.commit.files;
  return props.commit.files.filter(file => file.path.toLowerCase().includes(fileFilter.value.toLowerCase()));
});

const selectedFile = computed(() => {
  if (!props.commit || selectedFileIndex.value < 0) return null;
  return filteredFiles.value[selectedFileIndex.value];
});

const canShowSideBySide = computed(() => {
  return selectedFile.value && selectedFile.value.status !== 'deleted' && selectedFile.value.status !== 'added';
});

const selectFile = (index: number) => {
  selectedFileIndex.value = index;
};
</script>

<style scoped>
/* Styles copied from CommitsView.vue */
.commit-details { flex: 1; overflow-y: auto; padding: 16px; }
.commit-detail-header { margin-bottom: 16px; }
.commit-title { font-size: 1.2em; font-weight: 600;}
.commit-meta { background-color: var(--color-background-soft); padding: 12px; border-radius: 4px; margin-bottom: 16px; }
.meta-item { margin-bottom: 8px; }
.meta-label { font-weight: var(--font-weight-medium); margin-right: 8px; }
.commit-message { margin-bottom: 16px; }
.commit-message pre { background-color: var(--color-background-soft); padding: 12px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; }
.parent-hashes { display: flex; gap: 8px; flex-wrap: wrap; }
.files-summary { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.changes-summary { margin-left: 12px; }
.file-list { border: 1px solid var(--color-border); border-radius: 4px; max-height: 200px; overflow-y: auto; }
.file-item { display: flex; align-items: center; padding: 8px 12px; border-bottom: 1px solid var(--color-border); cursor: pointer; }
.file-item:hover { background-color: var(--color-background-soft); }
.file-item.active { background-color: var(--color-background-mute); }
.file-icon { margin-right: 8px; }
.file-path { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-changes { display: flex; gap: 8px; }
.additions { color: var(--color-success); }
.deletions { color: var(--color-danger); }
.diff-viewer { margin-top: 16px; border: 1px solid var(--color-border); border-radius: 4px; }
.diff-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background-color: var(--color-background-mute); border-bottom: 1px solid var(--color-border); }
.diff-content { overflow-x: auto; }
.diff-code { margin: 0; padding: 12px; font-family: monospace; font-size: var(--font-size-sm); line-height: 1.5; white-space: pre; }
</style>
