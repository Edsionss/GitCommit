### 功能开发计划：自定义顶部标题栏

本计划旨在为 CognitoOcean 应用添加一个自定义的应用顶部标题栏，包含窗口操作（最小化、最大化/还原、关闭）功能，并允许拖动窗口。

---

### 开发流程步骤

1.  **修改主进程以创建无边框窗口**:
    - **位置**: `src/main/index.ts`
    - **任务**: 在 `createWindow` 函数中，修改 `BrowserWindow` 的构造函数选项，设置 `frame: false`。同时，为了在无边框模式下仍能拖动和调整窗口大小，需要保留 `resizable: true`。

2.  **设计后台功能逻辑 (Service 层)**:
    - **位置**: `src/main/features/services/windows/index.ts` (如果目录或文件不存在则创建)。
    - **任务**: 创建 `WindowService` 类，用于封装所有与窗口操作相关的逻辑。
      - `minimize(browserWindow: BrowserWindow)`: 调用 `browserWindow.minimize()`。
      - `maximize(browserWindow: BrowserWindow)`: 如果窗口已最大化，则调用 `browserWindow.unmaximize()`；否则，调用 `browserWindow.maximize()`。
      - `close(browserWindow: BrowserWindow)`: 调用 `browserWindow.close()`。
      - `onMaximized(browserWindow: BrowserWindow, callback: () => void)`: 监听 `maximize` 事件。
      - `onUnmaximized(browserWindow: BrowserWindow, callback: () => void)`: 监听 `unmaximize` 事件。

3.  **开发 Handler 层**:
    - **位置**: `src/main/features/handlers/windows/index.ts` (如果目录或文件不存在则创建)。
    - **任务**: 创建并导出 `registerWindowHandlers` 函数，该函数接收 `BrowserWindow` 实例作为参数，并注册以下 IPC 处理器：
      - `window:minimize`: 调用 `WindowService.minimize()`。
      - `window:maximize`: 调用 `WindowService.maximize()`。
      - `window:close`: 调用 `WindowService.close()`。
      - 同时，设置窗口 `maximize` 和 `unmaximize` 事件的监听器，当事件触发时，通过 `win.webContents.send` 向渲染进程发送消息（例如 `window:maximized` 或 `window:unmaximized`），以便前端可以更新UI状态（例如切换最大化/还原图标）。

4.  **注册 IPC 处理器**:
    - **位置**: `src/main/features/handlers/ipcHandlers.ts`。
    - **任务**: 导入 `registerWindowHandlers` 函数并在 `registerIpcHandlers` 中调用它，将主 `BrowserWindow` 实例传递给它。

5.  **更新 Preload 脚本**:
    - **位置**: `src/preload/index.d.ts` 和 `src/preload/index.ts`。
    - **任务**:
      - 在 `index.d.ts` 的 `ExposedAPI` 接口中添加 `minimizeWindow`, `maximizeWindow`, `closeWindow` 以及事件监听 `onWindowStateChange(callback: (state: 'maximized' | 'unmaximized') => void)`。
      - 在 `index.ts` 的 `api` 对象中实现这些方法，使其通过 `ipcRenderer.invoke` 或 `ipcRenderer.on` 与主进程通信。

6.  **封装前端 API**:
    - **位置**: `src/renderer/src/api/windowApi.ts` (如果文件不存在则创建)。
    - **任务**: 封装对 `window.api` 中新暴露的窗口操作方法的调用。

7.  **实现 UI 组件**:
    - **位置**: `src/renderer/src/components/TitleBar.vue` (新文件)。
    - **任务**:
      - 创建一个包含应用标题和三个窗口操作按钮（最小化、最大化/还原、关闭）的 Vue 组件。
      - 使用一个本地状态（如 `isMaximized`）来跟踪窗口的最大化状态。
      - 组件的根元素应设置 `-webkit-app-region: drag` CSS 属性，以允许用户通过拖动标题栏来移动窗口。
      - 按钮等可交互元素需要设置 `-webkit-app-region: no-drag`，以确保它们是可点击的。
      - 在 `onMounted` 钩子中，调用 `windowApi` 的 `onWindowStateChange` 来监听主进程发来的窗口状态变化事件，并据此更新 `isMaximized` 状态。
      - 为三个按钮绑定点击事件，分别调用 `windowApi` 中对应的 `minimizeWindow`, `maximizeWindow`, `closeWindow` 方法。

8.  **集成 UI 组件**:
    - **位置**: `src/renderer/src/App.vue`。
    - **任务**:
      - 在应用的根组件 `App.vue` 的布局中，将新创建的 `TitleBar.vue` 组件放置在顶部。
      - 调整整体布局，确保标题栏和应用内容正确显示。

9.  **测试**:
    - **手动测试**:
      - 启动应用，验证窗口是否无边框。
      - 点击最小化、最大化、关闭按钮，验证功能是否正常。
      - 在最大化和非最大化状态之间切换，验证最大化/还原按钮的图标或状态是否正确更新。
      - 拖动标题栏区域，验证窗口是否可以被移动。
      - 尝试拖动按钮等不可拖动区域，验证窗口不会移动。
