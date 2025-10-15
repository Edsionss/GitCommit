### **动态创建服务器中间件方案**

#### **1. 核心思想**

核心思想是创建一个**统一的 API 注册表 (API Registry)**。这个注册表将成为我们所有后端方法的“唯一真实来源”（Single Source of Truth）。

然后，我们分别用这个注册表来：
1.  **动态注册所有的 `ipcMain` 处理器**（保持现有功能不变）。
2.  **动态创建所有的 Express API 路由**。

这样，我们只需要在一个地方定义我们的 API，两套通信系统（IPC 和 HTTP）就可以同时使用它。

#### **2. 实施步骤**

**步骤 1: 创建中央 API 注册表**

我们不再将处理函数直接写在 `ipcHandlers.ts` 中，而是创建一个新的文件来定义它们。例如 `src/main/features/handlers/apiRegistry.ts`。

这个文件会导出一个包含了所有 API 定义的数组。每个定义都包含：
*   `channel`: IPC 通道名称，也将用于生成 API 路径。
*   `method`: HTTP 方法 ('get' 或 'post')。
*   `handler`: 实际的业务逻辑函数。

```typescript
// src/main/features/handlers/apiRegistry.ts

import { IpcMainInvokeEvent } from 'electron'
import { applicationService, gitService } from '@services/index' // 假设从这里导入服务

// 定义 API 处理器函数的类型
// (event, ...args) 是 IpcMain.handle 的标准签名
type ApiHandler = (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any>

// 定义我们的 API 注册表条目类型
export interface ApiDefinition {
  channel: string
  method: 'get' | 'post'
  handler: ApiHandler
}

// 创建并导出 API 注册表
export const apiRegistry: ApiDefinition[] = [
  {
    channel: 'app:get-version',
    method: 'get',
    // 注意：为了统一，即使 handler 不用 event，也保持签名一致
    handler: async (_event) => applicationService.getAppVersion()
  },
  {
    channel: 'git:get-commit-history',
    method: 'get',
    handler: async (_event, repoPath: string) => gitService.getCommitHistory(repoPath)
  },
  {
    channel: 'some:post-data',
    method: 'post',
    handler: async (_event, data: { name: string; value: number }) => {
      // ...处理 POST 数据的逻辑
      console.log('Received data:', data)
      return { success: true, received: data }
    }
  }
  // ... 在这里添加所有其他的 API
]
```

**步骤 2: 修改 `ipcHandlers.ts` 以使用注册表**

现在 `ipcHandlers.ts` 的作用变得非常简单：它只需要遍历注册表并注册所有 IPC 处理器。

```typescript
// src/main/features/handlers/ipcHandlers.ts

import { ipcMain } from 'electron'
import { apiRegistry } from './apiRegistry' // 导入注册表

export function registerIpcHandlers() {
  console.log('Registering IPC handlers...')
  apiRegistry.forEach(({ channel, handler }) => {
    ipcMain.handle(channel, handler)
  })
  console.log(`✅ Registered ${apiRegistry.length} IPC handlers.`)
}
```
**注意:** 原有的 `createWindow` 或 `app.whenReady` 中调用 `registerIpcHandlers()` 的逻辑保持不变。

**步骤 3: 修改 `server.ts` 以动态创建路由**

这是最关键的一步。我们的 Express 服务器现在也将导入 `apiRegistry` 并用它来动态生成所有 API 路由。

```typescript
// src/main/server.ts (修改后的版本)

import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import { apiRegistry } from '@features/handlers/apiRegistry' // 导入注册表

// ... (startServer, stopServer, PORT 等代码保持不变)

function createServer(): Express {
  const app = express()
  app.use(cors({ origin: '*' }))
  app.use(express.json())

  console.log('Creating dynamic API routes...')

  // 遍历 API 注册表来创建路由
  apiRegistry.forEach(({ channel, method, handler }) => {
    // 将 IPC channel 'foo:bar' 转换为 API 路径 '/foo/bar'
    const path = `/api/${channel.replace(/:/g, '/')}`

    // 创建一个通用的 Express 处理器，它会调用我们原始的 IPC 处理器
    const expressHandler = async (req: Request, res: Response) => {
      try {
        let args: any[] = []
        // 根据 HTTP 方法决定从哪里获取参数
        if (method === 'get') {
          // 对于 GET, 参数来自 req.query
          // 注意：所有参数都会被当作字符串，需要时请在 handler 内部转换
          args = Object.values(req.query)
        } else {
          // 对于 POST, 参数来自 req.body
          // 我们假设前端会将所有参数打包成一个数组或对象
          // 如果是对象，我们取其 values
          args = Array.isArray(req.body) ? req.body : Object.values(req.body)
        }

        // 调用原始的 handler，第一个参数 event 传 null，因为它在 HTTP 上下文中不存在
        const result = await handler(null as any, ...args)
        res.json({ success: true, data: result })
      } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
      }
    }

    // 动态注册路由
    app[method](path, expressHandler)
    console.log(`  -> Registered route: [${method.toUpperCase()}] ${path}`)
  })

  console.log(`✅ Created ${apiRegistry.length} dynamic API routes.`)
  return app
}

// ... (startServer 和 stopServer 函数不变)
```

**步骤 4: 前端如何传递参数**

现在前端调用时，需要根据 `method` 来决定如何传递参数。

*   **对于 `GET` 请求 (`git:get-commit-history`)**:
    参数需要作为 query params 发送。

    ```typescript
    // 前端调用
    import apiClient from '@/api/client'

    // 原始调用: window.api['git:get-commit-history']('/path/to/repo')
    // 新的调用:
    const history = await apiClient.get('/git/commit-history', {
      params: {
        repoPath: '/path/to/repo' // 参数名可以任意，后端按顺序接收
      }
    })
    ```

*   **对于 `POST` 请求 (`some:post-data`)**:
    参数需要放在 request body 中。

    ```typescript
    // 前端调用
    import apiClient from '@/api/client'

    // 原始调用: window.api['some:post-data']({ name: 'test', value: 123 })
    // 新的调用:
    const result = await apiClient.post('/some/post-data', {
      name: 'test',
      value: 123
    })
    ```

#### **3. 优势总结**

这种动态创建的方式有巨大的优势：

*   **DRY (Don't Repeat Yourself):** API 的业务逻辑只写一次。
*   **单一来源:** `apiRegistry.ts` 成为所有后端能力的核心定义文件，非常清晰。
*   **易于维护:** 增加或修改一个 API，只需要在 `apiRegistry.ts` 中操作即可，IPC 和 HTTP 会自动同步更新。
*   **平滑迁移:** 在整个迁移过程中，IPC 和 HTTP 可以长期共存，您可以逐步替换前端的调用方式，而无需一次性重构。
