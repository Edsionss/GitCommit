import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  AppSettings,
  DisplayConfig,
  Preferences,
  GitConfig,
  SystemConfig,
  AiConfig
} from '@type/setting'
import _ from 'lodash' // 引入 lodash 用于深层合并

// 默认设置对象保持不变，它作为初始值和重置的依据
const DefaultSetting: AppSettings = {
  // ... 你的默认设置对象 ...
  DisplayConfig: { theme: 'light', sidebarPosition: 'left', zoom: 1, animations: true },
  Preferences: { language: 'zh-CN', dateFormat: 'YYYY-MM-DD', timeFormat: '24' },
  GitConfig: {
    defaultAuthor: '',
    defaultEmail: '',
    repositoryPath: '',
    refreshInterval: '300000',
    clearScanConfigOnFinish: true
  },
  SystemConfig: { startWithSystem: false, notifications: true, autoUpdate: true, telemetry: true },
  AiConfig: {
    provider: null,
    apiKey: '',
    endpoint: '',
    model: '',
    enableAiHistory: false,
    enableAutoSave: false,
    enableStreaming: true
  }
}

export const useSettingsStore = defineStore('settings', () => {
  // 1. 将一个大的 ref 拆分成多个小的、独立的 ref
  const DisplayConfig = ref<DisplayConfig>({ ...DefaultSetting.DisplayConfig })
  const Preferences = ref<Preferences>({ ...DefaultSetting.Preferences })
  const GitConfig = ref<GitConfig>({ ...DefaultSetting.GitConfig })
  const SystemConfig = ref<SystemConfig>({ ...DefaultSetting.SystemConfig })
  const AiConfig = ref<AiConfig>({ ...DefaultSetting.AiConfig })

  // 2. 初始化时，从 localStorage 加载并分别赋值
  const savedSettingsJSON = localStorage.getItem('AppSettings')
  if (savedSettingsJSON) {
    try {
      const savedSettings: Partial<AppSettings> = JSON.parse(savedSettingsJSON)
      // 使用深层合并（_.merge）来安全地加载设置，防止因版本更新导致字段丢失
      DisplayConfig.value = _.merge({}, DefaultSetting.DisplayConfig, savedSettings.DisplayConfig)
      Preferences.value = _.merge({}, DefaultSetting.Preferences, savedSettings.Preferences)
      GitConfig.value = _.merge({}, DefaultSetting.GitConfig, savedSettings.GitConfig)
      SystemConfig.value = _.merge({}, DefaultSetting.SystemConfig, savedSettings.SystemConfig)
      AiConfig.value = _.merge({}, DefaultSetting.AiConfig, savedSettings.AiConfig)
    } catch (e) {
      console.error('Failed to parse settings from localStorage', e)
    }
  }

  // 内部函数，用于将分散的 state 重新组合成一个对象以便保存
  const reassembleAppSettings = (): AppSettings => ({
    DisplayConfig: DisplayConfig.value,
    Preferences: Preferences.value,
    GitConfig: GitConfig.value,
    SystemConfig: SystemConfig.value,
    AiConfig: AiConfig.value
  })

  // 3. Action 现在负责保存完整的设置对象
  function saveSettings() {
    localStorage.setItem('AppSettings', JSON.stringify(reassembleAppSettings()))
  }

  // 4. 重置 Action
  function resetSettings() {
    DisplayConfig.value = { ...DefaultSetting.DisplayConfig }
    Preferences.value = { ...DefaultSetting.Preferences }
    GitConfig.value = { ...DefaultSetting.GitConfig }
    SystemConfig.value = { ...DefaultSetting.SystemConfig }
    AiConfig.value = { ...DefaultSetting.AiConfig }
    saveSettings() // 重置后也保存
  }

  // 5. 返回所有拆分后的 state 和 actions
  return {
    DisplayConfig,
    Preferences,
    GitConfig,
    SystemConfig,
    AiConfig,
    saveSettings,
    resetSettings
  }
})
