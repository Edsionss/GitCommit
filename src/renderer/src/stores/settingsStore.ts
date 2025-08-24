import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

// 定义设置对象的类型
export interface AppSettings {
  SystemConfig: any // 系统配置
  AiConfig: any // AI配置
  DisplayConfig: any // 显示配置
  GitConfig: any // Git配置
  Preferences: any // 用户偏好
  // 可以根据需要添加其他设置字段
}

export type Theme = 'light' | 'dark'
export type ThemeMode = 'light' | 'dark' | 'system'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const appSettings = ref<Partial<AppSettings>>({})
  const theme = ref<Theme>('light')
  const themeMode = ref<ThemeMode>('system')
  const isSidebarExpanded = ref(true)

  // Actions
  function loadInitialState() {
    // 加载 AppSettings
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      appSettings.value = JSON.parse(savedSettings)
    }

    // 加载主题
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      theme.value = savedTheme
    }

    // 加载主题模式
    const savedThemeMode = localStorage.getItem('themeMode') as ThemeMode | null
    if (savedThemeMode) {
      themeMode.value = savedThemeMode
    } else if (savedTheme) {
      // 兼容旧版，如果只存了 theme，则将 themeMode 设置为该值
      themeMode.value = savedTheme
      localStorage.setItem('themeMode', savedTheme)
    }

    // 加载侧边栏状态
    const savedSidebarState = localStorage.getItem('sidebarExpanded')
    if (savedSidebarState) {
      isSidebarExpanded.value = savedSidebarState === 'true'
    }
  }

  function saveAppSettings(newSettings: Partial<AppSettings>) {
    appSettings.value = { ...appSettings.value, ...newSettings }
    localStorage.setItem('appSettings', JSON.stringify(appSettings.value))
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
  }

  function setThemeMode(newMode: ThemeMode) {
    themeMode.value = newMode
    localStorage.setItem('themeMode', newMode)
  }

  function toggleSidebar() {
    isSidebarExpanded.value = !isSidebarExpanded.value
    localStorage.setItem('sidebarExpanded', isSidebarExpanded.value.toString())
  }

  // Getters (使用 computed)
  const getAppSettings = computed(() => appSettings.value)
  const getAiConfig = computed(() => appSettings.value.ai)
  const getCurrentTheme = computed(() => theme.value)
  const getThemeMode = computed(() => themeMode.value)
  const getIsSidebarExpanded = computed(() => isSidebarExpanded.value)

  // 立即加载初始状态
  loadInitialState()

  return {
    // State
    appSettings,
    theme,
    themeMode,
    isSidebarExpanded,
    // Actions
    loadInitialState,
    saveAppSettings,
    setTheme,
    setThemeMode,
    toggleSidebar,
    // Getters
    getAppSettings,
    getAiConfig,
    getCurrentTheme,
    getThemeMode,
    getIsSidebarExpanded
  }
})
