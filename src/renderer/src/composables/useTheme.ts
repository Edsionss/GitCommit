import { watch, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore, type Theme, type ThemeMode } from '@/stores/settingsStore'

export function useTheme() {
  const settingsStore = useSettingsStore()
  const { getDisplayConfig } = storeToRefs(settingsStore)
  const themeMode = computed(() => getDisplayConfig.value.themeMode || 'light')
  const currentTheme = computed(() => getDisplayConfig.value.theme || 'light')
  // 应用主题到DOM
  const applyTheme = (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)

    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    const metaContent = theme === 'dark' ? '#141414' : '#ffffff'
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', metaContent)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = metaContent
      document.head.appendChild(meta)
    }
    // 更新 store 中的 theme，但不直接在这里做，而是通过 action
    if (settingsStore.theme !== theme) {
      settingsStore.setTheme(theme)
    }
  }

  // 包装 store 的 action
  const setThemeMode = (mode: ThemeMode) => {
    settingsStore.setThemeMode(mode)
  }

  // 获取系统主题
  const getSystemTheme = (): Theme => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // 切换明暗主题
  const toggleTheme = () => {
    const newMode =
      themeMode.value === 'system'
        ? currentTheme.value === 'light'
          ? 'dark'
          : 'light'
        : themeMode.value === 'light'
          ? 'dark'
          : 'light'
    setThemeMode(newMode)
  }

  // 监听 store 中的 themeMode 变化
  watch(
    themeMode,
    (newMode) => {
      if (newMode === 'system') {
        applyTheme(getSystemTheme())
      } else {
        applyTheme(newMode as Theme)
      }
    },
    { immediate: true }
  )

  // 监听系统主题变化
  const setupSystemThemeListener = () => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (settingsStore.themeMode === 'system') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  onMounted(() => {
    // 初始化时，store 已经从 localStorage 加载了状态
    // watch 的 immediate: true 会立即执行一次，所以主题已经应用
    // 只需要设置系统监听器
    setupSystemThemeListener()
  })

  return {
    currentTheme,
    themeMode,
    setThemeMode,
    toggleTheme
  }
}
