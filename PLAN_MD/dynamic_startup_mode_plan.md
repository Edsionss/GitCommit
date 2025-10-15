### **动态启动模式实施方案**

#### **1. 核心思路：使用环境变量作为开关**

我们将使用一个环境变量（例如 `VITE_START_MODE`）来决定应用的启动模式。

*   `VITE_START_MODE = 'app'` (或未设置): 启动**应用模式**。
*   `VITE_START_MODE = 'server'`: 启动**服务模式**。

使用 `VITE_` 前缀是 Vite 的一个约定，可以确保这个变量在主进程和渲染进程中都可用（尽管我们主要在主进程中使用它）。

#### **2. 实施步骤**

**步骤 1: 修改 `package.json` 添加新的启动脚本**

为了方便切换模式，我们在 `package.json` 的 `scripts` 部分添加新的命令。为了保证跨平台兼容性（Windows, macOS, Linux），推荐使用 `cross-env` 这个库。

1.  **首先，安装 `cross-env`:**
    ```bash
    pnpm add -D cross-env
    ```

2.  **然后，修改 `scripts`:**

    ```json
    // package.json (scripts 部分)
    "scripts": {
      // ... 其他脚本
      "dev": "set NODE_OPTIONS=--enable-source-maps --no-warnings && set CHCP=65001 && cross-env VITE_START_MODE=app electron-vite dev",
      "dev:app": "pnpm dev",
      "dev:server": "set NODE_OPTIONS=--enable-source-maps --no-warnings && set CHCP=65001 && cross-env VITE_START_MODE=server electron-vite dev",
      // ... 其他脚本
    },
    ```
    *   `dev` 或 `dev:app`: 明确设置为应用模式。
    *   `dev:server`: 设置为服务模式。

**步骤 2: 修改主入口文件 `src/main/index.ts`**

这是最关键的一步。我们将在这里读取环境变量，并根据其值执行不同的启动逻辑。

```typescript
// src/main/index.ts (修改后的 app.whenReady 部分)

// ... (文件顶部其他 import 和函数保持不变)

app.whenReady().then(async () => {
  // 设置应用模型ID
  electronApp.setAppUserModelId('com.electron')

  // 监听窗口快捷键
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // --- 核心启动逻辑 ---
  const startMode = process.env.VITE_START_MODE || 'app'
  console.log(`[Startup] Launching in '${startMode}' mode.`)

  if (startMode === 'server') {
    // --- 服务模式 ---
    // 1. 启动 API 服务器
    await startServer()
    // 2. 不创建任何 Electron 窗口
    console.log('[Startup] Server mode enabled. UI will not be created.')
  } else {
    // --- 应用模式 (默认) ---
    // 1. 注册 IPC 处理器 (这是应用模式的核心通信方式)
    //    我们的 registerIpcHandlers 函数现在会注册所有处理器，确保功能完整
    whenReady() // 这似乎是您项目中原有的一个生命周期函数，我们保留它

    // 2. 创建主窗口
    showMainWindow && createWindow()

    // 3. 处理 macOS 的激活事件
    app.on('activate', function () {
      activate()
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  }
})

// ... (文件底部的 will-quit 和 window-all-closed 事件保持不变)
```

**步骤 3: 调整 `will-quit` 事件处理**

我们需要确保只有在服务器启动了的情况下才去关闭它。

```typescript
// src/main/index.ts (修改后的 will-quit 部分)

app.on('will-quit', async () => {
  const startMode = process.env.VITE_START_MODE || 'app'
  
  // 只在服务模式或未来可能存在的混合模式下才需要停止服务器
  if (startMode === 'server') {
    await stopServer()
  }

  // 即将退出的周期
  willQuit()
})
```

#### **3. 最终效果**

完成以上修改后，您将获得：

*   运行 `pnpm dev` 或 `pnpm dev:app`:
    *   启动完整的 Electron 应用。
    *   **不启动** Express HTTP 服务器。
    *   所有通信通过**IPC**完成。
*   运行 `pnpm dev:server`:
    *   **只启动** Express HTTP 服务器。
    *   **不创建**任何 Electron 窗口。
    *   您可以通过 `http://localhost:3001` 访问所有在 `apiRegistry` 中定义的 API。

这个方案完美地满足了您的需求，提供了极大的灵活性，同时保持了代码的整洁。
