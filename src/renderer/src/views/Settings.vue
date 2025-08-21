<template>
  <div class="settings-container page-container">
    <!-- <h2 class="page-title">设置</h2> -->
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

    <AiSettings :settings="settings.ai" @update:settings="settings.ai = $event" />

    <a-card title="菜单与路由管理">
      <RouterSetting />
    </a-card>

    <a-float-button-group trigger="hover" type="primary" :right="'24px'">
      <template #tooltip>
        <div>操作</div>
      </template>
      <a-float-button @click="saveSettings">
        <template #icon><SaveOutlined /></template>
        <template #tooltip><div>保存设置</div></template>
      </a-float-button>
      <a-float-button @click="resetSettings">
        <template #icon><RedoOutlined /></template>
        <template #tooltip><div>重置设置</div></template>
      </a-float-button>
    </a-float-button-group>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore, type AppSettings } from '@/stores/settingsStore'
import AppearanceSettings from '@/components/SettingsView/AppearanceSettings.vue'
import LocaleSettings from '@/components/SettingsView/LocaleSettings.vue'
import GitSettings from '@/components/SettingsView/GitSettings.vue'
import SystemSettings from '@/components/SettingsView/SystemSettings.vue'
import AiSettings from '@/components/SettingsView/AiSettings.vue'
import RouterSetting from '@/components/SettingsView/RouterSetting.vue'
import { useTheme } from '@composables/useTheme'
import { SaveOutlined, RedoOutlined } from '@ant-design/icons-vue'

// 使用 Pinia Store
const settingsStore = useSettingsStore()
const { appSettings, themeMode } = storeToRefs(settingsStore)

// 使用主题组合式函数
const { setThemeMode } = useTheme()

// 本地响应式状态，用于表单绑定
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
    model: '',
    enableAiHistory: false,
    enableAutoSave: false,
    enableStreaming: true
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

// 从 Store 加载设置到本地状态
const loadSettingsFromStore = () => {
  const storedSettings = appSettings.value
  if (storedSettings) {
    // 合并设置以保留新增的设置项
    Object.keys(settings).forEach((category) => {
      if (storedSettings[category]) {
        settings[category] = { ...settings[category], ...storedSettings[category] }
      }
    })
  }
  // 确保主题设置与 store 同步
  settings.appearance.theme = themeMode.value
}

// 保存设置到 Store
const saveSettings = () => {
  settingsStore.saveAppSettings(settings as AppSettings)
  message.success('设置已保存')
  setTimeout(() => {
    location.reload() // 保留重载以应用某些全局设置
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
      // 创建一个默认设置对象
      const defaultSettings = {
        // appearance: {
        //   theme: 'light',
        //   sidebarPosition: 'left',
        //   zoom: '1',
        //   animations: true
        // },
        // locale: {
        //   language: 'zh-CN',
        //   dateFormat: 'YYYY-MM-DD',
        //   timeFormat: '24'
        // },
        // git: {
        //   defaultAuthor: '',
        //   defaultEmail: '',
        //   repositoryPath: '',
        //   refreshInterval: '300000'
        // },
        // system: {
        //   startWithSystem: false,
        //   notifications: true,
        //   autoUpdate: true,
        //   telemetry: true,
        //   clearScanConfigOnFinish: true
        // },
        // ai: {
        //   provider: null,
        //   apiKey: '',
        //   endpoint: '',
        //   model: ''
        // }
        ...settings
      }
      // 更新本地状态
      Object.assign(settings, defaultSettings)

      // 应用视觉效果
      applyZoom('1')
      applyAnimations(true)
      updateTheme('light')

      // 保存到 store
      settingsStore.saveAppSettings(defaultSettings as AppSettings)

      message.success('设置已重置为默认值')
      setTimeout(() => location.reload(), 500)
    }
  })
}

// 更新主题
const updateTheme = (theme: string) => {
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
  loadSettingsFromStore()

  // 应用初始设置
  applyZoom(settings.appearance.zoom)
  applyAnimations(settings.appearance.animations)
})

// 监听 store 中 appSettings 的变化，同步到本地
watch(
  appSettings,
  (newSettings) => {
    loadSettingsFromStore()
  },
  { deep: true }
)

// 监听本地 zoom 和 animations 的变化以应用效果
watch(() => settings.appearance.zoom, applyZoom)
watch(() => settings.appearance.animations, applyAnimations)
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
