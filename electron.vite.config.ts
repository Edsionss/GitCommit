import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@features': resolve('src/main/features'),
        '@handlers': resolve('src/main/features/handlers'),
        '@services': resolve('src/main/features/services'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    resolve: {
      alias: {
        '@preload': resolve('src/preload')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src'),
        '@components': resolve('src/renderer/src/components'),
        '@views': resolve('src/renderer/src/views'),
        '@api': resolve('src/renderer/src/api'),
        '@assets': resolve('src/renderer/src/assets'),
        '@composables': resolve('src/renderer/src/composables'),
        '@router': resolve('src/renderer/src/router'),
        '@mock': resolve('src/renderer/src/mock'),
        '@shared': resolve('src/shared'),
        '@type': resolve('src/renderer/src/types')
      }
    },
    plugins: [vue()]
  }
})
