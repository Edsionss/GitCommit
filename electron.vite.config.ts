import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { visualizer } from 'rollup-plugin-visualizer'
import vue from '@vitejs/plugin-vue'
import packageJson from './package.json'
import tailwindcss from '@tailwindcss/vite'
// 1. 引入插件
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

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
    plugins: [externalizeDepsPlugin()],
    // 别名配置保持不变
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
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin({})],
    resolve: {
      alias: {
        '@preload': resolve('src/preload')
      }
    }
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
    server: {
      port: 7582, // 使用端口3000而不是默认的5173
      strictPort: true // 如果端口被占用，不要尝试其他端口
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
        '@config': resolve('src/renderer/src/config')
      }
    },
    plugins: [
      vue(),
      htmlPlugin(),
      // 1. 配置 tailwindcss
      tailwindcss(),
      // 2. 配置 unplugin-vue-components
      Components({
        // resolvers 用来自动解析图标，将其视为组件
        resolvers: [
          IconsResolver({
            prefix: 'i', // 可选，给图标组件加个前缀，比如 <i-ant-design-home-outlined />
            enabledCollections: ['heroicons-solid'] // 可选，只启用你需要的图标库
          })
        ]
      }),

      // 3. 配置 unplugin-icons
      Icons({
        autoInstall: true, // 核心功能：检测到你使用了尚未安装的图标库时，会自动通过 npm/yarn/pnpm 安装
        compiler: 'vue3', // 编译成 Vue 3 组件
        // 添加这个 transform 回调
        transform(svg) {
          // 给所有图标的 <svg> 标签都加上 class="anticon"
          return svg.replace('<svg', '<svg class="anticon"')
        }
      }),
      visualizer({
        open: true, // 打包后自动在浏览器打开报告
        filename: 'dist/stats.html' // 输出报告的位置
      })
    ]
  }
})
