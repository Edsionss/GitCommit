import { watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settingsStore'
import type { ThemeMode } from '@type/setting'

export function useTheme() {
  const settingsStore = useSettingsStore()
  const { DisplayConfig } = storeToRefs(settingsStore)
  // 应用主题到DOM
  const applyTheme = (theme: ThemeMode) => {
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
  }

  const effectiveTheme = computed(() => getThemeMode(DisplayConfig.value?.theme || 'light'))

  // 创建一个辅助函数来生成响应式的颜色值
  // 它依赖 effectiveTheme，所以当主题切换时，它会自动重新计算
  const createColorGetter = (variableName: string) => {
    return computed(() => {
      // 1. 依赖 effectiveTheme 来触发更新
      const _theme = effectiveTheme.value

      // 2. 在 DOM 更新后获取颜色值
      // 确保在浏览器渲染完新主题的样式后再去读取
      if (typeof window !== 'undefined') {
        return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
      }
      return '' // 在 SSR 或非浏览器环境下返回空字符串
    })
  }

  // 创建一个包含所有常用颜色变量的响应式对象
  const themeColors = {
    // 背景色
    bgLayout: createColorGetter('--bg-layout'),
    bgContainer: createColorGetter('--bg-container'),

    // 文本色
    textPrimary: createColorGetter('--text-primary'),
    textSecondary: createColorGetter('--text-secondary'),
    textTertiary: createColorGetter('--text-tertiary'),

    // 边框和分割线
    borderPrimary: createColorGetter('--border-primary'),
    borderSecondary: createColorGetter('--border-secondary'),
    divider: createColorGetter('--divider'),

    // 品牌色
    brandPrimary: createColorGetter('--brand-primary'),
    brandPrimaryHover: createColorGetter('--brand-primary-hover'),

    // 状态色
    success: createColorGetter('--color-success'),
    warning: createColorGetter('--color-warning'),
    error: createColorGetter('--color-error'),
    info: createColorGetter('--color-info')
    // ... 你可以根据需要添加更多变量
  }

  // 获取系统主题
  const getSystemTheme = (): ThemeMode => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // 监听系统主题变化
  let systemListenerInit = false
  const setupSystemThemeListener = () => {
    if (systemListenerInit) return
    systemListenerInit = true
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (DisplayConfig.value?.theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  // 获取主题值
  const getThemeMode = (themeMode: ThemeMode) => {
    if (themeMode === 'system') {
      return getSystemTheme()
    }
    return themeMode
  }

  // 应用动画设置
  const applyAnimations = (enabled: boolean) => {
    document.documentElement.classList.toggle('no-animations', !enabled)
  }

  // 应用缩放
  const applyZoom = (zoomValue: string | number) => {
    document.documentElement.style.zoom = String(zoomValue)
  }

  const settingEffects = {
    theme: (themeValue) => {
      applyTheme(getThemeMode(themeValue))
      setupSystemThemeListener()
    },
    animations: (animationsValue) => {
      applyAnimations(animationsValue)
    },
    zoom: (zoomValue) => {
      applyZoom(zoomValue)
    }
    // ✨ 未来添加新设置，只需要在这里加一行！✨
  }

  watch(
    DisplayConfig,
    (newConfig, oldConfig) => {
      if (!newConfig) return
      const isInitialRun = !oldConfig

      // 遍历副作用映射对象
      for (const key in settingEffects) {
        const effectFn = settingEffects[key]
        const newValue = newConfig[key]
        const oldValue = oldConfig?.[key]

        // 如果是首次运行，或新旧值不同，则执行副作用
        if (isInitialRun || newValue !== oldValue) {
          effectFn(newValue)
        }
      }
    },
    { deep: true, immediate: true }
  )

  return {
    effectiveTheme,
    themeColors
  }
}
