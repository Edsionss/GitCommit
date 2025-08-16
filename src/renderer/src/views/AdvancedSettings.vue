<template>
  <div class="router-view-container">
    <div class="advanced-settings">
      <a-card class="settings-card">
        <template #title>
          <div class="card-header">
            <span>高级设置</span>
            <SettingOutlined />
          </div>
        </template>
        <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
          <!-- 输出格式设置 -->
          <a-form-item label="输出文件格式">
            <a-radio-group v-model:value="form.outputFormat">
              <a-radio value="csv">CSV</a-radio>
              <a-radio value="json">JSON</a-radio>
              <a-radio value="txt">TXT</a-radio>
            </a-radio-group>
          </a-form-item>

          <!-- 日期格式设置 -->
          <a-form-item label="日期格式">
            <a-select v-model:value="form.dateFormat" placeholder="选择日期格式">
              <a-select-option value="YYYY-MM-DD">YYYY-MM-DD</a-select-option>
              <a-select-option value="YYYY/MM/DD">YYYY/MM/DD</a-select-option>
              <a-select-option value="DD/MM/YYYY">DD/MM/YYYY</a-select-option>
              <a-select-option value="MM/DD/YYYY">MM/DD/YYYY</a-select-option>
            </a-select>
          </a-form-item>

          <!-- 编码设置 -->
          <a-form-item label="文件编码">
            <a-select v-model:value="form.encoding" placeholder="选择文件编码">
              <a-select-option value="utf8">UTF-8</a-select-option>
              <a-select-option value="gbk">GBK</a-select-option>
              <a-select-option value="gb2312">GB2312</a-select-option>
            </a-select>
          </a-form-item>

          <!-- 输出目录设置 -->
          <a-form-item label="输出目录">
            <a-input v-model:value="form.outputDir" placeholder="请选择输出目录">
              <template #addonAfter>
                <a-button @click="selectOutputDir">
                  <FolderOutlined />
                </a-button>
              </template>
            </a-input>
          </a-form-item>

          <!-- 日志设置 -->
          <a-form-item label="日志级别">
            <a-select v-model:value="form.logLevel" placeholder="选择日志级别">
              <a-select-option value="debug">DEBUG</a-select-option>
              <a-select-option value="info">INFO</a-select-option>
              <a-select-option value="warn">WARN</a-select-option>
              <a-select-option value="error">ERROR</a-select-option>
            </a-select>
          </a-form-item>

          <!-- 保存设置 -->
          <a-form-item>
            <div class="action-buttons">
              <a-button type="primary" @click="saveSettings">保存设置</a-button>
              <a-button @click="resetSettings">重置设置</a-button>
            </div>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { message } from 'ant-design-vue' // Changed from ElMessage
import { SettingOutlined, FolderOutlined } from '@ant-design/icons-vue'
import { Card, Form, FormItem, RadioGroup, Radio, Select, SelectOption, Input, Button, Textarea } from 'ant-design-vue';

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
    message.error('选择目录失败') // Changed from ElMessage
  }
}

const saveSettings = () => {
  // 将设置保存到localStorage
  localStorage.setItem('appSettings', JSON.stringify(form))
  message.success('设置已保存') // Changed from ElMessage
}

const resetSettings = () => {
  form.outputFormat = 'csv'
  form.dateFormat = 'YYYY-MM-DD'
  form.encoding = 'utf8'
  form.outputDir = ''
  form.logLevel = 'info'
  // 清除保存的设置
  localStorage.removeItem('appSettings')
  message.info('设置已重置') // Changed from ElMessage
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

.card-header .anticon {
  font-size: 20px;
  color: var(--primary-color);
  transition: transform var(--transition-normal);
}

.settings-card:hover .card-header .anticon {
  transform: rotate(45deg);
}

.ant-radio-group {
  width: 100%;
  margin-bottom: var(--spacing-sm);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.ant-radio-wrapper {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.ant-radio-wrapper:hover {
  background-color: var(--hover-bg);
  transform: translateY(-2px);
}

.ant-radio-wrapper-checked {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.ant-radio-wrapper-checked .ant-radio-inner {
  background-color: white !important;
  border-color: white !important;
}

.ant-radio-wrapper-checked .ant-radio-inner::after {
  background-color: var(--primary-color) !important;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  flex-wrap: wrap;
  justify-content: center;
}

.action-buttons .ant-btn {
  min-width: 120px;
  transition: all var(--transition-normal);
}

.action-buttons .ant-btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

/* 表单项动画效果 */
:deep(.ant-form-item) {
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

:deep(.ant-form-item:nth-child(1)) {
  animation-delay: 0.1s;
}
:deep(.ant-form-item:nth-child(2)) {
  animation-delay: 0.2s;
}
:deep(.ant-form-item:nth-child(3)) {
  animation-delay: 0.3s;
}
:deep(.ant-form-item:nth-child(4)) {
  animation-delay: 0.4s;
}
:deep(.ant-form-item:nth-child(5)) {
  animation-delay: 0.5s;
}
:deep(.ant-form-item:nth-child(6)) {
  animation-delay: 0.6s;
}

/* 表单标签样式 */
:deep(.ant-form-item-label label) {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

/* 输入框样式 */
:deep(.ant-input-affix-wrapper) {
  box-shadow:
    var(--shadow-inset),
    0 0 0 1px var(--border-color) inset !important;
  transition: all var(--transition-fast);
  border-radius: var(--radius-md);
}

:deep(.ant-input-affix-wrapper:hover) {
  box-shadow:
    var(--shadow-inset),
    0 0 0 1px var(--primary-color) inset !important;
}

:deep(.ant-input-focused) {
  box-shadow:
    var(--shadow-inset),
    0 0 0 1px var(--primary-color) inset !important;
  border-color: var(--primary-color);
}

/* 下拉选择框样式 */
:deep(.ant-select-selector) {
  border-radius: var(--radius-md);
}

:deep(.ant-select-item) {
  padding: 8px 20px;
}

:deep(.ant-select-item-option-selected) {
  background-color: var(--hover-bg);
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
}

:deep(.ant-form-item:last-child) {
  margin-top: var(--spacing-xl);
  border-top: var(--border);
  padding-top: var(--spacing-lg);
}
</style>