<template>
  <div class="settings-container page-container">
    <h2 class="page-title">设置</h2>

    <AppearanceSettings
      :settings="settings.appearance"
      @update:theme="updateTheme($event)"
      @update:sidebarPosition="settings.appearance.sidebarPosition = $event"
      @update:zoom="settings.appearance.zoom = $event"
      @update:animations="settings.appearance.animations = $event"
    />

    <LocaleSettings
      :settings="settings.locale"
      @update:language="settings.locale.language = $event"
      @update:dateFormat="settings.locale.dateFormat = $event"
      @update:timeFormat="settings.locale.timeFormat = $event"
    />

    <GitSettings
      :settings="settings.git"
      @update:defaultAuthor="settings.git.defaultAuthor = $event"
      @update:defaultEmail="settings.git.defaultEmail = $event"
      @update:repositoryPath="settings.git.repositoryPath = $event"
      @update:refreshInterval="settings.git.refreshInterval = $event"
      @selectDirectory="selectDirectory"
    />

    <SystemSettings
      :settings="settings.system"
      @update:startWithSystem="settings.system.startWithSystem = $event"
      @update:notifications="settings.system.notifications = $event"
      @update:autoUpdate="settings.system.autoUpdate = $event"
      @update:telemetry="settings.system.telemetry = $event"
      @update:clearScanConfigOnFinish="settings.system.clearScanConfigOnFinish = $event"
    />

    <AiSettings
      :settings="settings.ai"
      @update:settings="settings.ai = $event"
    />

    <div class="settings-actions">
      <a-button type="primary" @click="saveSettings">保存设置</a-button>
      <a-button @click="resetSettings">重置设置</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import AppearanceSettings from '@/components/SettingsView/AppearanceSettings.vue'
import LocaleSettings from '@/components/SettingsView/LocaleSettings.vue'
import GitSettings from '@/components/SettingsView/GitSettings.vue'
import SystemSettings from '@/components/SettingsView/SystemSettings.vue'
import AiSettings from '@/components/SettingsView/AiSettings.vue'
import { useTheme } from '@composables/useTheme'

// 使用主题组合式函数
const { setThemeMode, currentTheme } = useTheme()

// 设置状态
const settings = reactive({
  appearance: {
    theme: 'light',
    sidebarPosition: 'left',
    zoom: '1',
    animations: true
  },
  locale: {
    language: 'zh-CN',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24'
  },
  git: {
    defaultAuthor: '',
    defaultEmail: '',
    repositoryPath: '',
    refreshInterval: '300000'
  },
  system: {
    startWithSystem: false,
    notifications: true,
    autoUpdate: true,
    telemetry: true,
    clearScanConfigOnFinish: true
  },
  ai: {
    provider: null,
    apiKey: '',
    endpoint: '',
    model: ''
  }
})

// 应用缩放
const applyZoom = (zoomValue: string | number) => {
  document.documentElement.style.zoom = String(zoomValue)
}

// 应用动画设置
const applyAnimations = (enabled: boolean) => {
  document.documentElement.classList.toggle('no-animations', !enabled)
}

// 读取设置
const loadSettings = () => {
  // 先读取主题模式以确保UI状态与存储一致
  const savedThemeMode = localStorage.getItem('themeMode') || 'light'
  settings.appearance.theme = savedThemeMode

  const savedSettings = localStorage.getItem('appSettings')
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings)

      // 合并设置以保留新增的设置项
      Object.keys(settings).forEach((category) => {
        if (parsedSettings[category]) {
          settings[category] = { ...settings[category], ...parsedSettings[category] }
        }
      })

      // 确保主题设置始终优先使用themeMode而不是从appSettings读取
      settings.appearance.theme = savedThemeMode

      message.success('设置已加载')
    } catch (error) {
      console.error('Failed to parse settings:', error)
      message.error('设置加载失败')
    }
  }
}

// 保存设置
const saveSettings = () => {
  localStorage.setItem('appSettings', JSON.stringify(settings))
  message.success('设置已保存')
  setTimeout(() => {
    location.reload()
  }, 500)
}

// 重置设置
const resetSettings = () => {
  Modal.confirm({
    title: '重置设置',
    content: '确定要重置所有设置到默认值吗？此操作不可撤销。',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      settings.appearance.theme = 'light'
      settings.appearance.sidebarPosition = 'left'
      settings.appearance.zoom = '1'
      applyZoom('1')
      settings.appearance.animations = true
      applyAnimations(true)

      settings.locale.language = 'zh-CN'
      settings.locale.dateFormat = 'YYYY-MM-DD'
      settings.locale.timeFormat = '24'

      settings.git.defaultAuthor = ''
      settings.git.defaultEmail = ''
      settings.git.repositoryPath = ''
      settings.git.refreshInterval = '300000'

      settings.system.startWithSystem = false
      settings.system.notifications = true
      settings.system.autoUpdate = true
      settings.system.telemetry = true
      settings.system.clearScanConfigOnFinish = true

      settings.ai.provider = null
      settings.ai.apiKey = ''
      settings.ai.endpoint = ''
      settings.ai.model = ''

      // 应用默认主题
      updateTheme('light')

      // 保存默认设置
      saveSettings()

      message.success('设置已重置为默认值')
    },
    onCancel() {
      // 用户取消操作
    }
  })
}

// 更新主题
const updateTheme = (theme: string) => {
  console.log('设置页面更新主题:', theme)
  settings.appearance.theme = theme
  setThemeMode(theme as 'light' | 'dark' | 'system')
}

// 选择目录
const selectDirectory = async () => {
  try {
    const result = await window.api.selectDirectory()
    if (result) {
      settings.git.repositoryPath = result
      message.success('已选择目录：' + result)
    } else {
      message.info('未选择目录')
    }
  } catch (error) {
    console.error('选择目录失败:', error)
    message.error('选择目录失败')
  }
}

// 组件挂载时加载设置
onMounted(() => {
  loadSettings()

  // 读取当前主题设置，确保UI正确显示
  const themeMode = localStorage.getItem('themeMode') || 'light'
  settings.appearance.theme = themeMode
  console.log('设置页面加载时的主题模式:', themeMode)

  // 应用初始设置
  applyZoom(settings.appearance.zoom)
  applyAnimations(settings.appearance.animations)
})

// 监听缩放设置变化
watch(
  () => settings.appearance.zoom,
  (newZoom) => {
    applyZoom(newZoom)
  }
)

// 监听动画设置变化
watch(
  () => settings.appearance.animations,
  (enabled) => {
    applyAnimations(enabled)
  }
)
</script>

<style scoped>
.settings-container {
  width: 100%;
  padding-bottom: 30px;
  padding-top: 20px; /* 添加顶部内边距 */
}

.page-title {
  margin: 0 0 20px 0;
  font-size: var(--font-size-xl);
  color: var(--color-text); /* 修改为正确的CSS变量 */
  font-weight: var(--font-weight-semibold);
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-md);
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
  color: var(--color-text); /* 修改为正确的CSS变量 */
  font-weight: var(--font-weight-medium);
}

.setting-control {
  min-width: 200px;
}

.settings-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .setting-control {
    width: 100%;
  }
}
</style>
