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
    effectiveTheme: computed(() => getThemeMode(DisplayConfig.value?.theme || 'light'))
  }
}
