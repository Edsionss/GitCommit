import { ref } from 'vue'

type Theme = 'light' | 'dark'
type ThemeMode = 'light' | 'dark' | 'system'

export function useTheme() {
  const currentTheme = ref<Theme>('light')
  const themeMode = ref<ThemeMode>('light')

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

    currentTheme.value = theme
    localStorage.setItem('theme', theme)
    console.log(`主题已应用: ${theme}`)
  }

  // 设置主题模式
  const setThemeMode = (mode: ThemeMode) => {
    console.log(`设置主题模式: ${mode}`)
    themeMode.value = mode
    localStorage.setItem('themeMode', mode)

    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(prefersDark ? 'dark' : 'light')
    } else {
      applyTheme(mode as Theme)
    }
  }

  // 获取系统主题
  const getSystemTheme = (): Theme => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // 初始化主题
  const initTheme = () => {
    document.documentElement.style.removeProperty('background-color')
    document.body.style.removeProperty('background-color')

    const savedThemeMode = localStorage.getItem('themeMode') as ThemeMode | null
    if (savedThemeMode) {
      themeMode.value = savedThemeMode
      if (savedThemeMode === 'system') {
        applyTheme(getSystemTheme())
      } else {
        applyTheme(savedThemeMode as Theme)
      }
    } else {
      const savedTheme = localStorage.getItem('theme') as Theme | null
      if (savedTheme) {
        themeMode.value = savedTheme
        applyTheme(savedTheme)
        localStorage.setItem('themeMode', savedTheme)
      } else {
        setThemeMode('light')
      }
    }
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

  // 监听系统主题变化
  const setupSystemThemeListener = () => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('themeMode') === 'system') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  // 初始化
  initTheme()
  setupSystemThemeListener()

  return {
    currentTheme,
    themeMode,
    setThemeMode,
    toggleTheme
  }
}
