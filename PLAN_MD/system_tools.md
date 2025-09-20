
### 功能开发计划：系统工具页面

本计划旨在为 CognitoOcean 应用开发一个全新的“系统工具”模块。该模块将作为一个新页面，提供一系列与操作系统底层交互的便捷功能。

**初期功能包含：**
1.  **定时关机**: 用户可以设置一个倒计时，在指定时间后自动关闭计算机。
2.  **环境变量设置**: 提供一个便捷的界面，用于设置和修改特定的环境变量，初期目标为 `GEMINI_API_KEY` 和 `CLAUDE_API_KEY`。

--- 

### 开发流程步骤

1.  **创建新路由与菜单项**:
    - **任务**: 为了让新页面能够被访问，需要在数据库 `routes_menu` 表中添加一条新的菜单记录。这可以通过应用的“菜单管理”功能手动添加，或通过 SQL 语句直接插入。
    - **建议 SQL (示例)**:
      ```sql
      INSERT INTO routes_menu (id, parent_id, path, name, component_path, meta, menu_order, menu_icon, hide)
      VALUES ('sys-tools-01', NULL, '/system-tools', 'SystemTools', 'SystemTools', '{"title":"系统工具","keepAlive":"1"}', 900, 'ToolOutlined', '0');
      ```

2.  **设计后台功能逻辑 (Service 层)**:
    - **位置**: `src/main/features/services/system_tools/index.ts` (如果目录不存在则创建)。
    - **任务**: 创建 `SystemToolsService` 类，包含以下方法：
        - `scheduleShutdown(minutes: number)`: 接收一个分钟数，执行 `shutdown -s -t <seconds>` 命令。
        - `cancelShutdown()`: 执行 `shutdown -a` 命令。
        - `getEnvVar(key: string)`: 读取指定环境变量的值。可以使用 `process.env[key]` 或执行 `echo %KEY%` 来获取。
        - `setEnvVar(key: string, value: string)`: 设置指定环境变量。将复用 `src/main/features/services/windows/evn.ts` 中的 `setPermanentEnvVar` 逻辑，并将其封装成一个更通用的模块。

3.  **开发 Handler 层**:
    - **位置**: `src/main/features/handlers/system_tools/index.ts` (如果目录不存在则创建)。
    - **任务**: 创建并导出 `registerSystemToolsHandlers` 函数，注册以下 IPC 处理器：
        - `system-tools:schedule-shutdown`
        - `system-tools:cancel-shutdown`
        - `system-tools:get-env-var`
        - `system-tools:set-env-var`

4.  **注册 IPC 处理器与更新 Preload**:
    - **IPC**: 在 `src/main/features/handlers/ipcHandlers.ts` 中导入并调用 `registerSystemToolsHandlers`。
    - **Preload**: 在 `src/preload/index.d.ts` 和 `src/preload/index.ts` 中暴露上述四个新的 API 方法。

5.  **封装前端 API**:
    - **位置**: `src/renderer/src/api/systemToolsApi.ts`。
    - **任务**: 创建 `systemToolsApi` 对象，封装对 `window.api` 中新暴露的四个方法的调用。

6.  **创建前端状态管理 (Pinia Store)**:
    - **位置**: `src/renderer/src/stores/systemToolsStore.ts`。
    - **任务**: 创建一个新的 store 用于管理系统工具页面的状态，包括：
        - `geminiApiKey` 和 `claudeApiKey` 的 `ref` 状态。
        - `actions` 用于调用 API 来获取和设置这些 key。

7.  **实现 UI 页面**:
    - **位置**: `src/renderer/src/views/SystemTools.vue`。
    - **任务**: 创建全新的 `.vue` 文件作为页面主体。
        - **定时关机部分**: 使用 `a-input-number` 让用户输入分钟数，提供“启动”和“取消”两个 `a-button`。可以增加一个状态显示区域。
        - **环境变量部分**: 使用两个 `a-card`，每个卡片中包含一个 `a-input-password` (用于隐藏 key) 和一个“保存”按钮。
        - 在 `onMounted` 钩子中，调用 store 的 action 来加载环境变量的初始值。
