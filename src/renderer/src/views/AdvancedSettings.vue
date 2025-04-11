<template>
  <div class="router-view-container">
    <div class="advanced-settings">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <span>高级设置</span>
            <el-icon><Setting /></el-icon>
          </div>
        </template>
        <el-form :model="form" label-width="120px">
          <!-- 输出格式设置 -->
          <el-form-item label="输出文件格式">
            <el-radio-group v-model="form.outputFormat">
              <el-radio label="csv">CSV</el-radio>
              <el-radio label="json">JSON</el-radio>
              <el-radio label="txt">TXT</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 日期格式设置 -->
          <el-form-item label="日期格式">
            <el-select v-model="form.dateFormat" placeholder="选择日期格式">
              <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
              <el-option label="YYYY/MM/DD" value="YYYY/MM/DD" />
              <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
              <el-option label="MM/DD/YYYY" value="MM/DD/YYYY" />
            </el-select>
          </el-form-item>

          <!-- 编码设置 -->
          <el-form-item label="文件编码">
            <el-select v-model="form.encoding" placeholder="选择文件编码">
              <el-option label="UTF-8" value="utf8" />
              <el-option label="GBK" value="gbk" />
              <el-option label="GB2312" value="gb2312" />
            </el-select>
          </el-form-item>

          <!-- 输出目录设置 -->
          <el-form-item label="输出目录">
            <el-input v-model="form.outputDir" placeholder="请选择输出目录">
              <template #append>
                <el-button @click="selectOutputDir">
                  <el-icon><Folder /></el-icon>
                </el-button>
              </template>
            </el-input>
          </el-form-item>

          <!-- 日志设置 -->
          <el-form-item label="日志级别">
            <el-select v-model="form.logLevel" placeholder="选择日志级别">
              <el-option label="DEBUG" value="debug" />
              <el-option label="INFO" value="info" />
              <el-option label="WARN" value="warn" />
              <el-option label="ERROR" value="error" />
            </el-select>
          </el-form-item>

          <!-- 保存设置 -->
          <el-form-item>
            <div class="action-buttons">
              <el-button type="primary" @click="saveSettings">保存设置</el-button>
              <el-button @click="resetSettings">重置设置</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Folder } from '@element-plus/icons-vue'

const form = reactive({
  outputFormat: 'csv',
  dateFormat: 'YYYY-MM-DD',
  encoding: 'utf8',
  outputDir: '',
  logLevel: 'info'
})

const selectOutputDir = async () => {
  try {
    const result = await window.api.selectDirectory()
    if (result) {
      form.outputDir = result
    }
  } catch (error) {
    console.error('选择目录失败:', error)
    ElMessage.error('选择目录失败')
  }
}

const saveSettings = () => {
  // 将设置保存到localStorage
  localStorage.setItem('appSettings', JSON.stringify(form))
  ElMessage.success('设置已保存')
}

const resetSettings = () => {
  form.outputFormat = 'csv'
  form.dateFormat = 'YYYY-MM-DD'
  form.encoding = 'utf8'
  form.outputDir = ''
  form.logLevel = 'info'
  // 清除保存的设置
  localStorage.removeItem('appSettings')
  ElMessage.info('设置已重置')
}
</script>

<style scoped>
.advanced-settings {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-card {
  width: 100%;
  margin-bottom: var(--spacing-lg);
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.settings-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: #f8f9fa;
  border-bottom: var(--border);
}

.card-header span {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.card-header .el-icon {
  font-size: 20px;
  color: var(--primary-color);
  transition: transform var(--transition-normal);
}

.settings-card:hover .card-header .el-icon {
  transform: rotate(45deg);
}

.el-radio-group,
.el-select {
  width: 100%;
  margin-bottom: var(--spacing-sm);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.el-radio {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.el-radio:hover {
  background-color: var(--hover-bg);
  transform: translateY(-2px);
}

.el-radio.is-checked {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.el-radio.is-checked .el-radio__label {
  color: white !important;
}

.el-radio.is-checked .el-radio__inner {
  background-color: white !important;
  border-color: white !important;
}

.el-radio.is-checked .el-radio__inner::after {
  background-color: var(--primary-color) !important;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  flex-wrap: wrap;
  justify-content: center;
}

.action-buttons .el-button {
  min-width: 120px;
  transition: all var(--transition-normal);
}

.action-buttons .el-button:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

/* 表单项动画效果 */
:deep(.el-form-item) {
  transition: all var(--transition-normal);
  animation: slideIn 0.5s ease-out;
  animation-fill-mode: both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

:deep(.el-form-item:nth-child(1)) {
  animation-delay: 0.1s;
}
:deep(.el-form-item:nth-child(2)) {
  animation-delay: 0.2s;
}
:deep(.el-form-item:nth-child(3)) {
  animation-delay: 0.3s;
}
:deep(.el-form-item:nth-child(4)) {
  animation-delay: 0.4s;
}
:deep(.el-form-item:nth-child(5)) {
  animation-delay: 0.5s;
}
:deep(.el-form-item:nth-child(6)) {
  animation-delay: 0.6s;
}

/* 表单标签样式 */
:deep(.el-form-item__label) {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

/* 输入框样式 */
:deep(.el-input__wrapper) {
  box-shadow:
    var(--shadow-inset),
    0 0 0 1px var(--border-color) inset !important;
  transition: all var(--transition-fast);
  border-radius: var(--radius-md);
}

:deep(.el-input__wrapper:hover) {
  box-shadow:
    var(--shadow-inset),
    0 0 0 1px var(--primary-color) inset !important;
}

:deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow:
    var(--shadow-inset),
    0 0 0 1px var(--primary-color) inset !important;
  border-color: var(--primary-color);
}

/* 下拉选择框样式 */
:deep(.el-select .el-input__wrapper) {
  border-radius: var(--radius-md);
}

:deep(.el-select-dropdown__item) {
  padding: 8px 20px;
}

:deep(.el-select-dropdown__item.selected) {
  background-color: var(--hover-bg);
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
}

:deep(.el-form-item:last-child) {
  margin-top: var(--spacing-xl);
  border-top: var(--border);
  padding-top: var(--spacing-lg);
}
</style>
