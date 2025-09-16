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
    // ------------------- 核心修改在这里 -------------------
    plugins: [
      // externalizeDepsPlugin 会自动将 package.json 中的 dependencies 设为外部依赖
      externalizeDepsPlugin()
    ],
    build: {
      sourcemap: false,
      rollupOptions: {
        // 在这里我们手动、明确地再次声明最关键的外部依赖，作为双重保障
        external: [
          'electron', // electron 自身必须外部化
          'electron-updater',
          // 您已经正确识别出的模块，改为正则表达式形式
          /^better-sqlite3/,
          /^simple-git/,
          /^puppeteer-core/,
          /^ws/,
          /^yahoo-finance2/,
          // --- 关键补充：添加常见的纯 ESM 传递性依赖 ---
          // 很多库（比如 yahoo-finance2）内部可能使用了 node-fetch
          // 而 node-fetch v3+ 是纯 ESM 包，是导致此错误的常见元凶
          /^node-fetch/,
          // 以下是 node-fetch 的一些依赖，也一并外部化以求万无一失
          /^data-uri-to-buffer/,
          /^fetch-blob/,
          /^formdata-polyfill/
          // --- 以下是我们分析出的关键模块 ---
          // 'better-sqlite3', // 原生模块，必须外部化
          // 'electron-store', // 纯 ESM + IPC 密集型，强烈建议外部化
          // 'simple-git', // 纯 ESM + 子进程，强烈建议外部化
          // 'puppeteer-core', // 复杂 I/O + 子进程，强烈建议外部化
          // 'ws', // 推荐外部化
          // 'yahoo-finance2' // 可选，但推荐外部化
        ]
      }
    },
    // 您的别名配置保持不变
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
    // preload 配置保持不变
    plugins: [externalizeDepsPlugin()],
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
        '@utils': resolve('src/renderer/src/utils')
      }
    },
    plugins: [vue(), htmlPlugin()]
  }
})
