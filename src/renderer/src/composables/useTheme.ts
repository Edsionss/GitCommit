import { ref } from 'vue'

type Theme = 'light' | 'dark'
type ThemeMode = 'light' | 'dark' | 'system'

export function useTheme() {
  const currentTheme = ref<Theme>('light')
  const themeMode = ref<ThemeMode>('light')

  // 应用主题到DOM
  const applyTheme = (theme: Theme) => {
    // 设置文档根元素的data-theme属性
    document.documentElement.setAttribute('data-theme', theme)
    // 同时设置body元素以确保全局应用
    document.body.setAttribute('data-theme', theme)

    // 更新META标签以改善移动端体验
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1e1e1e' : '#ffffff')
    } else {
      // 如果不存在则创建
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = theme === 'dark' ? '#1e1e1e' : '#ffffff'
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
      // 如果是系统模式，则应用系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(prefersDark ? 'dark' : 'light')
    } else {
      // 否则直接应用明确的主题
      applyTheme(mode as Theme)
    }
  }

  // 获取系统主题
  const getSystemTheme = (): Theme => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // 初始化主题
  const initTheme = () => {
    // 强制清除可能存在的内联样式
    document.documentElement.style.removeProperty('background-color')
    document.body.style.removeProperty('background-color')

    const savedThemeMode = localStorage.getItem('themeMode') as ThemeMode | null

    if (savedThemeMode) {
      themeMode.value = savedThemeMode
      console.log(`读取到保存的主题模式: ${savedThemeMode}`)

      if (savedThemeMode === 'system') {
        applyTheme(getSystemTheme())
      } else {
        applyTheme(savedThemeMode as Theme)
      }
    } else {
      // 没有保存的模式，看是否有旧版的theme设置
      const savedTheme = localStorage.getItem('theme') as Theme | null
      if (savedTheme) {
        // 兼容旧版设置
        themeMode.value = savedTheme
        applyTheme(savedTheme)
        // 更新为新格式
        localStorage.setItem('themeMode', savedTheme)
      } else {
        // 全新安装，默认使用浅色主题
        setThemeMode('light')
      }
    }
  }

  // 切换明暗主题
  const toggleTheme = () => {
    if (themeMode.value === 'system') {
      // 如果当前是系统模式，切换到明确模式
      setThemeMode(currentTheme.value === 'light' ? 'dark' : 'light')
    } else {
      // 在明暗主题间切换
      setThemeMode(themeMode.value === 'light' ? 'dark' : 'light')
    }
  }

  // 监听系统主题变化
  const setupSystemThemeListener = () => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const currentMode = localStorage.getItem('themeMode')
      console.log(`系统主题变化，当前模式: ${currentMode}，系统深色: ${e.matches}`)

      if (currentMode === 'system') {
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
    toggleTheme,
    applyTheme
  }
}
