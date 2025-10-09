# 项目性能优化方案

## 1. 目标

本方案旨在通过一系列可执行的优化措施，全面提升 CognitoOcean 应用的性能，主要集中在以下几个方面：

-   **提升应用启动速度**：减少白屏等待时间。
-   **降低资源消耗**：降低 CPU 和内存占用，使应用运行更流畅。
-   **提高界面响应速度**：确保 UI 操作的流畅性和即时反馈。

---

## 2. 构建与打包优化

**问题分析**: 应用的初始加载速度与最终打包的体积直接相关。体积越大，加载和解析所需时间越长。

### 2.1. 引入打包分析工具

**方案**: 使用 `rollup-plugin-visualizer` 插件，在打包时生成一份可视化的报告，直观地分析哪些模块或库占用了过多的体积。

**可执行操作**:

1.  安装依赖：
    ```bash
    pnpm add -D rollup-plugin-visualizer
    ```
2.  修改 `electron.vite.config.ts`，在 `renderer` 配置中加入 `visualizer` 插件：

    ```typescript
    import { visualizer } from 'rollup-plugin-visualizer'

    export default {
      // ... other configs
      renderer: {
        plugins: [
          // ... other plugins
          visualizer({
            open: true, // 打包后自动在浏览器打开报告
            filename: 'dist/stats.html' // 输出报告的位置
          })
        ]
      }
    }
    ```

### 2.2. 路由懒加载

**方案**: 对于非首页的视图组件，采用动态导入（懒加载）的方式，使其打包成独立的 JS 文件。只有在用户访问对应路由时，才会去加载该文件，从而减小主包体积。

**可执行操作**:

修改 `src/renderer/src/router/index.ts` 中的路由定义：

**优化前**:
```typescript
import SystemTools from '@/views/SystemTools.vue'

const routes = [
  { path: '/system-tools', component: SystemTools }
]
```

**优化后**:
```typescript
const routes = [
  {
    path: '/system-tools',
    component: () => import('@/views/SystemTools.vue')
  }
]
```

---

## 3. 主进程优化

**问题分析**: 主进程是 Electron 应用的大脑，它的任何阻塞都会直接影响应用的启动速度和整体响应。

### 3.1. 延迟加载非核心模块

**方案**: 在 `src/main/index.ts` 或其他主进程文件中，对于非应用启动时立即需要的模块，推迟其导入操作，放到实际使用它的函数内部再 `require` 或 `import`。

**可执行操作**:

**优化前**:
```typescript
import { someHeavyModule } from 'some-heavy-module'

function doSomethingLater() {
  someHeavyModule.run()
}
```

**优化后**:
```typescript
function doSomethingLater() {
  const { someHeavyModule } = require('some-heavy-module')
  someHeavyModule.run()
}
```

### 3.2. 将 CPU 密集型任务移至工作线程

**方案**: 对于 CPU 密集型任务（如复杂的数据处理、文件I/O），使用 Node.js 的 `worker_threads` 将其移出主进程，避免阻塞。

**可执行操作**: 

以 `getSystemStartupApps` 为例，如果该操作变得非常耗时，可以将其改造为工作线程模式。

1.  创建一个 `worker.js` 文件来执行耗时任务。
2.  在 `SystemToolsService` 中，使用 `new Worker()` 来创建线程并与之通信。

---

## 4. 渲染器进程优化

**问题分析**: 渲染器进程负责 UI 的渲染和交互，其性能直接决定了用户体验的流畅度。

### 4.1. 列表虚拟化

**方案**: 对于可能存在的大量数据列表（如 Git 提交记录、日志条目、系统启动项列表），使用虚拟滚动技术。它只渲染视口内可见的列表项，极大提升渲染性能。

**可执行操作**:

1.  引入一个虚拟滚动库，如 `vue-virtual-scroller`。
    ```bash
    pnpm add vue-virtual-scroller
    ```
2.  在显示列表的组件中，用 `<RecycleScroller>` 替换原有的 `v-for` 循环。

### 4.2. 合理使用 `v-if` 与 `v-show`

**方案**: 
-   对于不频繁切换显示/隐藏状态，且初始可能不需要渲染的组件，使用 `v-if`。
-   对于需要频繁切换的组件，使用 `v-show` 以获得更好的切换性能。

### 4.3. 对非响应式数据使用 `shallowRef`

**方案**: 当你有一个包含大量属性的大对象或数组，但你只关心其整体的替换，而不需要对内部属性的变化做响应时，使用 `shallowRef` 代替 `ref` 可以避免深度监听带来的性能开销。

**可执行操作**:

```typescript
import { shallowRef } from 'vue'

// 适用于一个巨大的、内容不会逐项改变的数组
const largeStaticList = shallowRef([...])
```

---

## 5. IPC 通信优化

**问题分析**: 主进程与渲染器进程之间的通信（IPC）是有成本的，频繁或大量的数据传输会成为瓶颈。

### 5.1. 避免传输大量数据

**方案**: 当需要从后端获取大量数据时，不要一次性通过 `invoke` 返回。应在主进程中进行分页或筛选，只返回前端当前需要的数据。

**可执行操作**:

修改 `handler` 和 `service`，为获取大量数据的接口（如获取日志）添加分页参数（`page`, `pageSize`）。

### 5.2. 使用单向通信

**方案**: 对于不需要返回值的通信（“即发即忘”），使用 `ipcRenderer.send` (渲染器 -> 主进程) 或 `webContents.send` (主进程 -> 渲染器)，而不是 `invoke/handle`。单向通信的开销更小。

**可执行操作**:

例如，一个点击行为只需要通知后端记录日志，而前端不需要等待结果。

**渲染器进程**:
```typescript
// windowApi.ts
export const logClick = (log: string) => window.api.logClick(log)

// preload.ts
logClick: (log: string) => ipcRenderer.send('log:click', log)
```

**主进程**:
```typescript
// someHandler.ts
ipcMain.on('log:click', (_event, log) => {
  logService.record(log)
})
```
