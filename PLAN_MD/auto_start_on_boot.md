### 功能开发计划：开机自启

本计划旨在为 CognitoOcean 应用添加开机自启的设置选项。用户将能够在设置界面通过一个开关来控制应用是否在操作系统启动时自动运行。

**相关文件分析**：

- 设置为 `src/renderer/src/views/Settings.vue`。此功能将添加到主应用中，因此将主要修改后者及其相关组件。
- `electron-store` 已在项目中使用，非常适合存储此功能的开关状态。
- Electron 的 `app.getLoginItemSettings()` 和 `app.setLoginItemSettings()` 是实现此功能的核心 API。

---

### 开发流程步骤

1.  **设计 UI (已完成)**:
    - **UI 方案**: 在 `src/renderer/src/views/Settings.vue` 视图中，添加一个 Ant Design Vue 的 `a-switch` 开关组件。
    - **用户交互**: 用户点击开关，状态（开启/关闭）被持久化，并立即生效。

2.  **设计后台功能逻辑 (Service 层)**:
    - **位置**: 在 `src/main/features/services/` 目录下创建 `settings` 目录及 `index.ts` 文件。
    - **任务**: 创建 `SettingsService` 类，包含两个方法：
      - `getAutoStartStatus()`: 使用 `app.getLoginItemSettings()` 获取当前应用的开机自启状态。
      - `setAutoStart(isEnabled: boolean)`: 使用 `app.setLoginItemSettings()` 设置应用的开机自启状态。同时，使用 `electron-store` 持久化存储该设置，以便在应用启动时读取。

3.  **开发 Handler 层**:
    - **位置**: 在 `src/main/features/handlers/` 目录下创建 `settings` 目录及 `index.ts` 文件。
    - **任务**: 创建并导出一个 `registerSettingsHandlers` 函数，该函数注册以下 IPC 处理器：
      - `settings:get-auto-start`: 调用 `SettingsService.getAutoStartStatus()`。
      - `settings:set-auto-start`: 接收一个布尔值参数，调用 `SettingsService.setAutoStart()`。

4.  **注册 IPC 处理器**:
    - **位置**: `src/main/features/handlers/ipcHandlers.ts`。
    - **任务**: 导入 `registerSettingsHandlers` 函数并在 `registerIpcHandlers` 中调用它。

5.  **更新 Preload 脚本**:
    - **位置**: `src/preload/index.d.ts` 和 `src/preload/index.ts`。
    - **任务**:
      - 在 `index.d.ts` 的 `ExposedAPI` 接口中添加 `getAutoStartStatus: () => Promise<boolean>` 和 `setAutoStart: (isEnabled: boolean) => Promise<void>`。
      - 在 `index.ts` 的 `api` 对象中实现这两个方法，使其通过 `ipcRenderer.invoke` 调用对应的 IPC 通道。

6.  **封装前端 API**:
    - **位置**: `src/renderer/src/api/`。
    - **任务**: 创建 `settingsApi.ts` 文件，封装对 `window.api.getAutoStartStatus` 和 `window.api.setAutoStart` 的调用。

7.  **更新前端状态管理 (Pinia Store)**:
    - **位置**: `src/renderer/src/stores/settingsStore.ts`。
    - **任务**: （如果该文件不存在，则创建它）
      - 添加一个 `isAutoStartEnabled` 的 `ref` 状态。
      - 创建 `fetchAutoStartStatus` action，调用 `settingsApi.getAutoStartStatus` 来初始化状态。
      - 创建 `toggleAutoStart` action，接收新的开关状态，调用 `settingsApi.setAutoStart`，并在成功后更新 `isAutoStartEnabled` 的值。

8.  **实现并集成 UI**:
    - **位置**: `src/renderer/src/views/Settings.vue` (或其子组件)。
    - **任务**:
      - 从 `settingsStore` 获取 `isAutoStartEnabled` 状态和 `toggleAutoStart` action。
      - 将 `a-switch` 组件的 `v-model` 绑定到 `isAutoStartEnabled`。
      - 在 `onMounted` 生命周期钩子中调用 `fetchAutoStartStatus` 来加载初始状态。
      - 监听开关的 `@change` 事件，调用 `toggleAutoStart` action。

9.  **应用启动逻辑**:
    - **位置**: `src/main/index.ts`。
    - **任务**: 在应用启动时，读取 `electron-store` 中保存的开机自启设置。如果设置为开启，但由于某些原因（如用户手动禁用）实际并未开启，则调用 `app.setLoginItemSettings()` 重新设置。这一步确保了设置的可靠性。

10. **测试**:
    - **手动测试**: 启动应用，在设置页面打开/关闭开关，重启电脑，验证应用是否按预期自启。
