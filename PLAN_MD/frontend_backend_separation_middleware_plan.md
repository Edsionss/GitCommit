### **CognitoOcean 项目前后端分离改造方案**

#### **1. 核心思路与可行性分析**

当前 CognitoOcean 项目是典型的 Electron 应用架构：
*   **后端:** Node.js 主进程 (`src/main`)，负责系统级操作、文件I/O、数据库交互等。
*   **前端:** Vue 3 渲染进程 (`src/renderer`)，负责UI展示和用户交互。
*   **通信:** 通过 Electron 的 IPC (Inter-Process Communication) 机制 (`ipcMain` 和 `ipcRenderer`) 进行前后端通信。

**前后端分离改造的核心思路是：** 在 Electron 主进程中启动一个轻量级的 Web 服务器（例如使用 Express.js 或 Fastify），将原有的 IPC 通信模式替换为标准的 HTTP API 调用。

**可行性：** **完全可行**。主进程本质上就是一个 Node.js 环境，具备运行任何 Node.js Web 框架的能力。渲染进程（本质上是 Chromium 浏览器环境）也原生支持 `fetch` 或 `axios` 等 HTTP 客户端。

#### **2. 优缺点分析**

**优点:**

1.  **架构清晰，职责分离:**
    *   前端彻底成为一个纯粹的客户端，只关心 UI 和用户体验，通过 API 与后端交互。
    *   后端成为一个标准的 API Server，专注于业务逻辑和数据处理。
2.  **技术栈标准化:**
    *   摆脱 Electron 特有的 IPC 通信，转向业界通用的 RESTful API 或 GraphQL，降低新成员上手门槛。
3.  **可扩展性与复用性强:**
    *   **未来可直接部署为 Web 应用**：这是最大的优势。后端 API 可以独立部署到服务器，前端可以部署为静态网站，让您的应用从桌面端无缝扩展到 Web 端。
    *   API 可以被其他客户端（如移动 App、CLI 工具）复用。
4.  **开发与调试便利:**
    *   可以使用 Postman、Insomnia 等工具直接调试后端 API，而无需启动整个 Electron 应用。
    *   前端可以使用 mock server 或直接连接远程开发服务器进行独立开发。

**缺点:**

1.  **增加复杂性:**
    *   引入了新的依赖（如 Express.js）和一层网络抽象。
    *   需要管理 API 路由、端口、CORS（跨域资源共享）等 Web 服务器相关配置。
2.  **性能开销:**
    *   本地 HTTP 通信相比 IPC 会有轻微的性能损耗。对于大多数应用场景，这种延迟可以忽略不计，但对于需要极高频率和低延迟通信的功能，IPC 可能更优。
3.  **安全考虑:**
    *   需要在本地启动一个端口，虽然可以配置为只监听 `localhost`，但仍需确保 API 的安全性，防止本地其他恶意软件的访问。
4.  **改造工作量:**
    *   需要将现有所有 `ipcMain` 处理器改造为 API 路由，并将所有 `ipcRenderer` 调用替换为 HTTP 请求。这是一个不小的工作量。

#### **3. 实施方案**

以下是具体的改造步骤：

**步骤 1: 安装依赖**

首先，我们需要为项目添加 Web 框架。推荐使用 `express`，因为它轻量且社区成熟。

```bash
pnpm add express cors
pnpm add -D @types/express @types/cors
```

**步骤 2: 创建服务器中间件**

在 `src/main` 目录下创建一个新的文件，用于承载我们的 API 服务器。例如 `src/main/server.ts`。

```typescript
// src/main/server.ts

import express, { Express } from 'express'
import cors from 'cors'
import { app as electronApp } from 'electron'

const PORT = 3001 // 选择一个未被占用的端口

let serverInstance: any = null

function createServer(): Express {
  const app = express()

  // 使用 cors 中间件，允许来自前端的请求
  // 在生产环境中，为了安全，应该更精确地配置来源
  app.use(cors({ origin: '*' })) // 示例：允许所有来源

  // 解析 JSON 请求体
  app.use(express.json())

  // --- API 路由定义 ---
  // 将原来 ipcHandlers.ts 中的逻辑迁移到这里

  // 示例：获取应用版本号
  app.get('/api/app/version', (req, res) => {
    res.json({ success: true, data: electronApp.getVersion() })
  })

  // 示例：一个模拟原来 Git 历史的路由
  app.get('/api/git/log', async (req, res) => {
    try {
      // 在这里调用你的 GitService 逻辑
      // const gitService = new GitService();
      // const history = await gitService.getCommitHistory(req.query.path);
      // res.json({ success: true, data: history });
      res.json({ success: true, data: [{ id: 'mock-commit-1', message: 'feat: initial commit' }] })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  })

  return app
}

export function startServer(): Promise<void> {
  return new Promise((resolve) => {
    const server = createServer()
    serverInstance = server.listen(PORT, () => {
      console.log(`✅ API server is running at http://localhost:${PORT}`)
      resolve()
    })
  })
}

export function stopServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (serverInstance) {
      serverInstance.close((err: any) => {
        if (err) {
          return reject(err)
        }
        console.log('API server stopped.')
        resolve()
      })
    } else {
      resolve()
    }
  })
}
```

**步骤 3: 在 Electron 主进程中启动服务器**

修改 `src/main/index.ts`，在应用启动时和退出时分别启动和停止 API 服务器。

```typescript
// src/main/index.ts
import { app, BrowserWindow } from 'electron'
import { startServer, stopServer } from './server' // 引入服务器控制函数

// ... 其他 import

app.whenReady().then(async () => {
  // ... 其他 onReady 逻辑
  
  // 启动 API 服务器
  await startServer()

  createWindow() // 创建窗口
})

// 在应用退出前关闭服务器
app.on('will-quit', async () => {
  await stopServer()
})

// ... 其他代码
```

**步骤 4: 改造前端通信方式**

在前端，你需要将所有 `window.api` 的调用改为 HTTP 请求。推荐使用 `axios` 并创建一个统一的 API 客户端。

1.  **安装 axios:**
    ```bash
    pnpm add axios
    ```

2.  **创建 API Client:**
    在 `src/renderer/src/api` 目录下创建一个 `client.ts` 文件。

    ```typescript
    // src/renderer/src/api/client.ts
    import axios from 'axios'

    const apiClient = axios.create({
      baseURL: 'http://localhost:3001/api', // 统一的 API 前缀
      timeout: 5000
    })

    apiClient.interceptors.response.use(
      (response) => {
        // 后端返回的数据结构是 { success: boolean, data: any, message?: string }
        if (response.data && response.data.success) {
          return response.data.data
        }
        return Promise.reject(new Error(response.data.message || '请求失败'))
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    export default apiClient
    ```

3.  **替换原有调用:**
    将类似下面的代码：

    ```typescript
    // 旧代码
    const version = await window.api.getAppVersion()
    ```

    改造为：

    ```typescript
    // 新代码
    import apiClient from '@/api/client'

    const versionInfo = await apiClient.get('/app/version') // 假设后端返回 { version: 'x.x.x' }
    // 或者
    const data = await apiClient.get('/app/version') // apiClient 拦截器处理后直接返回 data
    ```

**步骤 5: 迁移后端逻辑**

将 `src/main/features/handlers/ipcHandlers.ts` 文件中注册的所有处理器函数，逐个迁移到 `src/main/server.ts` 的 Express 路由中。

*   **原 IPC Handler:**
    ```typescript
    ipcMain.handle('git:get-commit-history', (_, repoPath) => {
      return gitService.getCommitHistory(repoPath)
    })
    ```

*   **新 Express Route:**
    ```typescript
    // 在 server.ts 中
    app.get('/api/git/commit-history', async (req, res) => {
      try {
        const repoPath = req.query.path as string
        const history = await gitService.getCommitHistory(repoPath)
        res.json({ success: true, data: history })
      } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
      }
    })
    ```

#### **4. 结论与建议**

将 CognitoOcean 项目改造为基于服务器中间件的前后端分离架构是**完全可行且具有长远价值的**。它能显著提升项目的架构水平、可扩展性和可维护性。

**建议：**

*   **渐进式改造:** 由于工作量较大，可以采用渐进式策略。先搭建起服务器框架，然后逐个模块地将 IPC 通信迁移到 HTTP API，新功能则直接基于新架构开发。
*   **统一 API 规范:** 制定统一的 API 路由、请求/响应格式规范，保证项目的一致性。
*   **考虑安全:** 在生产环境中，务必收紧 CORS策略，例如只允许来自 `app://.` 协议的请求。
