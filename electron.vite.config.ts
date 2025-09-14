import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import packageJson from './package.json'

// 自定义插件，用于替换 HTML 中的变量
function htmlPlugin() {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      return html
        .replace(/%__APP_PRODUCT_NAME__%/g, packageJson.project)
        .replace(/%__APP_VERSION__%/g, packageJson.version)
      // 你可以根据需要添加更多替换
    }
  }
}

export default defineConfig({
  main: {
    build: {
      sourcemap: false,
      rollupOptions: {
        external: [
          'electron',
          'electron-store' // 将 electron-store 设为外部依赖
        ]
      }
    },
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@features': resolve('src/main/features'),
        '@handlers': resolve('src/main/features/handlers'),
        '@services': resolve('src/main/features/services'),
        '@shared': resolve('src/shared'),
        '@sharedType': resolve('src/shared/types/dtos'),
        '@nodeUtils': resolve('src/main/utils')
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
    define: {
      'import.meta.env.VERSION': JSON.stringify(packageJson.version),
      'import.meta.env.NAME': JSON.stringify(packageJson.project),
      'import.meta.env.desc': JSON.stringify(packageJson.description),
      __APP_VERSION__: JSON.stringify(packageJson.version),
      __APP_PRODUCT_NAME__: JSON.stringify(packageJson.project),
      __APP_DESC__: JSON.stringify(packageJson.description)
    },
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
        '@sharedType': resolve('src/shared/types/dtos'),
        '@type': resolve('src/renderer/src/types'),
        '@utils': resolve('src/renderer/src/utils')
      }
    },
    plugins: [vue(), htmlPlugin()]
  }
})
