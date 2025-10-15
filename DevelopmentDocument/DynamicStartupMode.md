### **功能名称：动态启动模式 (Dynamic Startup Mode)**

#### **1. 功能概述**

本功能旨在提供一种动态切换应用启动模式的机制，允许用户通过前端设置界面，决定应用是以“标准应用模式”启动，还是以“纯后端服务模式”启动。该设置为持久化设置，切换模式后需要重启应用才能生效。

- **应用模式 (App Mode)**: 默认模式。启动完整的 Electron 应用，包含图形用户界面 (UI)，并使用最高效的 `puppeteer.connect` 方式与自身浏览器进程通信。
- **服务模式 (Server Mode)**: 启动纯 Node.js 后端服务，不创建任何 UI 窗口。此模式下，应用将启动一个独立的 Express 服务器，并使用 `puppeteer.launch` 方式来管理独立的浏览器进程。

#### **2. 技术方案**

1.  **配置持久化**: 使用 `electron-conf` 在本地存储用户选择的启动模式（`startupMode: 'app' | 'server'`）。
2.  **UI 交互**: 在前端设置页面提供一个下拉选择框。当用户更改选项时，通过 IPC 通道将新值传递给主进程。
3.  **主进程处理**: 主进程接收到设置更改后，将新模式写入 `electron-conf`，并弹出一个对话框，提示用户需要重启应用以使设置生效。如果用户同意，则调用 `app.relaunch()` 和 `app.exit()` 重启应用。
4.  **启动逻辑**: 应用在 `app.whenReady()` 生命周期的最开始，从 `electron-conf` 读取 `startupMode` 配置。
    -   如果为 `app` 模式，则通过 `app.commandLine.appendSwitch()` 开启远程调试端口 (`9222`)，然后正常创建窗口和UI。
    -   如果为 `server` 模式，则不创建窗口，而是调用 `startServer()` 启动 Express 服务器。
5.  **Puppeteer 混合实现**: 重构 `PuppeteerService`，使其包含一个 `initialize()` 方法。该方法会根据当前的 `startupMode`，智能地决定是使用 `puppeteer.connect()`（应用模式）还是 `puppeteer.launch()`（服务模式）。

#### **3. 数据库设计**

本功能不涉及数据库变更。

#### **4. API 设计 (IPC)**

- **通道名称**: `settings:set-startup-mode`
- **请求参数**: `mode: 'app' | 'server'`
- **响应**: `Promise<{ success: boolean, message?: string }>`

#### **5. 模块划分**

- **类型定义**: `src/renderer/src/types/setting.ts` - 修改 `SystemConfig` 类型。
- **主进程启动器**: `src/main/main.ts` & `src/main/index.ts` - 实现核心启动判断逻辑。
- **设置处理器**: `src/main/features/handlers/settings/index.ts` - 添加 IPC 处理器以保存设置和触发重启。
- **Puppeteer 服务**: `src/main/features/services/puppeteer/puppeteer.ts` - 实现混合连接/启动逻辑。
- **前端设置页面**: `src/renderer/src/views/System/Settings.vue` (路径待确认) - 添加 UI 下拉框和调用逻辑。
