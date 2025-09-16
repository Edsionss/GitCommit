import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import packageJson from './package.json'

// 您的自定义 htmlPlugin 保持不变
function htmlPlugin() {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      return html
        .replace(/%__APP_PRODUCT_NAME__%/g, packageJson.project)
        .replace(/%__APP_VERSION__%/g, packageJson.version)
    }
  }
}

export default defineConfig({
  main: {
    plugins: [
      // 这个插件会自动将 package.json -> dependencies 中的所有模块设为外部依赖
      // 这是 electron-vite 推荐的最佳实践
      externalizeDepsPlugin({
        exclude: ['entities']
      })
    ],
    // 别名配置保持不变
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@features': resolve('src/main/features'),
        '@handlers': resolve('src/main/features/handlers'),
        '@services': resolve('src/main/features/services'),
        '@shared': resolve('src/shared'),
        '@sharedType': resolve('src/shared/types/dtos'),
        '@nodeUtils': resolve('src/main/utils'),

        // ✅ 关键补丁，解决 entities exports 限制
        'entities/decode': resolve(__dirname, 'node_modules/entities/lib/decode.js'),
        'entities/encode': resolve(__dirname, 'node_modules/entities/lib/encode.js')
      }
    }
  },
  preload: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ['entities']
      })
    ],
    // 别名配置保持不变
    resolve: {
      alias: {
        '@preload': resolve('src/preload')
      }
    }
  },
  renderer: {
    // renderer 配置保持不变
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
        '@utils': resolve('src/renderer/src/utils'),

        // ✅ 关键补丁，解决 entities exports 限制
        'entities/decode': resolve(__dirname, 'node_modules/entities/lib/decode.js'),
        'entities/encode': resolve(__dirname, 'node_modules/entities/lib/encode.js')
      }
    },
    plugins: [vue(), htmlPlugin()]
  }
})
